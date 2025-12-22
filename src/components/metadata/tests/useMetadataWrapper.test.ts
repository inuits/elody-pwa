import { describe, expect, it, vi } from "vitest";

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
}));

import { useMetadataWrapper } from "../useMetadataWrapper";
import { useForm, defineRule } from "vee-validate";
import { defineComponent, h, nextTick, type Ref } from "vue";
import { mount } from "@vue/test-utils";
import { useMetadataWrapperDropdownOptions } from "@/components/metadata/useMetadataWrapperDropdownOptions";

const basicMetadataWrapperProps = {
  formId: "M-KYY3IE440Q",
  metadata: {
    key: "title",
    label: "metadata.labels.headtitle-manifestation",
    value: "Willem Frederik Hermans",
    __typename: "PanelMetaData",
  },
  isEdit: false,
  baseLibraryMode: "normalBaseLibrary",
  formFlow: "edit",
  showErrors: false,
};

const relationMetadataWrapperProps = {
  formId: "W-YA415JLI41",
  metadata: {
    key: "refTargetAudiences",
    label: "metadata.labels.target-audience",
    value: "volwassenen",
    inputField: {
      type: "dropdownMultiselectRelations",
      options: [],
      relationType: "refTargetAudiences",
      fromRelationType: "",
      canCreateEntityFromOption: true,
      metadataKeyToCreateEntityFromOption: "title",
      advancedFilterInputForRetrievingOptions: [
        {
          type: "text",
          key: ["vlacc:1|properties.title.value"],
          value: "*",
          match_exact: false,
          item_types: null,
          __typename: "AdvancedFilterInputType",
        },
        {
          type: "type",
          key: null,
          value: "target_audience",
          match_exact: null,
          item_types: null,
          __typename: "AdvancedFilterInputType",
        },
      ],
      advancedFilterInputForRetrievingRelatedOptions: [],
      advancedFilterInputForRetrievingAllOptions: [],
      advancedFilterInputForSearchingOptions: {
        type: "text",
        key: null,
        value: "*",
        match_exact: null,
        item_types: null,
        __typename: "AdvancedFilterInputType",
      },
      fileTypes: null,
      maxFileSize: null,
      maxAmountOfFiles: null,
      uploadMultiple: null,
      isMetadataField: false,
      relationFilter: {
        lookup: null,
        type: "selection",
        key: ["vlacc:1|identifiers"],
        value: "$relationValues.refTargetAudiences.key",
        match_exact: true,
        item_types: ["target_audience"],
        __typename: "AdvancedFilterInputType",
      },
      dependsOn: "",
      multiple: false,
      lineClamp: null,
      entityType: "target_audience",
      hasVirtualKeyboard: false,
      autoSelectable: false,
      autoAllSelectable: null,
      __typename: "InputField",
      validation: {
        value: ["has_required_relation"],
        customValue: null,
        fastValidationMessage: null,
        required_if: null,
        available_if: null,
        has_required_relation: {
          relationType: "refTargetAudiences",
          amount: 1,
          exact: null,
          __typename: "RequiredRelationValidation",
        },
        has_one_of_required_relations: null,
        has_one_of_required_metadata: null,
        regex: null,
        __typename: "Validation",
      },
    },
    __typename: "PanelMetaData",
  },
  isEdit: false,
  baseLibraryMode: "normalBaseLibrary",
  formFlow: "edit",
  showErrors: false,
};

describe("useMetadataWrapper", () => {
  it("should initialize a basic field in veevalidate succesfully", async () => {
    let capturedFieldValueProxy: Ref<any>;
    let capturedFieldLabel: Ref<string>;
    let capturedFieldKey: Ref<string>;

    const basicComponent = defineComponent({
      setup() {
        useForm();
        defineRule("no_xss", () => true);

        const { fieldValueProxy, fieldLabel, fieldKey } = useMetadataWrapper(
          basicMetadataWrapperProps,
          () => undefined,
        );

        capturedFieldValueProxy = fieldValueProxy;
        capturedFieldLabel = fieldLabel;
        capturedFieldKey = fieldKey;

        return () => h("div");
      },
    });

    mount(basicComponent);

    await nextTick();

    expect(capturedFieldValueProxy!.value).toBe("Willem Frederik Hermans");
    expect(capturedFieldLabel!.value).toBe(
      "metadata.labels.headtitle-manifestation",
    );
    expect(capturedFieldKey!.value).toBe("intialValues.title");
  });

  it("Should initialize a relation field in veevalidate succesfully", async () => {
    let capturedFieldValueProxy: Ref<any>;
    let capturedFieldLabel: Ref<string>;
    let capturedFieldKey: Ref<string>;
    let capturedFieldType: Ref<string>;
    let capturedFiltersForRetrievingOptions: Ref<any>;
    let capturedFiltersForRetrievingRelatedOptions: Ref<any>;

    const relationComponent = defineComponent({
      setup() {
        useForm();
        defineRule("no_xss", () => true);
        defineRule("has_required_relation", () => true);
        defineRule("required", () => true);

        const { fieldValueProxy, fieldLabel, fieldKey, fieldType } =
          useMetadataWrapper(relationMetadataWrapperProps, () => undefined);

        const {
          filtersForRetrievingOptions,
          filtersForRetrievingRelatedOptions,
        } = useMetadataWrapperDropdownOptions(relationMetadataWrapperProps);

        capturedFieldValueProxy = fieldValueProxy;
        capturedFieldLabel = fieldLabel;
        capturedFieldKey = fieldKey;
        capturedFieldType = fieldType;
        capturedFiltersForRetrievingOptions = filtersForRetrievingOptions;
        capturedFiltersForRetrievingRelatedOptions =
          filtersForRetrievingRelatedOptions;

        return () => h("div");
      },
    });

    mount(relationComponent);

    await nextTick();

    expect(capturedFieldValueProxy!.value).toBe("volwassenen");
    expect(capturedFieldLabel!.value).toBe("metadata.labels.target-audience");
    expect(capturedFieldKey!.value).toBe("intialValues.refTargetAudiences");
    expect(capturedFieldType!.value).toBe("dropdownMultiselectRelations");
    expect(capturedFiltersForRetrievingOptions!.value).toBeTruthy();
    expect(capturedFiltersForRetrievingRelatedOptions!.value).toBeTruthy();
  });
});
