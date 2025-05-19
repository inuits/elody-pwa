import { describe, expect, it } from "vitest";
import { useFiltersBaseNew } from "@/composables/useFiltersBaseNew";

describe("useFiltersBaseNew - State Management", () => {
  it("displays correct filter count for active filters", () => {
    const { filters, activeFilterCount } = useFiltersBaseNew();
    expect(activeFilterCount.value).toEqual(0);

    filters.value = [
      {
        isDisplayed: true,
        advancedFilter: {
          type: "text",
          key: ["elody:1|metadata.title.value"],
          label: "metadata.labels.title",
          isDisplayedByDefault: true,
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        isActive: true,
        inputFromState: {
          type: "text",
          key: ["elody:1|metadata.title.value"],
          value: "title",
          match_exact: false,
        },
      },
    ];

    expect(activeFilterCount.value).toEqual(1);
  });

  it("calculates displayedFilters correctly", () => {
    const { filters, displayedFilters } = useFiltersBaseNew();

    filters.value = [
      { isDisplayed: true, advancedFilter: { key: "1" }, isActive: false },
      { isDisplayed: false, advancedFilter: { key: "2" }, isActive: true },
      { isDisplayed: true, advancedFilter: { key: "3" }, isActive: true },
    ];

    expect(displayedFilters.value.length).toBe(2);
    expect(displayedFilters.value.map((f) => f.advancedFilter.key)).toEqual([
      "1",
      "3",
    ]);
  });

  it("calculates activeFilters correctly", () => {
    const { filters, activeFilters } = useFiltersBaseNew();

    filters.value = [
      { isDisplayed: true, advancedFilter: { key: "1" }, isActive: true },
      { isDisplayed: false, advancedFilter: { key: "2" }, isActive: true },
      { isDisplayed: true, advancedFilter: { key: "3" }, isActive: false },
    ];

    expect(activeFilters.value.length).toBe(1);
    expect(activeFilters.value[0].advancedFilter.key).toBe("1");
  });

  it("initializes filters from state", async () => {
    const { filters, initializeFilters } = useFiltersBaseNew();

    const stateFilters = [
      {
        isActive: false,
        isDisplayed: true,
        advancedFilter: {
          type: "text",
          key: ["elody:1|metadata.name.value"],
          label: "metadata.labels.name",
          isDisplayedByDefault: true,
          tooltip: true,
          __typename: "AdvancedFilter",
        },
      },
    ];

    await initializeFilters({ advancedFilters: stateFilters, fromState: true });
    expect(filters.value.length).toBe(1);
    expect(filters.value[0].advancedFilter.key).toEqual([
      "elody:1|metadata.name.value",
    ]);
  });

  it("activates a filter with matcher", () => {
    const { filters, activateFilter } = useFiltersBaseNew();

    filters.value = [
      {
        isDisplayed: true,
        advancedFilter: {
          type: "text",
          key: "test.key",
          label: "Test",
          isDisplayedByDefault: true,
        },
        isActive: false,
      },
    ];

    const matcher = { value: "ContainsMatcher", label: "contains" };
    activateFilter("test.key", "test value", matcher);

    const filter = filters.value[0];
    expect(filter.isActive).toBe(true);
    expect(filter.selectedMatcher).toEqual(matcher);
  });

  it("deactivates a filter", () => {
    const { filters, deactivateFilter } = useFiltersBaseNew();

    filters.value = [
      {
        isDisplayed: true,
        advancedFilter: {
          type: "text",
          key: "test.key",
          label: "Test",
          isDisplayedByDefault: true,
        },
        isActive: true,
        inputFromState: { type: "text", key: "test.key", value: "test" },
        selectedMatcher: { value: "ExactMatcher", label: "is exactly" },
      },
    ];

    deactivateFilter("test.key");

    const filter = filters.value[0];
    expect(filter.isActive).toBe(false);
    expect(filter.inputFromState).toBeUndefined();
  });
});
