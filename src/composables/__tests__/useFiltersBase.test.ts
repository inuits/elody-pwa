import { describe, expect, it } from "vitest";
import { useFiltersBase } from "@/composables/useFiltersBase";

describe("useFiltersBase", () => {
  it("displays correct filter count for active filters", () => {
    const { filters, activeFilterCount } = useFiltersBase();
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
        selectedMatcher: {
          icon: "NoIcon",
          label: "contains",
          value: "ContainsMatcher",
        },
      },
    ];

    expect(activeFilterCount.value).toEqual(1);

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
        selectedMatcher: {
          icon: "NoIcon",
          label: "contains",
          value: "ContainsMatcher",
        },
      },
      {
        isDisplayed: true,
        advancedFilter: {
          type: "text",
          key: ["elody:1|metadata.description.value"],
          label: "metadata.labels.description",
          isDisplayedByDefault: true,
          tooltip: true,
          __typename: "AdvancedFilter",
        },
        inputFromState: {
          type: "text",
          key: ["elody:1|metadata.title.value"],
          value: "description",
          match_exact: false,
        },
        isActive: true,
      },
    ];

    expect(activeFilterCount.value).toEqual(2);
  });
});
