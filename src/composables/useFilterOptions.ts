import type {
  Entitytyping,
  AdvancedFilterInput,
  BaseEntity,
  DropdownOption,
} from "@/generated-types/queries";
import {
  AdvancedFilterTypes,
  DamsIcons,
  SearchInputType,
} from "@/generated-types/queries";
import { computed } from "vue";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import type { ApolloClient } from "@apollo/client/core";
import { getEntityTitle } from "@/helpers";
import { useFiltersBaseNew } from "@/composables/useFiltersBaseNew";
import { apolloClient } from "@/main";
import { useImport } from "@/composables/useImport";
import { ref } from "vue";

type FilterOptionsMappingType = {
  label?: string;
  value?: string;
};

export const useFilterOptions = () => {
  const { loadDocument } = useImport();
  const {
    entities,
    entitiesLoading,
    getEntities,
    setAdvancedFilters,
    setEntityType,
    setsearchInputType,
  } = useBaseLibrary(apolloClient as ApolloClient<any>);
  const {
    initializeFilters,
    getNormalizedFiltersForApi,
    transformFilterInputIntoAdvancedFilters,
    extractValueFromObject,
    setVariables,
  } = useFiltersBaseNew();
  const dropdownOptions = ref<DropdownOption[]>([]);
  const isLoading = ref<boolean>(false);
  const filterOptionsMapping = ref<FilterOptionsMappingType | undefined>(
    undefined,
  );
  const query = ref<any>();
  const entityType = ref<string | Entitytyping>("");

  const init = async (
    entityTypeToSet: string | Entitytyping,
    filterOptionsMappingValue?: FilterOptionsMappingType,
  ) => {
    query.value = await loadDocument("GetFilterOptions");
    entityType.value = entityTypeToSet;
    setVariables({
      entityType: entityTypeToSet,
    });
    filterOptionsMapping.value = filterOptionsMappingValue;
  };

  const getBaseOptions = async () => {
    try {
      const entityTypeToSet = getNormalizedFiltersForApi().find(
        (filter) => filter.type === AdvancedFilterTypes.Type,
      )?.value;
      setAdvancedFilters(getNormalizedFiltersForApi());
      setsearchInputType(SearchInputType.AdvancedInputType);
      setEntityType(entityTypeToSet || (entityType.value as Entitytyping));

      await getEntities(undefined);
      isLoading.value = false;
    } catch (error) {
      isLoading.value = false;
    }
  };

  const setFilters = async (newFilters: AdvancedFilterInput[]) => {
    await initializeFilters({
      advancedFilters: transformFilterInputIntoAdvancedFilters(newFilters),
      fromState: false,
    });
  };

  const getOptions = async () => {
    try {
      const result = await apolloClient.query({
        query: query.value,
        variables: {
          input: getNormalizedFiltersForApi().map((filter) => ({
            ...filter,
            // TODO: should be defined in the GRAPHQL, not here
            provide_value_options_for_key:
              filter.type !== AdvancedFilterTypes.Type,
          })),
          limit: 11,
          entityType: entityType.value,
        },
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      });

      dropdownOptions.value = result.data.FilterOptions;
      isLoading.value = false;
    } catch (error) {
      isLoading.value = false;
    }
  };

  const getOptionFromEntity = (entity: BaseEntity): DropdownOption => {
    const { label: labelPath = "", value: valuePath = "" } =
      filterOptionsMapping.value || {};

    const labelValue = extractValueFromObject(entity, labelPath) as
      | string
      | undefined;
    const valueValue = extractValueFromObject(entity, valuePath) as
      | string
      | undefined;

    return {
      icon: DamsIcons.NoIcon,
      label: labelValue || getEntityTitle(entity),
      value: valueValue || entity.id,
    };
  };

  const getOptionsFromArrayValue = (
    entity: BaseEntity,
    path: string,
  ): DropdownOption[] => {
    const arrayValue = extractValueFromObject(entity, path);
    if (!Array.isArray(arrayValue)) return [getOptionFromEntity(entity)];

    return arrayValue.map((item) => ({
      icon: DamsIcons.NoIcon,
      label: item,
      value: item,
    }));
  };

  const getOptionsForEntity = (entity: BaseEntity): DropdownOption[] => {
    const { label: labelPath = "", value: valuePath = "" } =
      filterOptionsMapping.value || {};

    if (labelPath === valuePath) {
      return getOptionsFromArrayValue(entity, labelPath);
    }

    return [getOptionFromEntity(entity)];
  };

  const options = computed<DropdownOption[]>(() => {
    if (dropdownOptions.value?.length > 0) return dropdownOptions.value;
    return entities.value?.flatMap(getOptionsForEntity) || [];
  });

  const loading = computed<boolean>(() => {
    return isLoading.value || entitiesLoading.value;
  });

  return {
    init,
    setFilters,
    getOptions,
    getBaseOptions,
    entities,
    entitiesLoading,
    options,
    dropdownOptions,
    loading,
  };
};
