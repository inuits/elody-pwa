import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises, mount, shallowMount } from "@vue/test-utils";
import { reactive } from "vue";

const mocks = vi.hoisted(() => ({
  saveScope: vi.fn(),
  editState: undefined as any,
  form: undefined as any,
  locked: false,
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, te: () => false }),
}));
vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({ getForm: () => mocks.form }),
}));
vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => mocks.editState,
}));
vi.mock("@/composables/useFieldLock", async () => {
  const { computed } = await import("vue");
  return { useFieldLock: () => ({ isLocked: computed(() => mocks.locked) }) };
});
vi.mock("@/composables/useConditionalValidation", () => ({
  useConditionalValidation: () => ({ conditionalFieldIsAvailable: () => true }),
}));
vi.mock("vee-validate", () => ({
  useField: () => ({ errorMessage: { value: "" } }),
}));
vi.mock("@/composables/useScopedSave", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/composables/useScopedSave")>()),
  saveScope: mocks.saveScope,
}));
vi.mock("@/main", () => ({ apolloClient: {} }));
vi.mock("@/components/base/BaseDatePicker.vue", () => ({
  default: { template: "<div />" },
}));
vi.mock("@/components/base/BaseResizableTextarea.vue", () => ({
  default: { template: "<div />" },
}));

import EntityElementCoordinateEdit from "../EntityElementCoordinateEdit.vue";
import { useEditScope } from "@/composables/useEditScope";

const baseProps = (props: Record<string, unknown> = {}) => ({
  fieldKey: "gps_coordinates",
  label: "metadata.labels.gps-coordinates",
  value: { latitude: "51.05", longitude: "3.72" },
  inputField: { type: "number" } as any,
  entityUuid: "SITE-1",
  ...props,
});

const getWrapper = (permitted?: boolean) =>
  shallowMount(EntityElementCoordinateEdit, {
    props: baseProps(permitted === undefined ? {} : { permitted }),
  });

const isRendered = (wrapper: ReturnType<typeof getWrapper>) =>
  wrapper.find('[data-cy="metadata-wrapper"]').exists();

const inlineEditorStub = {
  name: "InlineFieldEditor",
  props: ["type", "modelValue", "label", "saving", "errorMessage", "dirty"],
  emits: ["save", "cancel"],
  template: "<div data-cy='inline-editor-stub'><slot name='input' /></div>",
};

const entityFormData = { id: "SITE-1", collection: "entities", onSaved: vi.fn() };

const mountField = (props: Record<string, unknown> = {}) =>
  mount(EntityElementCoordinateEdit, {
    props: baseProps(props),
    global: {
      provide: { entityFormData },
      stubs: {
        InlineFieldEditor: inlineEditorStub,
        MetadataTitle: { props: ["metadata"], template: "<p data-cy='metadata-label'>{{ metadata.label }}</p>" },
        unicon: true,
      },
    },
    attachTo: document.body,
  });

describe("EntityElementCoordinateEdit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.editState = reactive({ isEdit: false, permittedEditMode: "edit" });
    mocks.form = { setFieldValue: vi.fn(), resetField: vi.fn() };
    mocks.locked = false;
    const scope = useEditScope();
    if (scope.activeScope.value) scope.release(scope.activeScope.value.id);
    document.body.innerHTML = "";
  });

  it("renders a field the graphql layer marked permitted", () => {
    expect(isRendered(getWrapper(true))).toBe(true);
  });

  it("hides a field the graphql layer marked not permitted", () => {
    expect(isRendered(getWrapper(false))).toBe(false);
  });

  // A client that configures no read gate selects no verdict either, and an
  // unconfigured field was always shown.
  it("renders a field carrying no verdict at all", () => {
    expect(isRendered(getWrapper(undefined))).toBe(true);
  });

  it("has the same padding as a field row, so it lines up with the others", () => {
    expect(mountField().find('[data-cy="metadata-wrapper"]').classes()).toEqual(
      expect.arrayContaining(["py-2", "px-2"]),
    );
  });

  describe("at rest", () => {
    it("shows the value as text, like any field row", () => {
      const wrapper = mountField();
      expect(wrapper.find('[data-cy="field-value"]').text()).toContain("51.05, 3.72");
      expect(wrapper.find("input").exists()).toBe(false);
    });

    it("shows the empty value when there are no coordinates", () => {
      const wrapper = mountField({ value: undefined });
      expect(wrapper.find('[data-cy="field-value"]').text()).toContain("No value");
    });

    it("is an edit button with the pencil when the user may update the entity", () => {
      const value = mountField().find('[data-cy="field-value"]');
      expect(value.attributes("role")).toBe("button");
      expect(value.attributes("aria-label")).toBe(
        "metadata.labels.gps-coordinates, edit",
      );
      expect(value.find('[data-cy="field-edit-pencil"]').exists()).toBe(true);
    });

    it("is plain text when the user may not update the entity", () => {
      mocks.editState.permittedEditMode = "read";
      const value = mountField().find('[data-cy="field-value"]');
      expect(value.attributes("role")).toBeUndefined();
      expect(value.find('[data-cy="field-edit-pencil"]').exists()).toBe(false);
    });

    it.each([
      ["marked non-editable", { nonEditableField: true }, () => {}],
      ["read-only for the user", { readOnly: true }, () => {}],
      ["locked", {}, () => (mocks.locked = true)],
    ])("is plain text when the field is %s", (_reason, props, arrange) => {
      arrange();
      const value = mountField(props).find('[data-cy="field-value"]');
      expect(value.attributes("role")).toBeUndefined();
    });

    it("keeps the two inputs in the page-wide edit mode", () => {
      mocks.editState.isEdit = true;
      const wrapper = mountField();
      expect(wrapper.findAll("input")).toHaveLength(2);
      expect(wrapper.find('[data-cy="field-value"]').exists()).toBe(false);
    });
  });

  describe("editing", () => {
    const openEditor = async (props: Record<string, unknown> = {}) => {
      const wrapper = mountField(props);
      await wrapper.find('[data-cy="field-value"]').trigger("click");
      await flushPromises();
      return wrapper;
    };
    const editor = (wrapper: any) => wrapper.findComponent({ name: "InlineFieldEditor" });
    const latitude = (wrapper: any) => wrapper.find('[data-cy="coordinate-latitude"] input');
    const longitude = (wrapper: any) => wrapper.find('[data-cy="coordinate-longitude"] input');

    it("opens the inline editor with a latitude and a longitude input", async () => {
      const wrapper = await openEditor();
      expect(editor(wrapper).exists()).toBe(true);
      expect((latitude(wrapper).element as HTMLInputElement).value).toBe("51.05");
      expect((longitude(wrapper).element as HTMLInputElement).value).toBe("3.72");
      expect(latitude(wrapper).attributes("aria-label")).toBe("Latitude");
      expect(longitude(wrapper).attributes("aria-label")).toBe("Longitude");
      expect(useEditScope().isActive("SITE-1:gps_coordinates")).toBe(true);
    });

    it("is pristine until a coordinate changes", async () => {
      const wrapper = await openEditor();
      expect(editor(wrapper).props("dirty")).toBe(false);
      await latitude(wrapper).setValue("51.1");
      expect(editor(wrapper).props("dirty")).toBe(true);
      expect(useEditScope().hasUnsavedChanges.value).toBe(true);
    });

    it("saves only this field, as numbers", async () => {
      const saved = { id: "SITE-1" };
      mocks.saveScope.mockResolvedValue(saved);
      const wrapper = await openEditor();
      await latitude(wrapper).setValue("51.1");
      editor(wrapper).vm.$emit("save");
      await flushPromises();
      expect(mocks.saveScope).toHaveBeenCalledWith({
        entityId: "SITE-1",
        collection: "entities",
        formInput: {
          metadata: [
            { key: "gps_coordinates", value: { latitude: 51.1, longitude: 3.72 } },
          ],
          relations: [],
          updateOnlyRelations: false,
        },
      });
    });

    it("shows the saved value, hands the entity to the page and closes", async () => {
      const saved = { id: "SITE-1" };
      mocks.saveScope.mockResolvedValue(saved);
      const wrapper = await openEditor();
      await latitude(wrapper).setValue("51.1");
      editor(wrapper).vm.$emit("save");
      await flushPromises();
      expect(wrapper.emitted("update:value")?.[0]).toEqual([
        { latitude: 51.1, longitude: 3.72 },
      ]);
      expect(mocks.form.resetField).toHaveBeenCalledWith(
        "intialValues.gps_coordinates",
        { value: { latitude: 51.1, longitude: 3.72 } },
      );
      expect(entityFormData.onSaved).toHaveBeenCalledWith(saved);
      expect(editor(wrapper).exists()).toBe(false);
    });

    it("clears the coordinates when both inputs are emptied", async () => {
      mocks.saveScope.mockResolvedValue({ id: "SITE-1" });
      const wrapper = await openEditor();
      await latitude(wrapper).setValue("");
      await longitude(wrapper).setValue("");
      editor(wrapper).vm.$emit("save");
      await flushPromises();
      expect(mocks.saveScope.mock.calls[0][0].formInput.metadata).toEqual([
        { key: "gps_coordinates", value: "" },
      ]);
    });

    it.each([
      ["only one coordinate is filled in", "", "3.72"],
      ["the latitude is out of range", "95", "3.72"],
      ["the longitude is out of range", "51.05", "181"],
    ])("refuses to save when %s", async (_reason, lat, lon) => {
      const wrapper = await openEditor();
      await latitude(wrapper).setValue(lat);
      await longitude(wrapper).setValue(lon);
      editor(wrapper).vm.$emit("save");
      await flushPromises();
      expect(mocks.saveScope).not.toHaveBeenCalled();
      expect(editor(wrapper).props("errorMessage")).toBeTruthy();
    });

    it("keeps the editor open with an error when saving fails", async () => {
      mocks.saveScope.mockRejectedValue(new Error("no"));
      const wrapper = await openEditor();
      await latitude(wrapper).setValue("51.1");
      editor(wrapper).vm.$emit("save");
      await flushPromises();
      expect(editor(wrapper).props("errorMessage")).toBe("Saving failed, try again");
    });

    it("releases its edit scope when the field goes away", async () => {
      const wrapper = await openEditor();
      await latitude(wrapper).setValue("51.1");
      wrapper.unmount();
      expect(useEditScope().isActive("SITE-1:gps_coordinates")).toBe(false);
      expect(useEditScope().hasUnsavedChanges.value).toBe(false);
    });

    it("closes without saving on cancel", async () => {
      const wrapper = await openEditor();
      await latitude(wrapper).setValue("51.1");
      editor(wrapper).vm.$emit("cancel");
      await flushPromises();
      expect(editor(wrapper).exists()).toBe(false);
      expect(mocks.saveScope).not.toHaveBeenCalled();
      expect(wrapper.find('[data-cy="field-value"]').text()).toContain("51.05, 3.72");
    });
  });
});
