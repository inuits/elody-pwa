import type {
  DropdownOption,
  GetEntitiesQueryVariables,
} from "@/generated-types/queries";
import { ref } from "vue";

const selectedPaginationLimitOption = ref<DropdownOption>();
const selectedSkip = ref<DropdownOption>();
const isAsc = ref<boolean>(false);
const selectedSortOption = ref<DropdownOption>();
const queryVariables = ref<GetEntitiesQueryVariables>();
const totalItemsCount = ref<number>();

export const useLibraryBar = () => {
  const setSelectedPaginationLimitOption = (
    limitOption: DropdownOption | undefined
  ) => {
    if (!limitOption) return;
    selectedPaginationLimitOption.value = limitOption;
  };

  const setSelectedSkip = (skip: number | undefined) => {
    if (!skip) return;
    selectedSkip.value = { label: `${skip}`, value: skip };
  };

  const setSelectedSortOption = (sortOption: DropdownOption | undefined) => {
    if (!sortOption) return;
    selectedSortOption.value = sortOption;
  };

  const setIsAsc = (asc: boolean | undefined) => {
    if (!asc) return;
    isAsc.value = asc;
  };

  const setQueryVariables = (variables: GetEntitiesQueryVariables) => {
    if (!variables) return;
    queryVariables.value = variables;
  };

  const setTotalItemsCount = (total: number) => {
    if (!total) return;
    totalItemsCount.value = total;
  };

  return {
    isAsc,
    queryVariables,
    selectedPaginationLimitOption,
    selectedSkip,
    selectedSortOption,
    setIsAsc,
    setQueryVariables,
    setSelectedPaginationLimitOption,
    setSelectedSkip,
    setSelectedSortOption,
    setTotalItemsCount,
    totalItemsCount,
  };
};
