import { describe, expect, it } from "vitest";
import { useFiltersBaseNew } from "@/composables/useFiltersBaseNew";

describe("transformFilterInputIntoAdvancedFilters", () => {
  it("should transform filter inputs correctly", () => {
    const { transformFilterInputIntoAdvancedFilters } = useFiltersBaseNew();
    const inputs = [
      {
        type: "type",
        key: "testKey",
        metadata_key_as_label: "metadata.name.value",
        value: "testValue",
        item_types: ["asset"],
        match_exact: true,
      },
    ];

    const result = transformFilterInputIntoAdvancedFilters(inputs);
    expect(result["filterKey_0"].key).toBe("testKey");
    expect(result["filterKey_0"].defaultValue).toBe("testValue");
    expect(result["filterKey_0"].itemTypes).toStrictEqual(["asset"]);
    expect(result["filterKey_0"].matchExact).toBe(true);
    expect(result["filterKey_0"].metadataKeyAsLabel).toBe(
      "metadata.name.value",
    );
  });
});
