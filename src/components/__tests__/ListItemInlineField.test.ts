import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { reactive } from "vue";

const mocks = vi.hoisted(() => ({
  saveScope: vi.fn(),
  notify: vi.fn(),
  editState: undefined as any,
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, te: () => false }),
}));
vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => mocks.editState,
}));
vi.mock("@/composables/useScopedSave", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/composables/useScopedSave")>()),
  saveScope: mocks.saveScope,
}));
vi.mock("@/composables/useBaseNotification", () => ({
  useBaseNotification: () => ({ displaySuccessNotification: mocks.notify }),
}));
vi.mock("@/main", () => ({ apolloClient: {} }));

import ListItemInlineField from "@/components/ListItemInlineField.vue";
import { useEditScope } from "@/composables/useEditScope";
import { defineRule } from "vee-validate";

defineRule("no_xss", () => true);
defineRule("required", (value: unknown) =>
  (value !== undefined && value !== null && value !== "" &&
    !(Array.isArray(value) && value.length === 0)) ||
  "Choose a value",
);

const roleField = (overrides: Record<string, unknown> = {}) => ({
  key: "roles",
  label: "metadata.labels.roles",
  value: { formatter: "pill", label: "admin" },
  inputField: {
    type: "dropdownSingleselectMetadata",
    options: [
      { label: "Admin", value: "admin" },
      { label: "Editor", value: "editor" },
    ],
  },
  ...overrides,
});

// The user's side of the user <-> organization relation holds the metadata.
const userRelations = {
  refOrganizations: [
    { key: "ORG-1", type: "refOrganizations", metadata: [{ key: "roles", value: "admin" }] },
  ],
};

const inlineEditorStub = {
  name: "InlineFieldEditor",
  props: ["type", "modelValue", "label", "options", "required", "saving", "errorMessage"],
  emits: ["save", "cancel", "dirty-change", "draft-change"],
  template:
    "<div data-cy='inline-editor-stub'><input type='checkbox' data-cy='editor-checkbox' /><span data-cy='editor-text'>x</span><button type='button' data-cy='editor-save'>Save</button></div>",
};

const refetchEntities = vi.fn().mockResolvedValue(undefined);

const mountField = (props: Record<string, unknown> = {}) =>
  mount(ListItemInlineField, {
    props: {
      metadata: roleField() as any,
      parentEntityId: "ORG-1",
      linkedEntityId: "USER-1",
      linkedEntityRelations: userRelations,
      refetchEntities,
      ...props,
    },
    slots: { default: "<span data-cy='read-value'>Admin</span>" },
    global: { stubs: { InlineFieldEditor: inlineEditorStub, unicon: true } },
    attachTo: document.body,
  });

const value = (wrapper: ReturnType<typeof mountField>) =>
  wrapper.find('[data-cy="list-item-inline-value"]');
const editor = (wrapper: ReturnType<typeof mountField>) =>
  wrapper.findComponent({ name: "InlineFieldEditor" });

describe("ListItemInlineField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.editState = reactive({ isEdit: false, permittedEditMode: "edit" });
    const scope = useEditScope();
    if (scope.activeScope.value) scope.release(scope.activeScope.value.id);
    document.body.innerHTML = "";
  });

  describe("at rest", () => {
    it("shows the read value with the pencil, as an edit button named after the field", () => {
      const wrapper = mountField();
      expect(value(wrapper).text()).toContain("Admin");
      expect(value(wrapper).attributes("role")).toBe("button");
      expect(value(wrapper).attributes("aria-label")).toBe("metadata.labels.roles, edit");
      expect(wrapper.find('[data-cy="field-edit-pencil"]').exists()).toBe(true);
    });

    it("stops the click from reaching the row's link", async () => {
      const wrapper = mountField();
      const event = new MouseEvent("click", { bubbles: true, cancelable: true });
      const rowLink = vi.fn();
      document.body.addEventListener("click", rowLink);
      value(wrapper).element.dispatchEvent(event);
      document.body.removeEventListener("click", rowLink);
      expect(event.defaultPrevented).toBe(true);
      expect(rowLink).not.toHaveBeenCalled();
    });

    it.each([
      ["the user may not update the page entity", () => (mocks.editState.permittedEditMode = "read")],
      ["the page-wide edit mode is on", () => (mocks.editState.isEdit = true)],
    ])("is a plain value when %s", (_reason, arrange) => {
      arrange();
      const wrapper = mountField();
      expect(value(wrapper).attributes("role")).toBeUndefined();
      expect(wrapper.find('[data-cy="field-edit-pencil"]').exists()).toBe(false);
    });

    it.each([
      ["marked non-editable", { nonEditableField: true }],
      ["masked", { masked: true }],
      ["read-only for the user", { readOnly: true }],
    ])("is a plain value when the field is %s", (_reason, override) => {
      const wrapper = mountField({ metadata: roleField(override) });
      expect(value(wrapper).attributes("role")).toBeUndefined();
    });

    it("doesn't take Enter from a link inside the value", () => {
      const wrapper = mountField();
      const link = document.createElement("a");
      link.href = "/elsewhere";
      value(wrapper).element.appendChild(link);
      const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
      link.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
      expect(useEditScope().isActive("ORG-1:USER-1:roles")).toBe(false);
    });

    it("is a plain value when the row has no relation back to the page entity", () => {
      const wrapper = mountField({ linkedEntityRelations: {} });
      expect(value(wrapper).attributes("role")).toBeUndefined();
    });

    it("is a plain value for a field type without an inline editor", () => {
      const wrapper = mountField({
        metadata: roleField({ inputField: { type: "fileUpload" } }),
      });
      expect(value(wrapper).attributes("role")).toBeUndefined();
    });
  });

  describe("editing", () => {
    const openEditor = async (props: Record<string, unknown> = {}) => {
      const wrapper = mountField(props);
      await value(wrapper).trigger("click");
      await flushPromises();
      return wrapper;
    };

    it("opens the inline editor with the field's type, options and current value", async () => {
      const wrapper = await openEditor();
      expect(editor(wrapper).props()).toMatchObject({
        type: "dropdownSingleselectMetadata",
        modelValue: "admin",
        label: "metadata.labels.roles",
      });
      expect(editor(wrapper).props("options")).toHaveLength(2);
      expect(useEditScope().isActive("ORG-1:USER-1:roles")).toBe(true);
    });

    it("keeps clicks inside the editor from reaching the row's link", async () => {
      const wrapper = await openEditor();
      const rowLink = vi.fn();
      document.body.addEventListener("click", rowLink);
      const event = new MouseEvent("click", { bubbles: true, cancelable: true });
      wrapper.find('[data-cy="editor-text"]').element.dispatchEvent(event);
      document.body.removeEventListener("click", rowLink);
      expect(event.defaultPrevented).toBe(true);
      expect(rowLink).not.toHaveBeenCalled();
    });

    it("keeps a click on Bewaar from following the row's link", async () => {
      const wrapper = await openEditor();
      const rowLink = vi.fn();
      document.body.addEventListener("click", rowLink);
      const event = new MouseEvent("click", { bubbles: true, cancelable: true });
      wrapper.find('[data-cy="editor-save"]').element.dispatchEvent(event);
      document.body.removeEventListener("click", rowLink);
      expect(event.defaultPrevented).toBe(true);
      expect(rowLink).not.toHaveBeenCalled();
    });

    it("lets a checkbox in the editor toggle (its click isn't cancelled)", async () => {
      const wrapper = await openEditor();
      const event = new MouseEvent("click", { bubbles: true, cancelable: true });
      wrapper.find('[data-cy="editor-checkbox"]').element.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });

    it("releases its edit scope when the row goes away (refetch, paging)", async () => {
      const wrapper = await openEditor();
      editor(wrapper).vm.$emit("dirty-change", true);
      wrapper.unmount();
      expect(useEditScope().isActive("ORG-1:USER-1:roles")).toBe(false);
      expect(useEditScope().hasUnsavedChanges.value).toBe(false);
    });

    it("saves only this key on the user's relation to the page entity", async () => {
      mocks.saveScope.mockResolvedValue({ id: "USER-1" });
      const wrapper = await openEditor();
      editor(wrapper).vm.$emit("save", "editor");
      await flushPromises();
      expect(mocks.saveScope).toHaveBeenCalledWith({
        entityId: "USER-1",
        collection: "entities",
        formInput: {
          metadata: [],
          relations: [
            {
              key: "ORG-1",
              type: "refOrganizations",
              editStatus: "changed",
              metadata: [{ key: "roles", value: "editor" }],
            },
          ],
          updateOnlyRelations: true,
        },
      });
    });

    it("closes, refreshes the list and shows the usual notification after saving", async () => {
      mocks.saveScope.mockResolvedValue({ id: "USER-1" });
      const wrapper = await openEditor();
      editor(wrapper).vm.$emit("save", "editor");
      await flushPromises();
      expect(editor(wrapper).exists()).toBe(false);
      expect(refetchEntities).toHaveBeenCalled();
      expect(mocks.notify).toHaveBeenCalledWith(
        "notifications.success.entityUpdated.title",
        "notifications.success.entityUpdated.description",
      );
    });

    it("validates with the field's rules and doesn't save an invalid value", async () => {
      const wrapper = await openEditor({
        metadata: roleField({
          inputField: {
            type: "dropdownSingleselectMetadata",
            options: [],
            validation: { value: ["required"] },
          },
        }),
      });
      editor(wrapper).vm.$emit("save", "");
      await flushPromises();
      expect(mocks.saveScope).not.toHaveBeenCalled();
      expect(editor(wrapper).props("errorMessage")).toBe("Choose a value");
    });

    it("keeps the editor open with an error when saving fails", async () => {
      mocks.saveScope.mockRejectedValue(new Error("no"));
      const wrapper = await openEditor();
      editor(wrapper).vm.$emit("save", "editor");
      await flushPromises();
      expect(editor(wrapper).props("errorMessage")).toBe("Saving failed, try again");
    });

    it("closes without saving on cancel", async () => {
      const wrapper = await openEditor();
      editor(wrapper).vm.$emit("cancel");
      await flushPromises();
      expect(editor(wrapper).exists()).toBe(false);
      expect(mocks.saveScope).not.toHaveBeenCalled();
    });

    it("lets the leave prompt save the chosen value", async () => {
      mocks.saveScope.mockResolvedValue({ id: "USER-1" });
      const wrapper = await openEditor();
      editor(wrapper).vm.$emit("draft-change", "editor");
      editor(wrapper).vm.$emit("dirty-change", true);
      expect(await useEditScope().saveActive()).toBe(true);
      expect(
        mocks.saveScope.mock.calls[0][0].formInput.relations[0].metadata,
      ).toEqual([{ key: "roles", value: "editor" }]);
    });

    it("reports a changed editor to the leave prompt", async () => {
      const wrapper = await openEditor();
      editor(wrapper).vm.$emit("dirty-change", true);
      expect(useEditScope().hasUnsavedChanges.value).toBe(true);
    });
  });
});
