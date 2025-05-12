import { describe, expect, it } from "vitest";
import { useFiltersBaseNew } from "@/composables/useFiltersBaseNew";

describe("transformFilterInputIntoAdvancedFilters", () => {
  it("should transform filter inputs correctly", () => {
    const { transformFilterInputIntoAdvancedFilters } = useFiltersBaseNew();
    const inputs = [
      {
        type: "type",
        key: "testKey",
        value: "testValue",
      },
    ];

    const result = transformFilterInputIntoAdvancedFilters(inputs);
    expect(result["filterKey_0"].key).toBe("testKey");
    expect(result["filterKey_0"].defaultValue).toBe("testValue");
  });
});

describe("extractValueFromObject", () => {
  const { extractValueFromObject } = useFiltersBaseNew();
  it("should extract value from object", () => {
    const obj = { a: { b: { c: "value" } } };
    const result = extractValueFromObject(obj, "a.b.c");
    expect(result).toBe("value");
  });

  it("should handle arrays", () => {
    const obj = { a: [{ b: 1 }, { b: 2 }] };
    const result = extractValueFromObject(obj, "a.b");
    expect(result).toEqual([1, 2]);
  });

  it("should return undefined for invalid paths", () => {
    const obj = { a: { b: { c: "value" } } };
    const result = extractValueFromObject(obj, "a.b.x");
    expect(result).toBeUndefined();
  });
});
