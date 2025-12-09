import { computed, ComputedRef, toRef } from "vue";
import { MetadataWrapperProps } from "./MetadataWrapper.vue";
import { AdvancedFilterInputType } from "@/generated-types/queries";
import { useMetadataWrapper } from "./useMetadataWrapper";
import { useGetDropdownOptions } from "@/composables/useGetDropdownOptions";

export const useMetadataWrapperDropdownOptions = (
  props: MetadataWrapperProps,
): {
  initializeDropdownStates: () => void;
  deleteDropDownStates: () => void;
  metadataKeyToGetOptions: ComputedRef<string>;
  filtersForRetrievingOptions: ComputedRef<
    AdvancedFilterInputType[] | undefined
  >;
  filtersForRetrievingRelatedOptions: ComputedRef<
    AdvancedFilterInputType[] | undefined
  >;
} => {
  const getMetadataKeyToGetOptions = (): string => {
    const field = props.metadata.inputField;
    if (field.entityType) return field.entityType;

    const { fieldKey, fieldKind } = useMetadataWrapper(props);

    const keyMapper: { [key: string]: string } = {
      PanelrelationMetaData: fieldKey.value,
      PanelRelationRootData: fieldKey.value,
      fallback: props.metadata.key,
    };

    let key = keyMapper["fallback"];
    if (Object.keys(keyMapper).includes(fieldKind.value))
      key = keyMapper[fieldKind.value];

    if (!field.advancedFilterInputForSearchingOptions?.item_types) return key;
    return field.advancedFilterInputForSearchingOptions.item_types[0] as string;
  };

  const getFiltersForOptions = (): AdvancedFilterInputType[] | undefined => {
    if (!props.metadata.inputField.advancedFilterInputForRetrievingAllOptions)
      return (
        props.metadata.inputField.advancedFilterInputForRetrievingOptions ||
        undefined
      );

    return props.metadata.inputField.advancedFilterInputForRetrievingAllOptions;
  };

  const getFiltersForRelatedOptions = ():
    | AdvancedFilterInputType[]
    | undefined => {
    if (
      !props.metadata.inputField.advancedFilterInputForRetrievingRelatedOptions
    )
      return (
        props.metadata.inputField.advancedFilterInputForRetrievingOptions ||
        undefined
      );

    return props.metadata.inputField
      .advancedFilterInputForRetrievingRelatedOptions;
  };

  const metadataKeyToGetOptions = computed(() => getMetadataKeyToGetOptions());
  const filtersForRetrievingOptions = computed(() => getFiltersForOptions());
  const filtersForRetrievingRelatedOptions = computed(() =>
    getFiltersForRelatedOptions(),
  );

  const fieldId = computed<string>(() => props.linkedEntityId || props.formId);
  const relationType = computed<string | undefined>(
    () => props.metadata.inputField?.relationType || undefined,
  );
  const advancedFilterInputForSearchingOptions = computed<
    AdvancedFilterInputType | undefined
  >(
    () =>
      props.metadata.inputField?.advancedFilterInputForSearchingOptions ||
      undefined,
  );

  const mapConfigToArgs = (c: any) => [
    c.dropdownOptionsStateName,
    c.mode,
    c.entityType,
    c.parent,
    c.relationType,
    c.fromRelationType,
    c.searchFilterInput,
    c.advancedFilterInputForRetrievingOptions,
    c.formId,
    c.relationFilter,
  ];

  const dropDownoptionsConfigMapping: { [key: string]: any } = {
    fetchAll: {
      dropdownOptionsStateName: `${fieldId.value}-${relationType.value}-fetchAll`,
      mode: "get",
      entityType: metadataKeyToGetOptions.value,
      parent: toRef("fetchAll"),
      relationType: undefined,
      fromRelationType: undefined,
      searchFilterInput: advancedFilterInputForSearchingOptions,
      advancedFilterInputForRetrievingOptions:
        filtersForRetrievingOptions.value,
      formId: fieldId.value,
      relationFilter: undefined,
    },
    fetchRelations: {
      dropdownOptionsStateName: `${fieldId.value}-${relationType.value}-fetchRelations`,
      mode: "get",
      entityType: metadataKeyToGetOptions.value,
      parent:
        props.listItemEntity !== undefined ? toRef(props.listItemEntity) : id, // Id could be wrong here
      relationType: relationType,
      fromRelationType: props.metadata.inputField.fromRelationType,
      searchFilterInput: "",
      advancedFilterInputForRetrievingOptions:
        advancedFilterInputForSearchingOptions,
      formId: fieldId.value,
      relationFilter: props.metadata.inputField.relationFilter,
    },
  };

  const initializeDropdownStates = (): void => {
    if (
      !fieldId.value ||
      !relationType.value ||
      !advancedFilterInputForSearchingOptions
    )
      throw Error(
        "Unable to initialize dropdown states, id, relationType or advancedFilterInputForSearchingOptions undefined",
      );

    Object.keys(dropDownoptionsConfigMapping).forEach((key) => {
      useGetDropdownOptions(
        ...mapConfigToArgs(dropDownoptionsConfigMapping[key]),
      );
    });
  };

  const deleteDropDownStates = (): void => {
    useGetDropdownOptions(
      dropDownoptionsConfigMapping["fetchAll"].dropdownOptionsStateName,
      "delete",
    );
    useGetDropdownOptions(
      dropDownoptionsConfigMapping["fetchRelations"].dropdownOptionsStateName,
      "delete",
    );
  };

  return {
    initializeDropdownStates,
    deleteDropDownStates,
    metadataKeyToGetOptions,
    filtersForRetrievingOptions,
    filtersForRetrievingRelatedOptions,
  };
};
