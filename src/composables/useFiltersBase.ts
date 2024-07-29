import { ref, computed } from "vue";
import { type AdvancedFilterInput } from "@/generated-types/queries";
import { type FilterListItem } from "@/composables/useStateManagement";

export const useFiltersBase = () => {
  const filters = ref<FilterListItem[]>([]);
  const activeFilters = ref<AdvancedFilterInput[]>([]);

  const activeFilterCount = computed<number>(() => {
    let filterCount = 0;
    filters.value.forEach((filter) => {
      if (filter.advancedFilter.hidden) return;
      filterCount += filter.isActive ? 1 : 0;
    });

    return filterCount;
  });

  const displayedFilters = computed(() => {
    return filters.value.filter((filter) => filter.isDisplayed);
  });

  return {
    filters,
    activeFilters,
    activeFilterCount,
    displayedFilters,
  };
};
