import { describe, expect, it } from "vitest";
import { useFiltersBaseNew } from "@/composables/useFiltersBaseNew";
import { sortFilters, basicInputFromState } from "./test-utils";

describe("useFiltersBaseNew - Variable Resolution", () => {
  it("replaces entityType to an actual value", async () => {
    const {
      filters,
      activeFilterCount,
      initializeFilters,
      getNormalizedFiltersForApi,
      setVariables,
    } = useFiltersBaseNew();
    expect(activeFilterCount.value).toEqual(0);

    setVariables({
      entityType: "giga_test",
    });

    const fetchedFilters = {
      type: {
        type: "type",
        defaultValue: "entityType",
        hidden: true,
        __typename: "AdvancedFilter",
      },
      __typename: "AdvancedFilters",
    };

    await initializeFilters({
      advancedFilters: fetchedFilters,
      fromState: false,
    });

    const actualFilters = [
      {
        isActive: true,
        isDisplayed: false,
        advancedFilter: {
          type: "type",
          defaultValue: "entityType",
          hidden: true,
          __typename: "AdvancedFilter",
        },
        inputFromState: {
          ...basicInputFromState,
          type: "type",
          value: "giga_test",
          match_exact: true,
        },
        selectedMatcher: undefined,
      },
    ];

    const actualActiveFilters = [
      {
        type: "type",
        value: "giga_test",
        match_exact: true,
      },
    ];

    expect(sortFilters(filters.value)).toEqual(sortFilters(actualFilters));
    expect(sortFilters(getNormalizedFiltersForApi())).toEqual(
      sortFilters(actualActiveFilters),
    );
  });

  it("replaces parentIds to an actual value", async () => {
    const {
      filters,
      activeFilterCount,
      initializeFilters,
      getNormalizedFiltersForApi,
      setVariables,
    } = useFiltersBaseNew();
    expect(activeFilterCount.value).toEqual(0);

    setVariables({
      parentIds: ["20921-as-21kjsa2-1241-as", "92sdx0-2uskj-487219"],
    });

    const fetchedFilters = {
      type: {
        type: "selection",
        defaultValue: "",
        hidden: true,
        __typename: "AdvancedFilter",
      },
      __typename: "AdvancedFilters",
    };

    await initializeFilters({
      advancedFilters: fetchedFilters,
      fromState: false,
    });

    const actualFilters = [
      {
        isActive: true,
        isDisplayed: false,
        advancedFilter: {
          type: "selection",
          defaultValue: "",
          hidden: true,
          __typename: "AdvancedFilter",
        },
        inputFromState: {
          ...basicInputFromState,
          type: "selection",
          value: ["20921-as-21kjsa2-1241-as", "92sdx0-2uskj-487219"],
          match_exact: true,
        },
        selectedMatcher: undefined,
      },
    ];

    const actualActiveFilters = [
      {
        type: "selection",
        value: ["20921-as-21kjsa2-1241-as", "92sdx0-2uskj-487219"],
        match_exact: true,
      },
    ];

    expect(sortFilters(filters.value)).toEqual(sortFilters(actualFilters));
    expect(sortFilters(getNormalizedFiltersForApi())).toEqual(
      sortFilters(actualActiveFilters),
    );
  });

  it("replaces nested object path $entity.id to ids", async () => {
    const { initializeFilters, setVariables, getNormalizedFiltersForApi } =
      useFiltersBaseNew();

    setVariables({
      entity: {
        id: "test-entity-123",
        relationValues: [
          { type: "child", target: { id: "child-1" } },
          { type: "child", target: { id: "child-2" } },
        ],
      },
    });

    const fetchedFilters = {
      idFilter: {
        type: "text",
        defaultValue: "$entity.id",
        hidden: true,
        __typename: "AdvancedFilter",
      },
      __typename: "AdvancedFilters",
    };

    await initializeFilters({
      advancedFilters: fetchedFilters,
      fromState: false,
    });

    expect(getNormalizedFiltersForApi()).toEqual([
      {
        type: "text",
        value: "test-entity-123",
        match_exact: true,
      },
    ]);
  });

  it("extracts array of values from nested path $entity.relations.target.id", async () => {
    const { initializeFilters, setVariables, getNormalizedFiltersForApi } =
      useFiltersBaseNew();

    setVariables({
      entity: {
        relationValues: [
          { target: { id: "image-1", name: "First" } },
          { target: { id: "image-2", name: "Second" } },
        ],
      },
    });

    const fetchedFilters = {
      relationFilter: {
        type: "selection",
        defaultValue: "$entity.relationValues.target.id",
        hidden: true,
        __typename: "AdvancedFilter",
      },
      __typename: "AdvancedFilters",
    };

    await initializeFilters({
      advancedFilters: fetchedFilters,
      fromState: false,
    });

    expect(getNormalizedFiltersForApi()).toEqual([
      {
        type: "selection",
        value: ["image-1", "image-2"],
        match_exact: true,
      },
    ]);
  });

  it("extracts array of values from nested path $entity.relationValues.target.id", async () => {
    const { initializeFilters, setVariables, getNormalizedFiltersForApi } =
      useFiltersBaseNew();

    setVariables({
      entity: {
        relationValues: {
          target: [
            { id: "rel-1", name: "First" },
            { id: "rel-2", name: "Second" },
          ],
        },
      },
    });

    const fetchedFilters = {
      relationFilter: {
        type: "selection",
        defaultValue: "$entity.relationValues.target.id",
        hidden: true,
        __typename: "AdvancedFilter",
      },
      __typename: "AdvancedFilters",
    };

    await initializeFilters({
      advancedFilters: fetchedFilters,
      fromState: false,
    });

    expect(getNormalizedFiltersForApi()).toEqual([
      {
        type: "selection",
        value: ["rel-1", "rel-2"],
        match_exact: true,
      },
    ]);
  });
});
