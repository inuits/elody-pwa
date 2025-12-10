import { computed, type ComputedRef, onUnmounted, toRef } from "vue";
import { type MetadataWrapperProps } from "./MetadataWrapper.vue";
import { type AdvancedFilterInputType } from "@/generated-types/queries";
import { useMetadataWrapper } from "./useMetadataWrapper";
import { useGetDropdownOptions } from "@/composables/useGetDropdownOptions";

export const useMetadataWrapperDropdownOptions = (
  props: MetadataWrapperProps,
): {
  initializeDropdownStates: () => void;
  metadataKeyToGetOptions: ComputedRef<string | undefined>;
  filtersForRetrievingOptions: ComputedRef<
    AdvancedFilterInputType[] | undefined
  >;
  filtersForRetrievingRelatedOptions: ComputedRef<
    AdvancedFilterInputType[] | undefined
  >;
} => {
  const getMetadataKeyToGetOptions = (): string | undefined => {
    try {
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
      return field.advancedFilterInputForSearchingOptions
        .item_types[0] as string;
    } catch {
      return undefined;
    }
  };

  const getFiltersForOptions = (): AdvancedFilterInputType[] | undefined => {
    try {
      if (!props.metadata.inputField.advancedFilterInputForRetrievingAllOptions)
        return (
          props.metadata.inputField.advancedFilterInputForRetrievingOptions ||
          undefined
        );

      return props.metadata.inputField
        .advancedFilterInputForRetrievingAllOptions;
    } catch {
      return undefined;
    }
  };

  const getFiltersForRelatedOptions = ():
    | AdvancedFilterInputType[]
    | undefined => {
    try {
      if (
        !props.metadata.inputField
          .advancedFilterInputForRetrievingRelatedOptions
      )
        return (
          props.metadata.inputField.advancedFilterInputForRetrievingOptions ||
          undefined
        );

      return props.metadata.inputField
        .advancedFilterInputForRetrievingRelatedOptions;
    } catch {
      return undefined;
    }
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
      searchFilterInput: advancedFilterInputForSearchingOptions.value,
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
        props.listItemEntity !== undefined
          ? toRef(props.listItemEntity)
          : fieldId.value, // Id could be wrong here
      relationType: relationType.value,
      fromRelationType: props.metadata.inputField?.fromRelationType,
      searchFilterInput: advancedFilterInputForSearchingOptions.value,
      advancedFilterInputForRetrievingOptions:
        filtersForRetrievingOptions.value,
      formId: fieldId.value,
      relationFilter: props.metadata.inputField?.relationFilter,
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
      console.log(mapConfigToArgs(dropDownoptionsConfigMapping[key]));
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

  onUnmounted(() => {
    deleteDropDownStates();
  });

  return {
    initializeDropdownStates,
    metadataKeyToGetOptions,
    filtersForRetrievingOptions,
    filtersForRetrievingRelatedOptions,
  };
};
