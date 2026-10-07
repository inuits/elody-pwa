import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { useForm, defineRule } from "vee-validate";

vi.mock("@/main", () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
  typeUrlMapping: {
    mapping: {},
    reverseMapping: {},
  },
  apolloClient: {
    query: vi.fn().mockResolvedValue({ data: {} }),
  },
  auth: {
    isAuthenticated: ref(true),
  },
}));

const loadDocumentMock = vi.fn().mockResolvedValue({ kind: "Document" });

const scopedSave = vi.hoisted(() => ({ saveScope: vi.fn() }));
vi.mock("@/composables/useScopedSave", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/composables/useScopedSave")>()),
  saveScope: scopedSave.saveScope,
}));
vi.mock("@/composables/useImport", () => ({
  useImport: () => ({ loadDocument: loadDocumentMock }),
}));

import MetadataWrapper from "../MetadataWrapper.vue";
import MetadataMaskedValue from "../MetadataMaskedValue.vue";
import { InputFieldTypes } from "@/generated-types/queries";
import { useFormHelper } from "@/composables/useFormHelper";
import { useEditMode } from "@/composables/useEdit";
import { useEditScope } from "@/composables/useEditScope";
import {
  copyFromParentContextKey,
  type CopyFromParentContext,
} from "@/composables/useCopyFromParent";

const uniconStub = {
  template: "<div></div>",
  props: ["height", "name"],
};

const baseTooltipStub = {
  template: '<div><slot name="activator" :on="{}" /><slot /></div>',
};

const editStub = {
  template: '<div data-testid="metadata-edit-stub"></div>',
  props: [
    "fieldKey",
    "value",
    "field",
    "hiddenField",
    "formId",
    "formFlow",
    "unit",
    "linkText",
    "isMetadataOnRelation",
    "isRootdataOnRelation",
    "error",
    "relationFilter",
    "showErrors",
    "copyValueFromParent",
    "extractValueFromParent",
    "fieldIsValid",
    "isFieldRequired",
    "repeatablePanelConfig",
    "disabled",
    "defaultValue",
  ],
};

// useFieldLock resolves a field as locked when its key is present in the
// entity form's intialValues.lockedProperties. The harness below registers
// "title" as locked so metadata keyed "title" reliably resolves to locked.
const buildProps = (key: string, isEdit: boolean) => ({
  formId: "MW-TEST",
  isEdit,
  baseLibraryMode: "normalBaseLibrary",
  formFlow: "edit" as const,
  showErrors: false,
  metadata: {
    key,
    label: "metadata.labels.test",
    value: "hello",
    __typename: "PanelMetaData",
    inputField: {
      type: InputFieldTypes.Text,
      options: [],
      __typename: "InputField",
    },
  },
});

const mountWrapper = async (
  props: ReturnType<typeof buildProps>,
  copyContext?: CopyFromParentContext,
) => {
  const Harness = defineComponent({
    setup() {
      const form = useForm({
        initialValues: { intialValues: { lockedProperties: ["title"] } },
      });
      useFormHelper().addForm(props.formId, form);
      defineRule("no_xss", () => true);
      return () => h(MetadataWrapper, props as any);
    },
  });

  const wrapper = mount(Harness, {
    global: {
      provide: copyContext
        ? { [copyFromParentContextKey as unknown as symbol]: copyContext }
        : {},
      stubs: {
        unicon: uniconStub,
        BaseTooltip: baseTooltipStub,
        "base-tooltip": baseTooltipStub,
        EntityElementMetadataEdit: editStub,
        "entity-element-metadata-edit": editStub,
        MultilingualLocaleSelector: true,
        BaseVirtualKeyboard: true,
        MetadataTruncatedText: { template: "<div><slot /></div>" },
        MetadataFormatter: true,
        TableInputField: true,
        ViewModesAutocompleteRelations: true,
        ViewModesAutocompleteMetadata: true,
        BaseCopyToClipboard: true,
        MetadataValueTooltip: true,
        EntityElementMetadata: { template: "<span>value</span>" },
        InlineFieldEditor: {
          name: "InlineFieldEditor",
          props: ["type", "modelValue", "label", "options", "required", "saving", "errorMessage"],
          emits: ["save", "cancel", "dirty-change", "draft-change"],
          template: "<div data-cy='inline-editor-stub' />",
        },
      },
    },
  });

  await nextTick();
  await nextTick();
  return wrapper;
};

describe("MetadataWrapper — locked field rendering", () => {
  it("renders the editable field when the field is not locked", async () => {
    const wrapper = await mountWrapper(buildProps("unlocked_key", true));

    expect(wrapper.find('[data-testid="metadata-edit-stub"]').exists()).toBe(
      true,
    );
    expect(
      wrapper.find('[data-testid="locked-field-indicator"]').exists(),
    ).toBe(false);
  });

  it("falls back to the read-only view with a lock indicator when the field is locked while editing", async () => {
    const wrapper = await mountWrapper(buildProps("title", true));

    expect(wrapper.find('[data-testid="metadata-edit-stub"]').exists()).toBe(
      false,
    );
    expect(
      wrapper.find('[data-testid="locked-field-indicator"]').exists(),
    ).toBe(true);
  });

  it("tints the read-only view container's background when locked", async () => {
    const wrapper = await mountWrapper(buildProps("title", true));

    const container = wrapper.find(
      '[data-testid="locked-field-view-container"]',
    );
    expect(container.classes()).toContain("bg-background-normal/70");
  });

  it("does not tint the view container when the field is not locked", async () => {
    const wrapper = await mountWrapper(buildProps("unlocked_key", false));

    const container = wrapper.find(
      '[data-testid="locked-field-view-container"]',
    );
    expect(container.classes()).not.toContain("bg-background-normal/70");
  });

  it("adds the locked-field hook class that overrides the autocomplete's own white background", async () => {
    const wrapper = await mountWrapper(buildProps("title", true));

    const container = wrapper.find(
      '[data-testid="locked-field-view-container"]',
    );
    expect(container.classes()).toContain("locked-field");
  });

  it("does not add the locked-field hook class when the field is not locked", async () => {
    const wrapper = await mountWrapper(buildProps("unlocked_key", false));

    const container = wrapper.find(
      '[data-testid="locked-field-view-container"]',
    );
    expect(container.classes()).not.toContain("locked-field");
  });

  it("never applies an element-opacity utility to the view container, so text stays fully legible", async () => {
    const wrapper = await mountWrapper(buildProps("title", true));

    const container = wrapper.find(
      '[data-testid="locked-field-view-container"]',
    );
    expect(container.classes().some((c) => /^opacity-/.test(c))).toBe(false);
  });

  it("still shows the lock indicator and background tint when merely viewing (not editing) a lockable field", async () => {
    const wrapper = await mountWrapper(buildProps("title", false));

    expect(
      wrapper.find('[data-testid="locked-field-indicator"]').exists(),
    ).toBe(true);
    const container = wrapper.find(
      '[data-testid="locked-field-view-container"]',
    );
    expect(container.classes()).toContain("bg-background-normal/70");
  });
});

describe("MetadataWrapper — copy-from-parent button layout", () => {
  const copy = vi.fn();
  const context: CopyFromParentContext = {
    buttonFor: () => ({ label: "bulk-operations.copy-title-from-work", copy }),
  };

  it("renders the copy button when the form provides one for this field", async () => {
    const wrapper = await mountWrapper(buildProps("subtitle", true), context);

    expect(wrapper.find('[data-cy="copy-from-parent"]').exists()).toBe(true);
  });

  it("renders no copy button when the form provides none", async () => {
    const wrapper = await mountWrapper(buildProps("subtitle", true), {
      buttonFor: () => undefined,
    });

    expect(wrapper.find('[data-cy="copy-from-parent"]').exists()).toBe(false);
  });

  it("renders no copy button outside edit mode", async () => {
    const wrapper = await mountWrapper(buildProps("subtitle", false), context);

    expect(wrapper.find('[data-cy="copy-from-parent"]').exists()).toBe(false);
  });

  it("wraps the button in a width-owning container so it cannot take the whole row", async () => {
    // BaseButtonNew's root <button> hard-codes w-full, so as a direct flex child it
    // resolves to 100% of the row and squeezes the input to nothing. It has to sit
    // in a shrink-to-fit wrapper, the same way BulkEditClearFieldButton does.
    const wrapper = await mountWrapper(buildProps("subtitle", true), context);

    const action = wrapper.find('[data-testid="copy-from-parent-action"]');
    expect(action.exists()).toBe(true);
    expect(action.classes()).toContain("shrink-0");
    expect(action.classes()).toContain("w-fit");
    expect(wrapper.find('[data-cy="copy-from-parent"]').element.parentElement).
      toBe(action.element);
  });

  it("forces the label to stay visible - the button has no icon to fall back on", async () => {
    // BaseButtonNew hides its label in narrow containers unless forceShowLabel is
    // set; with no icon configured that would render an empty box.
    const wrapper = await mountWrapper(buildProps("subtitle", true), context);

    expect(
      wrapper.findComponent({ name: "BaseButtonNew" }).props("forceShowLabel"),
    ).toBe(true);
  });

  it("copies through the provided context when clicked", async () => {
    const wrapper = await mountWrapper(buildProps("subtitle", true), context);
    await wrapper.find('[data-cy="copy-from-parent"]').trigger("click");

    expect(copy).toHaveBeenCalled();
  });
});

describe("MetadataWrapper — masked field delegation", () => {
  const buildMaskedProps = (extra: Record<string, unknown> = {}) => ({
    ...buildProps("_key", false),
    metadata: {
      key: "_key",
      label: "metadata.labels.test",
      value: "elk_secret",
      masked: true,
      copyToClipboard: true,
      __typename: "PanelMetaData",
      inputField: {
        type: InputFieldTypes.Text,
        options: [],
        __typename: "InputField",
      },
      ...extra,
    },
  });

  it("hands a masked field to MetadataMaskedValue with the reveal config", async () => {
    const wrapper = await mountWrapper(
      buildMaskedProps({ revealQuery: "GetTokenSecret" }) as any,
    );

    const masked = wrapper.findComponent(MetadataMaskedValue);
    expect(masked.exists()).toBe(true);
    expect(masked.props()).toMatchObject({
      metadataKey: "_key",
      revealQuery: "GetTokenSecret",
      entityId: "MW-TEST",
      copyToClipboard: true,
    });
  });

  it("does not render its own copy button for a masked field", async () => {
    const wrapper = await mountWrapper(buildMaskedProps() as any);

    // the masked component owns copying, so the value is never exposed twice
    expect(
      wrapper.findComponent(MetadataMaskedValue).exists(),
    ).toBe(true);
    expect(wrapper.text()).not.toContain("elk_secret");
  });

  it("leaves ordinary fields on the normal render path", async () => {
    const wrapper = await mountWrapper(buildProps("plain_key", false));

    expect(wrapper.findComponent(MetadataMaskedValue).exists()).toBe(false);
  });
});

describe("MetadataWrapper — in-place editing affordance", () => {
  const editableProps = (key = "year", type = InputFieldTypes.Text) => {
    const props = buildProps(key, false);
    props.metadata.inputField.type = type;
    return props;
  };

  const allowUpdate = (canUpdate: boolean) =>
    useEditMode("MW-TEST").setPermittedEditMode({ canUpdate, canDelete: false });

  const fieldValue = async (props = editableProps()) =>
    (await mountWrapper(props)).find('[data-cy="field-value"]');

  beforeEach(() => {
    allowUpdate(true);
    useEditScope().release("MW-TEST:year");
  });

  it("makes an editable value a button named after its field", async () => {
    const value = await fieldValue();
    expect(value.attributes("role")).toBe("button");
    expect(value.attributes("tabindex")).toBe("0");
    expect(value.attributes("aria-label")).toBe("metadata.labels.test, edit");
  });

  it("washes the whole value on hover", async () => {
    expect((await fieldValue()).classes()).toContain(
      "hover:bg-surface-editable-hover",
    );
  });

  it("underlines the value text itself, without rounded corners", async () => {
    const wrapper = await mountWrapper(editableProps());
    const text = wrapper.find('[data-cy="field-value-text"]');
    expect(text.classes()).toEqual(
      expect.arrayContaining(["border-b", "border-dashed", "border-border-dashed"]),
    );
    expect(text.classes().some((c) => c.startsWith("rounded"))).toBe(false);
    expect(wrapper.find('[data-cy="field-value"]').classes()).not.toContain(
      "border-b",
    );
  });

  it("does not underline a read-only value", async () => {
    const props = editableProps();
    (props.metadata as any).readOnly = true;
    const text = (await mountWrapper(props)).find('[data-cy="field-value-text"]');
    expect(text.classes()).not.toContain("border-dashed");
  });

  it("always shows the pencil on an editable value, not only on hover", async () => {
    const pencil = (await mountWrapper(editableProps())).find(
      '[data-cy="field-edit-pencil"]',
    );
    expect(pencil.exists()).toBe(true);
    expect(pencil.attributes("aria-hidden")).toBe("true");
    expect(pencil.classes().some((c) => c.includes("opacity-0"))).toBe(false);
    expect(pencil.classes()).toContain("text-text-subtle");
  });

  it("opens the field's edit scope on click", async () => {
    await (await fieldValue()).trigger("click");
    expect(useEditScope().isActive("MW-TEST:year")).toBe(true);
  });

  it("opens the field's edit scope with Enter", async () => {
    await (await fieldValue()).trigger("keydown", { key: "Enter" });
    expect(useEditScope().isActive("MW-TEST:year")).toBe(true);
  });

  it("is editable when the field config arrives without a __typename", async () => {
    const props = editableProps();
    delete (props.metadata as any).__typename;
    expect((await fieldValue(props)).attributes("role")).toBe("button");
  });

  it("is plain text for metadata on a relation", async () => {
    const props = editableProps();
    (props.metadata as any).__typename = "PanelRelationMetaData";
    expect((await fieldValue(props)).attributes("role")).toBeUndefined();
  });

  it("opens the scope when clicking a value whose display stops click events", async () => {
    const props = editableProps("year", InputFieldTypes.DropdownSingleselectMetadata);
    (props.metadata.inputField as any).options = [{ label: "Nieuw", value: "new" }];
    (props.metadata as any).unit = "text";
    const wrapper = await mountWrapper(props);
    const display = wrapper.find("view-modes-autocomplete-metadata-stub");
    expect(display.exists()).toBe(true);
    await display.trigger("click");
    expect(useEditScope().isActive("MW-TEST:year")).toBe(true);
  });

  it("is plain text for a read-only field", async () => {
    const props = editableProps();
    (props.metadata as any).readOnly = true;
    expect((await fieldValue(props)).attributes("role")).toBeUndefined();
  });

  it("is plain text when the user may not update the entity", async () => {
    allowUpdate(false);
    expect((await fieldValue()).attributes("role")).toBeUndefined();
  });

  it("is plain text for a locked field", async () => {
    expect((await fieldValue(editableProps("title"))).attributes("role")).toBeUndefined();
  });

  it("is plain text for a field type without an inline editor yet", async () => {
    expect(
      (await fieldValue(editableProps("year", InputFieldTypes.FileUpload))).attributes(
        "role",
      ),
    ).toBeUndefined();
  });

  it("does not open a scope for a read-only value", async () => {
    allowUpdate(false);
    await (await fieldValue()).trigger("click");
    expect(useEditScope().isActive("MW-TEST:year")).toBe(false);
  });
});

describe("MetadataWrapper — inline editing", () => {
  const props = () => {
    const p = buildProps("year", false);
    p.metadata.inputField.type = InputFieldTypes.Text;
    return p;
  };

  const openEditor = async () => {
    const wrapper = await mountWrapper(props());
    await wrapper.find('[data-cy="field-value"]').trigger("click");
    return wrapper;
  };
  const inlineEditor = (wrapper: any) =>
    wrapper.findComponent({ name: "InlineFieldEditor" });

  beforeEach(() => {
    scopedSave.saveScope.mockReset();
    useEditMode("MW-TEST").setPermittedEditMode({ canUpdate: true, canDelete: false });
    useEditScope().release("MW-TEST:year");
  });

  it("swaps the value for the inline editor with the current value", async () => {
    const wrapper = await openEditor();
    expect(inlineEditor(wrapper).props("modelValue")).toBe("hello");
    expect(inlineEditor(wrapper).props("type")).toBe(InputFieldTypes.Text);
    expect(wrapper.find('[data-cy="field-value"]').exists()).toBe(false);
  });

  it("saves only the edited key", async () => {
    scopedSave.saveScope.mockResolvedValue({ id: "MW-TEST" });
    const wrapper = await openEditor();
    inlineEditor(wrapper).vm.$emit("save", "2020");
    await flushPromises();
    expect(scopedSave.saveScope).toHaveBeenCalledWith({
      entityId: "MW-TEST",
      collection: "entities",
      formInput: {
        metadata: [{ key: "year", value: "2020" }],
        relations: [],
        updateOnlyRelations: false,
      },
    });
  });

  it("closes the editor and announces the save", async () => {
    scopedSave.saveScope.mockResolvedValue({ id: "MW-TEST" });
    const wrapper = await openEditor();
    inlineEditor(wrapper).vm.$emit("save", "2020");
    await flushPromises();
    expect(inlineEditor(wrapper).exists()).toBe(false);
    expect(wrapper.find('[role="status"]').text()).toBe("Saved");
    expect(useEditScope().isActive("MW-TEST:year")).toBe(false);
  });

  it("keeps the editor open with an error when the save fails", async () => {
    scopedSave.saveScope.mockRejectedValue(new Error("server says no"));
    const wrapper = await openEditor();
    inlineEditor(wrapper).vm.$emit("save", "2020");
    await flushPromises();
    expect(inlineEditor(wrapper).exists()).toBe(true);
    expect(inlineEditor(wrapper).props("errorMessage")).toBe(
      "Saving failed, try again",
    );
  });

  it("does not save a value that fails the field's validation", async () => {
    defineRule("regex", (value: string, [pattern]: string[]) =>
      new RegExp(pattern).test(value ?? "") || "Invalid format",
    );
    const p = props();
    (p.metadata.inputField as any).validation = { value: ["regex"], regex: "/^[0-9]{4}$/" };
    const wrapper = await mountWrapper(p);
    await wrapper.find('[data-cy="field-value"]').trigger("click");
    inlineEditor(wrapper).vm.$emit("save", "123456");
    await flushPromises();
    expect(scopedSave.saveScope).not.toHaveBeenCalled();
    expect(inlineEditor(wrapper).exists()).toBe(true);
    expect(inlineEditor(wrapper).props("errorMessage")).toBeTruthy();
  });

  it("closes without saving on cancel", async () => {
    const wrapper = await openEditor();
    inlineEditor(wrapper).vm.$emit("cancel");
    await flushPromises();
    expect(inlineEditor(wrapper).exists()).toBe(false);
    expect(scopedSave.saveScope).not.toHaveBeenCalled();
    expect(useEditScope().isActive("MW-TEST:year")).toBe(false);
  });

  it("reports unsaved changes while the editor holds a changed draft", async () => {
    const wrapper = await openEditor();
    inlineEditor(wrapper).vm.$emit("dirty-change", true);
    await flushPromises();
    expect(useEditScope().hasUnsavedChanges.value).toBe(true);
  });
});

describe("MetadataWrapper — leaving with an open editor", () => {
  const openEditor = async () => {
    const p = buildProps("year", false);
    const wrapper = await mountWrapper(p);
    await wrapper.find('[data-cy="field-value"]').trigger("click");
    return wrapper;
  };
  const inlineEditor = (wrapper: any) =>
    wrapper.findComponent({ name: "InlineFieldEditor" });

  beforeEach(() => {
    scopedSave.saveScope.mockReset();
    useEditMode("MW-TEST").setPermittedEditMode({ canUpdate: true, canDelete: false });
    useEditScope().release("MW-TEST:year");
  });

  it("saves the typed draft when the leave prompt asks to save", async () => {
    scopedSave.saveScope.mockResolvedValue({ id: "MW-TEST" });
    const wrapper = await openEditor();
    inlineEditor(wrapper).vm.$emit("draft-change", "2021");
    inlineEditor(wrapper).vm.$emit("dirty-change", true);
    expect(await useEditScope().saveActive()).toBe(true);
    expect(scopedSave.saveScope.mock.calls[0][0].formInput.metadata).toEqual([
      { key: "year", value: "2021" },
    ]);
  });

  it("reports a failed save so the user stays on the page", async () => {
    scopedSave.saveScope.mockRejectedValue(new Error("no"));
    const wrapper = await openEditor();
    inlineEditor(wrapper).vm.$emit("draft-change", "2021");
    inlineEditor(wrapper).vm.$emit("dirty-change", true);
    expect(await useEditScope().saveActive()).toBe(false);
  });

  it("closes the editor without saving when the prompt discards", async () => {
    const wrapper = await openEditor();
    inlineEditor(wrapper).vm.$emit("dirty-change", true);
    useEditScope().discardActive();
    await flushPromises();
    expect(inlineEditor(wrapper).exists()).toBe(false);
    expect(scopedSave.saveScope).not.toHaveBeenCalled();
  });
});
