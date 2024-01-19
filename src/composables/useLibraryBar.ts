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
  const setSelectedPaginationLimitOption = (limit: number) => {
    if (!limit) return;
    selectedPaginationLimitOption.value = { label: `${limit}`, value: limit };
  };
  const setSelectedSkip = (skip: number) => {
    if (!skip) return;
    selectedSkip.value = { label: `${skip}`, value: skip };
  };
  const setSelectedSortOption = (sort: number) => {
    if (!sort) return;
    selectedSortOption.value = { label: `${sort}`, value: sort };
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
    setSelectedPaginationLimitOption,
    selectedPaginationLimitOption,
    setSelectedSkip,
    selectedSkip,
    setSelectedSortOption,
    selectedSortOption,
    setQueryVariables,
    queryVariables,
    setTotalItemsCount,
    totalItemsCount,
    isAsc,
  };
};
