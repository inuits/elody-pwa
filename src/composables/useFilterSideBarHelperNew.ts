import { ref, computed } from "vue";
import {
  type FilterInList,
  clearAdvancedSearchInput,
  getActiveFilters,
  type AdvancedFilter,
} from "@/composables/useFilterHelper";

export const initialFilters = ref<FilterInList[]>([]);

export const clickedFilter = ref<AdvancedFilter[]>([]);

export const refValue = ref<AdvancedFilter>({} as AdvancedFilter);
export const refValue2 = ref<String>("");

export const useFilterSideBarHelperNew = () => {
  const clearInitialFilters = (acceptedEntityTypes: string[]) => {
    initialFilters.value = clearAdvancedSearchInput(
      initialFilters.value,
      acceptedEntityTypes
    );
  };

  const activeCount = computed(
    () => getActiveFilters(initialFilters.value).length
  );
  return {
    clearInitialFilters,
    initialFilters,
    activeCount,
    clickedFilter,
    refValue,
    refValue2,
  };
};
