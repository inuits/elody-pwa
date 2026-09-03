import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
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
vi.mock("@/composables/useImport", () => ({
  useImport: () => ({ loadDocument: loadDocumentMock }),
}));

import MetadataWrapper from "../MetadataWrapper.vue";
import MetadataMaskedValue from "../MetadataMaskedValue.vue";
import { InputFieldTypes } from "@/generated-types/queries";
import { useFormHelper } from "@/composables/useFormHelper";
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
