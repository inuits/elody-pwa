import { ref, computed } from "vue";
import isEqual from "lodash.isequal";
import type {
  AdvancedFilterInput,
  AdvancedFilters,
  AdvancedFilter,
  DropdownOption,
} from "@/generated-types/queries";
import { AdvancedFilterTypes } from "@/generated-types/queries";
import { useFilterVariables } from "./useFilterVariables";
import { useFilterNormalization } from "./useFilterNormalization";
import { type FilterListItem } from "@/composables/useStateManagement";

export const useFilterState = () => {
  const { variables, extractValueFromObject, setVariables } =
    useFilterVariables();
  const { normalizeFilterValue, shouldMatchExact } = useFilterNormalization();
  const filters = ref<FilterListItem[]>([]);

  const activeFilterCount = computed(
    () =>
      filters.value.filter((f) => !f.advancedFilter.hidden && f.isActive)
        .length,
  );

  const displayedFilters = computed(() =>
    filters.value.filter((filter) => filter.isDisplayed),
  );

  const activeFilters = computed(() =>
    filters.value.filter((filter) => filter.isDisplayed && filter.isActive),
  );

  const initializeFilters = async ({
    advancedFilters,
    fromState = false,
  }: {
    advancedFilters: AdvancedFilters | FilterListItem[];
    fromState?: boolean;
  }) => {
    filters.value = [];
    if (!advancedFilters) return;

    if (fromState) {
      restoreFiltersFromState(advancedFilters as FilterListItem[]);
    } else {
      initializeNewFilters(advancedFilters as AdvancedFilters);
    }
  };

  const resetFilters = () => {
    filters.value.forEach((filter) =>
      deactivateFilter(filter.advancedFilter.key),
    );
  };

  const activateFilter = (
    key: string | string[],
    value: any,
    matcher?: DropdownOption,
  ) => {
    const filter = filters.value.find((f) =>
      isEqual(f.advancedFilter.key, key),
    );
    if (!filter) return;

    const filterInput = {
      type: filter.advancedFilter.type,
      key: filter.advancedFilter.key,
      parent_key: filter.advancedFilter.parentKey,
      value: normalizeFilterValue(filter, value, matcher),
      match_exact: shouldMatchExact(matcher),
      aggregation: filter.advancedFilter.aggregation,
      distinct_by: filter.advancedFilter.distinctBy,
      ...(filter.advancedFilter.lookup
        ? { lookup: filter.advancedFilter.lookup }
        : {}),
    };

    filter.isActive = filterInput.value !== undefined;
    filter.inputFromState = filterInput;
    filter.selectedMatcher = matcher;
  };

  const deactivateFilter = (key: string) => {
    const filter = filters.value.find((f) => f.advancedFilter.key === key);
    if (!filter || filter.advancedFilter.hidden) return;

    filter.isActive = false;
    filter.inputFromState = undefined;
    filter.selectedMatcher = undefined;
  };

  const initializeNewFilters = (advancedFilters: AdvancedFilters) => {
    Object.values(advancedFilters).forEach((filter) => {
      if (typeof filter === "string") return;
      addFilterToList(filter, createFilterInput(filter));
    });
  };

  const addFilterToList = (
    filter: AdvancedFilter,
    filterInput?: AdvancedFilterInput,
  ) => {
    filters.value.push({
      isActive: filter.hidden || !!filter.defaultValue,
      isDisplayed: filter.isDisplayedByDefault ?? false,
      advancedFilter: filter,
      inputFromState: filterInput,
      selectedMatcher: undefined,
    });
  };

  const createFilterInput = (filter: AdvancedFilter) => {
    if (!filter.hidden && !filter.defaultValue) return undefined;

    return {
      type: filter.type,
      key: filter.key,
      value: getFilterValue(filter),
      item_types: filter.itemTypes,
      parent_key: filter.parentKey,
      match_exact: filter.matchExact ?? true,
      distinct_by: filter.distinctBy,
      ...(filter.lookup ? { lookup: filter.lookup } : {}),
    };
  };

  const getFilterValue = (filter: AdvancedFilter) => {
    let value = resolveVariableReferences(filter);

    if (typeof value === "string" && value.startsWith("$")) {
      const path = value.substring(1);
      value =
        extractValueFromObject(variables.value, path) ?? filter.defaultValue;
    }

    return value;
  };

  const resolveVariableReferences = (filter: AdvancedFilter) => {
    let value = filter.defaultValue;

    if (
      filter.type === AdvancedFilterTypes.Selection &&
      filter.hidden &&
      !filter.doNotOverrideDefaultValue &&
      !value
    ) {
      value = "$parentIds";
    }

    if (typeof value === "string" && value?.includes("entityType")) {
      value = "$entityType";
    }

    return value;
  };

  const restoreFiltersFromState = (filterListItems: FilterListItem[]) => {
    filters.value = [...filterListItems];
  };

  return {
    filters,
    variables,
    setVariables,
    activeFilterCount,
    displayedFilters,
    activeFilters,
    initializeFilters,
    resetFilters,
    activateFilter,
    deactivateFilter,
  };
};
