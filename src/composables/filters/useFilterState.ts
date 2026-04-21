import { computed, ref } from "vue";
import { dequal as isEqual } from "dequal";
import {
  type AdvancedFilter,
  type AdvancedFilterInput,
  type AdvancedFilters,
  AdvancedFilterTypes,
} from "@/generated-types/queries";
import { useFilterVariables } from "./useFilterVariables";
import { useFilterNormalization } from "./useFilterNormalization";
import { type FilterListItem } from "@/composables/useStateManagement";
import { extractValueFromObject } from "@/helpers";
import { useFormHelper } from "@/composables/useFormHelper";

export const useFilterState = () => {
  const { variables, setVariables } = useFilterVariables();
  const { normalizeFilterValue, shouldMatchExact, shouldMatchNot } = useFilterNormalization();
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
      initializeNewAdvancedFilters(advancedFilters as AdvancedFilters);
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
    matcher?: string,
  ) => {
    if (!key) return;
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
      match_not: shouldMatchNot(matcher),
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

  const initializeNewAdvancedFilters = (advancedFilters: AdvancedFilters) => {
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
      isActive: filter.hidden || filter.defaultValue !== undefined,
      isDisplayed: filter.isDisplayedByDefault ?? false,
      advancedFilter: filter,
      inputFromState: filterInput,
      selectedMatcher: undefined,
    });
  };

  const removeFilterFromList = (key: string) => {
    if (!key) return;
    filters.value = filters.value.filter((f) => f.advancedFilter.key !== key);
  };

  const createFilterInput = (filter: AdvancedFilter) => {
    if (!filter.hidden && filter.defaultValue === undefined) return undefined;

    return {
      type: filter.type,
      key: filter.key,
      value: getFilterValue(filter),
      item_types: filter.itemTypes,
      parent_key: filter.parentKey,
      match_exact: filter.matchExact ?? true,
      distinct_by: filter.distinctBy,
      metadata_key_as_label: filter.metadataKeyAsLabel,
      facets: filter.facets,
      bucket: filter.bucket,
      ...(filter.lookup ? { lookup: filter.lookup } : {}),
    };
  };

  const getFilterValue = (filter: AdvancedFilter) => {
    let value = resolveVariableReferences(filter);

    if (typeof value === "string" && value.includes("$")) {
      value = resolveAllVariables(value);
    }

    value = tryParseJson(value);

    const additionalFilterValues = getAdditionalFilterValues(filter);
    if (additionalFilterValues && Array.isArray(value)) {
      value = [...value, ...additionalFilterValues];
    }

    return value;
  };

  const resolveAllVariables = (rawValue: string) => {
    return rawValue.replace(/\$([\w.]+)/g, (match, path) => {
      const resolved = extractValueFromObject(variables.value, path);
      if (Array.isArray(resolved)) {
        return JSON.stringify(resolved);
      }
      return resolved !== undefined ? String(resolved) : match;
    });
  };

  const tryParseJson = <T>(value: any): T | any => {
    if (typeof value !== "string") return value;

    try {
      const sanitized = value.replace(/'/g, '"');
      const parsed = JSON.parse(sanitized);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch {
      // Parsing failed, it's a regular string
    }

    return value;
  };

  const getAdditionalFilterValues = (filter: AdvancedFilter) => {
    let additionalValues = undefined;

    if (
      filter.includeDefaultValuesFromIntialValues &&
      variables.value?.parentIds
    ) {
      const formValues = useFormHelper().getForm(
        variables.value?.parentIds[0],
      )?.values;
      additionalValues = filter.includeDefaultValuesFromIntialValues.flatMap(
        (intialValueKey) => {
          const value = formValues.intialValues[intialValueKey];
          return value ? value : [];
        },
      );
    }
    return additionalValues;
  };

  const resolveVariableReferences = (filter: AdvancedFilter) => {
    let value = filter.defaultValue;

    if (
      filter.type === AdvancedFilterTypes.Selection &&
      filter.hidden &&
      !filter.doNotOverrideDefaultValue &&
      (!value || (Array.isArray(value) && value.length === 0))
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
    initializeNewAdvancedFilters,
    resetFilters,
    activateFilter,
    deactivateFilter,
    removeFilterFromList,
  };
};
