import { useFilterBasic } from "./filters/useFilterBasic";
import { useFilterNormalization } from "./filters/useFilterNormalization";
import { useFilterState } from "./filters/useFilterState";

export const useFiltersBaseNew = () => {
  const basic = useFilterBasic();
  const normalization = useFilterNormalization();
  const state = useFilterState();

  const getNormalizedFiltersForApi = () => {
    return normalization.getNormalizedFiltersForApi(state.filters.value);
  };

  return {
    // basic
    rawFilters: basic.rawFilters,
    transformFilterInputIntoAdvancedFilters:
      basic.transformFilterInputIntoAdvancedFilters,

    // state manager
    filters: state.filters,
    variables: state.variables,
    setVariables: state.setVariables,
    activeFilterCount: state.activeFilterCount,
    displayedFilters: state.displayedFilters,
    activeFilters: state.activeFilters,
    initializeFilters: state.initializeFilters,
    initializeNewAdvancedFilters: state.initializeNewAdvancedFilters,
    resetFilters: state.resetFilters,
    activateFilter: state.activateFilter,
    deactivateFilter: state.deactivateFilter,
    removeFilterFromList: state.removeFilterFromList,

    // normalization
    getNormalizedFiltersForApi,
  };
};
