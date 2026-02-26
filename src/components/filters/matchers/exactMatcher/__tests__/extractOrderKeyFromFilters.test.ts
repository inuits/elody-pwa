import { describe, it, expect } from "vitest";
import { extractOrderKeyFromFilters } from "../helpers";
import { AdvancedFilterTypes } from "@/__mocks__/queries";
import type { AdvancedFilterInput } from "@/__mocks__/queries";

describe("extractOrderKeyFromFilters", () => {
  it("returns the distinct_by value from a Text filter", () => {
    const filters: AdvancedFilterInput[] = [
      {
        type: AdvancedFilterTypes.Text,
        value: "*",
        distinct_by: "title",
      },
    ];

    expect(extractOrderKeyFromFilters(filters)).toBe("title");
  });

  it("ignores non-Text filters and returns distinct_by from the Text filter", () => {
    const filters: AdvancedFilterInput[] = [
      {
        type: AdvancedFilterTypes.Type,
        value: "asset",
      },
      {
        type: AdvancedFilterTypes.Text,
        value: "*",
        distinct_by: "metadata.title",
      },
    ];

    expect(extractOrderKeyFromFilters(filters)).toBe("metadata.title");
  });

  it("returns an empty string when no Text filter is present", () => {
    const filters: AdvancedFilterInput[] = [
      {
        type: AdvancedFilterTypes.Type,
        value: "asset",
      },
    ];

    expect(extractOrderKeyFromFilters(filters)).toBe("");
  });

  it("returns an empty string when the Text filter has no distinct_by key", () => {
    const filters: AdvancedFilterInput[] = [
      {
        type: AdvancedFilterTypes.Text,
        value: "*",
      },
    ];

    expect(extractOrderKeyFromFilters(filters)).toBe("");
  });

  it("returns an empty string for an empty filters array", () => {
    expect(extractOrderKeyFromFilters([])).toBe("");
  });
});
