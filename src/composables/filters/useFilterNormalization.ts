import { addCurrentTimeZoneToDateTimeString, isDateTime } from "@/helpers";
import { Matchers, AdvancedFilterTypes } from "@/generated-types/queries";
import type {
  AdvancedFilterInput,
  AdvancedFilter,
} from "@/generated-types/queries";
import { type FilterListItem } from "@/composables/useStateManagement";

export const useFilterNormalization = () => {
  const isNil = (value: unknown) => value == null || value == undefined;

  const normalizeFilterForApi = (
    filter: FilterListItem,
    ignoreFacets: boolean = true,
  ): AdvancedFilterInput => {
    const newFilter: AdvancedFilterInput = {
      type: filter.advancedFilter.type,
      parent_key: filter.advancedFilter.parentKey,
      key: filter.advancedFilter.key,
      value: filter.inputFromState?.value ?? undefined,
      match_exact: ignoreFacets
        ? (filter.inputFromState?.match_exact ?? undefined)
        : undefined,
      item_types: filter.inputFromState?.item_types ?? undefined,
      distinct_by: filter.advancedFilter.distinctBy ?? undefined,
      metadata_key_as_label:
        filter.inputFromState?.metadata_key_as_label ?? undefined,
      aggregation: filter.advancedFilter.aggregation,
      bucket: filter.advancedFilter.bucket ?? undefined,
      operator: filter.advancedFilter.operator ?? undefined,
      facets: ignoreFacets
        ? undefined
        : (getNormalizedFacets(filter.advancedFilter.facets) ?? undefined),
    };

    if (filter.advancedFilter.lookup) {
      newFilter.lookup = {
        from: filter.advancedFilter.lookup.from,
        local_field: filter.advancedFilter.lookup.local_field,
        foreign_field: filter.advancedFilter.lookup.foreign_field,
        as: filter.advancedFilter.lookup.as,
      };
    }

    return JSON.parse(JSON.stringify(newFilter));
  };

  const getNormalizedFiltersForApi = (
    filters: FilterListItem[],
    ignoreFacets: boolean = true,
  ): AdvancedFilterInput[] => {
    return filters
      .filter((filter) => filter.isActive)
      .map((filter) =>
        normalizeFilterForApi(
          filter,
          ignoreFacets || !filter.advancedFilter.facets,
        ),
      );
  };

  const getNormalizedFacets = (facets?: any[]) => {
    if (!facets) return;

    const facetFilter = facets.map((item: any) => {
      const facet: { key: string; lookups?: { [key: string]: string } } = {
        key: item.key,
      };

      if (item.lookups) {
        facet.lookups = {
          from: item.lookup.from,
          local_field: item.lookup.local_field,
          foreign_field: item.lookup.foreign_field,
          as: item.lookup.as,
        };
      }

      return facet;
    });

    return JSON.parse(JSON.stringify(facetFilter));
  };

  const shouldMatchExact = (matcher?: string): boolean => {
    return (
      !!matcher &&
      [
        Matchers.ExactMatcher,
        Matchers.MinIncludedMatcher,
        Matchers.MaxIncludedMatcher,
      ].includes(matcher)
    );
  };

  const normalizeFilterValue = (
    filter: { advancedFilter: AdvancedFilter },
    value: any,
    matcherType?: string,
  ): any => {
    if (matcherType === Matchers.AnyMatcher) return "*";
    if (matcherType === Matchers.NoneMatcher) return "";

    switch (matcherType) {
      case Matchers.ExactMatcher:
        return normalizeExactValue(filter, value);
      case Matchers.ContainsMatcher:
        return normalizeContainsValue(value);
      case Matchers.MinIncludedMatcher:
        return normalizeMinValue(value);
      case Matchers.MaxIncludedMatcher:
        return normalizeMaxValue(value);
      case Matchers.InBetweenMatcher:
        return normalizeRangeValue(value);
      default:
        return value;
    }
  };

  const normalizeExactValue = (
    filter: { advancedFilter: AdvancedFilter },
    value: any,
  ) => {
    switch (filter.advancedFilter.type) {
      case AdvancedFilterTypes.Date:
        return isDateTime(value)
          ? addCurrentTimeZoneToDateTimeString(value)
          : value;
      case AdvancedFilterTypes.Boolean:
        return Array.isArray(value) ? value[0] : value;
      case AdvancedFilterTypes.Selection:
        return Array.isArray(value)
          ? value.map((v) => v?.value ?? v)
          : (value?.value ?? value);
      default:
        return value;
    }
  };

  const normalizeContainsValue = (value: any) =>
    typeof value === "string" ? value : String(value);
  const normalizeMinValue = (value: any) =>
    isNil(value?.min) ? undefined : { min: value.min, included: true };
  const normalizeMaxValue = (value: any) =>
    isNil(value?.max) ? undefined : { max: value.max, included: true };
  const normalizeRangeValue = (value: any) =>
    isNil(value?.max) || isNil(value?.min)
      ? undefined
      : {
          min: value?.min,
          max: value?.max,
          included: true,
        };

  return {
    normalizeFilterForApi,
    getNormalizedFiltersForApi,
    normalizeFilterValue,
    shouldMatchExact,
  };
};
