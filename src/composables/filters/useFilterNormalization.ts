import { addCurrentTimeZoneToDateTimeString, isDateTime } from "@/helpers";
import { Matchers, AdvancedFilterTypes } from "@/generated-types/queries";
import type {
  AdvancedFilterInput,
  AdvancedFilter,
  DropdownOption,
} from "@/generated-types/queries";
import { type FilterListItem } from "@/composables/useStateManagement";

export const useFilterNormalization = () => {
  const isNil = (value: unknown) => value == null || value == undefined;

  const normalizeFilterForApi = (
    filter: FilterListItem,
  ): AdvancedFilterInput => {
    const newFilter: AdvancedFilterInput = {
      type: filter.advancedFilter.type,
      parent_key: filter.advancedFilter.parentKey,
      key: filter.advancedFilter.key,
      value: filter.inputFromState?.value ?? undefined,
      match_exact: filter.inputFromState?.match_exact ?? undefined,
      item_types: filter.inputFromState?.item_types ?? undefined,
      distinct_by: filter.advancedFilter.distinctBy ?? undefined,
      metadata_key_as_label:
        filter.inputFromState?.metadata_key_as_label ?? undefined,
      aggregation: filter.advancedFilter.aggregation,
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
  ): AdvancedFilterInput[] => {
    return filters
      .filter((filter) => filter.isActive)
      .map(normalizeFilterForApi);
  };

  const shouldMatchExact = (matcher?: DropdownOption): boolean => {
    return (
      !!matcher &&
      [
        Matchers.ExactMatcher,
        Matchers.MinIncludedMatcher,
        Matchers.MaxIncludedMatcher,
      ].includes(matcher.value)
    );
  };

  const normalizeFilterValue = (
    filter: { advancedFilter: AdvancedFilter },
    value: any,
    matcher?: DropdownOption,
  ): any => {
    const matcherType = matcher?.value;
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
    isNil(value?.min) ? undefined : { max: value.min, included: true };
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
