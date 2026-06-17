import { describe, expect, it } from "vitest";
import { buildEntityPickerSearchFilters } from "@/composables/useEntityPickerSearch";
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
