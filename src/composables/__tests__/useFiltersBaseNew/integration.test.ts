import { describe, expect, it } from "vitest";
import { useFiltersBaseNew } from "@/composables/useFiltersBaseNew";
import { sortFilters } from "./test-utils";

describe("useFiltersBaseNew - Integration", () => {
  it("combines variable resolution with filter activation", async () => {
    const {
      setVariables,
      initializeFilters,
      activateFilter,
      getNormalizedFiltersForApi,
    } = useFiltersBaseNew();

    await setVariables({
      entityType: "test_entity",
    });

    await initializeFilters({
      advancedFilters: {
        typeFilter: {
          type: "type",
          defaultValue: "$entityType",
          hidden: true,
          __typename: "AdvancedFilter",
        },
        textFilter: {
          type: "text",
          key: "test.key",
          label: "Test",
          isDisplayedByDefault: true,
          __typename: "AdvancedFilter",
        },
      },
      fromState: false,
    });

    activateFilter("test.key", "search_value");

    const normalized = getNormalizedFiltersForApi();
    expect(sortFilters(normalized)).toEqual(
      sortFilters([
        {
          type: "type",
          value: "test_entity",
          match_exact: true,
        },
        {
          type: "text",
          key: "test.key",
          value: "search_value",
          match_exact: false,
        },
      ]),
    );
  });

  it("maintains state when activating multiple filter types", async () => {
    const { filters, initializeFilters, activateFilter } = useFiltersBaseNew();

    await initializeFilters({
      advancedFilters: {
        textFilter: {
          type: "text",
          key: "text.key",
          isDisplayedByDefault: true,
          __typename: "AdvancedFilter",
        },
        dateFilter: {
          type: "date",
          key: "date.key",
          isDisplayedByDefault: true,
          __typename: "AdvancedFilter",
        },
      },
      fromState: false,
    });

    activateFilter("text.key", "initial_value");

    activateFilter("date.key", { min: "2023-01-01" });

    const textFilter = filters.value.find(
      (f) => f.advancedFilter.key === "text.key",
    );
    expect(textFilter?.isActive).toBe(true);

    const dateFilter = filters.value.find(
      (f) => f.advancedFilter.key === "date.key",
    );
    expect(dateFilter?.isActive).toBe(true);
  });

  it("handles complex filter combinations with variables", async () => {
    const {
      setVariables,
      initializeFilters,
      activateFilter,
      getNormalizedFiltersForApi,
    } = useFiltersBaseNew();

    await setVariables({
      parentIds: ["parent1", "parent2"],
      entity: {
        id: "entity123",
        relations: [{ target: { id: "rel1" } }, { target: { id: "rel2" } }],
      },
    });

    await initializeFilters({
      advancedFilters: {
        parentFilter: {
          type: "selection",
          defaultValue: "$parentIds",
          hidden: true,
          __typename: "AdvancedFilter",
        },
        relationFilter: {
          type: "selection",
          defaultValue: "$entity.relations.target.id",
          hidden: true,
          __typename: "AdvancedFilter",
        },
        textFilter: {
          type: "text",
          key: "search.key",
          isDisplayedByDefault: true,
          __typename: "AdvancedFilter",
        },
      },
      fromState: false,
    });

    activateFilter("search.key", "test");

    const normalized = getNormalizedFiltersForApi();
    expect(sortFilters(normalized)).toEqual(
      sortFilters([
        {
          type: "selection",
          value: ["parent1", "parent2"],
          match_exact: true,
        },
        {
          type: "selection",
          value: ["rel1", "rel2"],
          match_exact: true,
        },
        {
          type: "text",
          key: "search.key",
          value: "test",
          match_exact: false,
        },
      ]),
    );
  });

  it("persists display state when resetting filters", async () => {
    const { filters, initializeFilters, activateFilter, resetFilters } =
      useFiltersBaseNew();

    await initializeFilters({
      advancedFilters: {
        textFilter: {
          type: "text",
          key: "text.key",
          isDisplayedByDefault: false,
          __typename: "AdvancedFilter",
        },
      },
      fromState: false,
    });

    filters.value[0].isDisplayed = true;
    activateFilter("text.key", "value");

    await resetFilters();

    expect(filters.value[0].isDisplayed).toBe(true);
    expect(filters.value[0].isActive).toBe(false);
  });
});
