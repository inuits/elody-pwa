import { registerQueryFixture } from "@/main";

/**
 * The rail fetches its filter definitions and the matcher mapping on mount;
 * both resolve against these fixtures through mockMain's fixture link, so
 * the story renders the real request flow without a backend.
 */
const advancedFilter = (overrides: Record<string, unknown>) => ({
  __typename: "AdvancedFilter",
  operator: null,
  selectionOption: null,
  isDisplayedByDefault: true,
  defaultMatcher: null,
  allowedMatchers: null,
  options: null,
  filterOptionsMapping: null,
  limitConfig: null,
  useOldWayToFetchOptions: null,
  advancedFilterInputForRetrievingOptions: null,
  aggregation: null,
  bucket: null,
  context: null,
  defaultValueMapping: null,
  distinctBy: null,
  doNotOverrideDefaultValue: null,
  entityType: null,
  facets: null,
  hidden: false,
  includeDefaultValuesFromIntialValues: null,
  itemTypes: null,
  lookup: null,
  matchExact: null,
  matcherLabels: null,
  matchersType: null,
  metadataKeyAsLabel: null,
  parentKey: null,
  relationKey: null,
  selectionsOnly: null,
  showTimeForDateFilter: null,
  tooltip: null,
  unit: null,
  ...overrides,
});

export const registerFilterFixtures = () => {
  registerQueryFixture("GetFilterMatcherMapping", {
    FilterMatcherMapping: [
      {
        __typename: "FilterMatchers",
        key: "text",
        matchers: ["ContainsMatcher", "ExactMatcher", "NoneMatcher", "AnyMatcher"],
      },
      {
        __typename: "FilterMatchers",
        key: "selection",
        matchers: ["ExactMatcher", "NoneMatcher", "AnyMatcher"],
      },
      {
        __typename: "FilterMatchers",
        key: "date",
        matchers: ["MinIncludedMatcher", "MaxIncludedMatcher", "InBetweenMatcher"],
      },
      { __typename: "FilterMatchers", key: "number", matchers: ["ExactMatcher"] },
      { __typename: "FilterMatchers", key: "boolean", matchers: ["ExactMatcher"] },
      { __typename: "FilterMatchers", key: "type", matchers: ["ExactMatcher"] },
    ],
  });

  registerQueryFixture("getAdvancedFilters", {
    EntityTypeFilters: {
      __typename: "Manifestation",
      advancedFilters: {
        __typename: "AdvancedFilters",
        title: advancedFilter({
          type: "text",
          key: ["title"],
          label: "Title",
        }),
        genre: advancedFilter({
          type: "selection",
          key: ["genre"],
          label: "Genre",
          selectionOption: "checkboxlist",
          options: [
            { __typename: "DropdownOption", icon: null, label: "adventure", value: "adventure" },
            { __typename: "DropdownOption", icon: null, label: "fantasy", value: "fantasy" },
            { __typename: "DropdownOption", icon: null, label: "fairy tale", value: "fairy-tale" },
          ],
        }),
        publication_year: advancedFilter({
          type: "date",
          key: ["publication_year"],
          label: "Year of publication",
        }),
        language: advancedFilter({
          type: "text",
          key: ["language"],
          label: "Language",
          isDisplayedByDefault: false,
        }),
      },
    },
  });
};
