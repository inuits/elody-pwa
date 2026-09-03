import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/main", () => ({
  i18n: { global: { t: (key: string) => key } },
  typeUrlMapping: { mapping: {}, reverseMapping: {} },
}));

const useGetDropdownOptions = vi.fn();
vi.mock("@/composables/useGetDropdownOptions", () => ({
  useGetDropdownOptions: (...args: any[]) => useGetDropdownOptions(...args),
}));

const getParentId = vi.fn();
vi.mock("@/composables/useModalActions", () => ({
  useModalActions: () => ({ getParentId }),
}));

import { defineComponent, h } from "vue";
import { defineRule, useForm } from "vee-validate";
import { mount } from "@vue/test-utils";
import { useMetadataWrapperDropdownOptions } from "@/components/metadata/useMetadataWrapperDropdownOptions";

const FORM_ID_ARGUMENT_INDEX = 8;

const makeProps = (resolveOptionsFilterOnModalParent?: boolean) => ({
  formId: "GetCreateCustomNotificationForm",
  metadata: {
    key: "refOrganization",
    label: "metadata.labels.notification-venues",
    __typename: "PanelMetaData",
    inputField: {
      type: "dropdownMultiselectRelations",
      relationType: "refOrganization",
      resolveOptionsFilterOnModalParent,
      advancedFilterInputForRetrievingOptions: [
        { type: "selection", key: ["podiumnet:1|id"], value: "$refVenues" },
      ],
      advancedFilterInputForSearchingOptions: {
        type: "text",
        key: ["podiumnet:1|properties.name.value"],
        value: "*",
      },
    },
  },
  isEdit: true,
  baseLibraryMode: "normalBaseLibrary",
  formFlow: "edit",
  showErrors: false,
});

const initializeWith = (props: any) => {
  mount(
    defineComponent({
      setup() {
        useForm();
        defineRule("no_xss", () => true);
        useMetadataWrapperDropdownOptions(props).initializeDropdownStates();
        return () => h("div");
      },
    }),
  );
  return useGetDropdownOptions.mock.calls.map(
    (call) => call[FORM_ID_ARGUMENT_INDEX],
  );
};

describe("useMetadataWrapperDropdownOptions", () => {
  beforeEach(() => {
    useGetDropdownOptions.mockClear();
    getParentId.mockReset();
  });

  it("resolves the options filter on the modal's parent entity when the field asks for it", () => {
    getParentId.mockReturnValue("PR0001");

    expect(initializeWith(makeProps(true))).toEqual(["PR0001", "PR0001"]);
  });

  it("falls back to the field's own form when there is no modal parent", () => {
    getParentId.mockReturnValue(undefined);

    expect(initializeWith(makeProps(true))).toEqual([
      "GetCreateCustomNotificationForm",
      "GetCreateCustomNotificationForm",
    ]);
  });

  it("uses the field's own form when the field does not ask for the modal parent", () => {
    getParentId.mockReturnValue("PR0001");

    expect(initializeWith(makeProps(undefined))).toEqual([
      "GetCreateCustomNotificationForm",
      "GetCreateCustomNotificationForm",
    ]);
  });
});
