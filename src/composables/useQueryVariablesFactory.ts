import { useLibraryBar } from "@/composables/useLibraryBar";
import { ref } from "vue";
import { type AdvancedFilterInputType } from "@/generated-types/queries";

const { selectedPaginationLimitOption, selectedSkip, queryVariables } =
  useLibraryBar();

const entityType = ref<string>();
const relationType = ref<string>();
const identifiers = ref<string>();
const searchInputType = ref<string>();
const advancedFilterInputs = ref<AdvancedFilterInputType[]>();

const changePaginationNumber = ref<number | undefined>(undefined);

export const useQueryVariablesFactory = () => {
  const setEntityType = (value: string) => {
    if (value !== undefined) entityType.value = value;
  };
  const setQueryRelationType = (value: string) => {
    if (value !== undefined) relationType.value = value;
  };
  const setIdentifiers = (value: string) => {
    if (value !== undefined) identifiers.value = value;
  };
  const setSearchInputType = (value: string) => {
    if (value !== undefined) searchInputType.value = value;
  };
  const setAdvancedFilterInputs = (value: AdvancedFilterInputType) => {
    const advancedFilterMapping: AdvancedFilterInputType[] = [];
    Object.entries(value).forEach((advancedFilter) => {
      if (advancedFilter[0] === "__typename") return;
      advancedFilterMapping.push({
        lookup: advancedFilter[1].lookup,
        type: advancedFilter[1].type,
        parent_key: advancedFilter[1].parentKey,
        key: advancedFilter[1].key,
        value:
          advancedFilter[1].parentKey === "relations" ||
          advancedFilter[1].parentKey === "edge"
            ? [identifiers.value]
            : advancedFilter[1].defaultValue,
        item_types: advancedFilter[1].itemTypes,
        edge_collection: advancedFilter[1].edgeCollection,
        match_exact: true,
      });
    });
    advancedFilterInputs.value = advancedFilterMapping;
  };

  const setChangePaginationNumber = (value: number | undefined) => {
    changePaginationNumber.value = value;
  };

  const createQueryVariables = () => {
    let pagination = selectedPaginationLimitOption.value?.value;
    if (changePaginationNumber.value)
      pagination += changePaginationNumber.value;

    const variables = {
      type: entityType.value,
      limit: pagination,
      skip: selectedSkip.value.value,
      searchValue: queryVariables.value?.searchValue,
      advancedSearchValue: [],
      advancedFilterInputs: advancedFilterInputs.value,
      searchInputType: searchInputType.value,
      userUuid: identifiers.value,
    };
    return variables;
  };

  return {
    createQueryVariables,
    setIdentifiers,
    setQueryRelationType,
    setSearchInputType,
    setEntityType,
    setChangePaginationNumber,
    setAdvancedFilterInputs,
  };
};
