import { describe, expect, it } from "vitest";
import { buildEntityPickerSearchFilters, buildEntityPickerTypeFilter } from "@/composables/useEntityPickerSearch";
import { AdvancedFilterTypes, Operator } from "@/generated-types/queries";

describe("buildEntityPickerSearchFilters", () => {
  it("returns empty array when searchTerm is empty string", () => {
    const result = buildEntityPickerSearchFilters("", ["elody:1|metadata.title.value"]);
    expect(result).toEqual([]);
  });

  it("returns empty array when metadataKeys is empty", () => {
    const result = buildEntityPickerSearchFilters("venice", []);
    expect(result).toEqual([]);
  });

  it("creates one filter entry per metadata key", () => {
    const result = buildEntityPickerSearchFilters("venice", [
      "elody:1|metadata.title.value",
      "elody:1|metadata.name.value",
    ]);
    expect(result).toHaveLength(2);
  });

  it("sets type to Text, operator to Or, match_exact to false", () => {
    const result = buildEntityPickerSearchFilters("venice", ["elody:1|metadata.title.value"]);
    expect(result[0].type).toBe(AdvancedFilterTypes.Text);
    expect(result[0].operator).toBe(Operator.Or);
    expect(result[0].match_exact).toBe(false);
  });

  it("wraps the key in an array", () => {
    const result = buildEntityPickerSearchFilters("venice", ["elody:1|metadata.title.value"]);
    expect(result[0].key).toEqual(["elody:1|metadata.title.value"]);
  });

  it("passes the search term as value", () => {
    const result = buildEntityPickerSearchFilters("venice", ["elody:1|metadata.title.value"]);
    expect(result[0].value).toBe("venice");
  });

  it("produces independent filter entries for multiple keys", () => {
    const keys = ["elody:1|metadata.title.value", "elody:1|metadata.name.value"];
    const result = buildEntityPickerSearchFilters("test", keys);
    expect(result[0].key).toEqual([keys[0]]);
    expect(result[1].key).toEqual([keys[1]]);
    result.forEach((f) => expect(f.value).toBe("test"));
  });
});

describe("buildEntityPickerTypeFilter", () => {
  it("returns empty array when only one accepted type", () => {
    const result = buildEntityPickerTypeFilter(["person"]);
    expect(result).toEqual([]);
  });

  it("returns empty array when accepted types is empty", () => {
    const result = buildEntityPickerTypeFilter([]);
    expect(result).toEqual([]);
  });

  it("returns type filter when multiple accepted types", () => {
    const result = buildEntityPickerTypeFilter(["person", "corporation"]);
    expect(result).toHaveLength(1);
  });

  it("sets key to 'type', type to Selection, match_exact to true", () => {
    const result = buildEntityPickerTypeFilter(["person", "corporation"]);
    expect(result[0].key).toBe("type");
    expect(result[0].type).toBe(AdvancedFilterTypes.Selection);
    expect(result[0].match_exact).toBe(true);
  });

  it("sets value to the accepted types array", () => {
    const types = ["person", "corporation"];
    const result = buildEntityPickerTypeFilter(types);
    expect(result[0].value).toEqual(types);
  });
});
