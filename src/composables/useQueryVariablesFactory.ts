import { useLibraryBar } from "@/composables/useLibraryBar";
import { ref } from "vue";

const { selectedPaginationLimitOption, selectedSkip, queryVariables } =
  useLibraryBar();

const entityType = ref<String>();
const relationType = ref<String>();
const identifiers = ref<String>();
const searchInputType = ref<String>();

const changePaginationNumber = ref<number | undefined>(undefined);

export const useQueryVariablesFactory = () => {
  const setEntityType = (value: String) => {
    entityType.value = value;
  };
  const setQueryRelationType = (value: String) => {
    relationType.value = value;
  };
  const setIdentifiers = (value: String) => {
    identifiers.value = value;
  };
  const setSearchInputType = (value: String) => {
    searchInputType.value = value;
  };

  const setChangePaginationNumber = (value: number | undefined) => {
    changePaginationNumber.value = value;
  };

  const createQueryVariables = () => {
    let pagination = selectedPaginationLimitOption.value?.value;
    if (changePaginationNumber.value)
      pagination += changePaginationNumber.value;
    return {
      limit: pagination,
      skip: selectedSkip.value,
      searchValue: queryVariables.value?.searchValue,
      advancedSearchValue: [],
      advancedFilterInputs: [
        {
          type: "type",
          value: entityType.value,
          match_exact: true,
        },
        {
          type: "selection",
          parent_key: "relations",
          key: relationType.value,
          value: [identifiers.value],
          match_exact: true,
        },
      ],
      searchInputType: searchInputType.value,
      userUuid: identifiers.value,
    };
  };

  return {
    createQueryVariables,
    setIdentifiers,
    setQueryRelationType,
    setSearchInputType,
    setEntityType,
    setChangePaginationNumber,
  };
};
