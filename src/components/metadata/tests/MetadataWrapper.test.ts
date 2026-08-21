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

import MetadataWrapper from "../MetadataWrapper.vue";
import { InputFieldTypes } from "@/generated-types/queries";
import { useFormHelper } from "@/composables/useFormHelper";

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

const mountWrapper = async (props: ReturnType<typeof buildProps>) => {
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
