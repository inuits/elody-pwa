import { describe, it, expect, beforeEach } from "vitest";
import { useFilterVariables } from "../useFilterVariables";

describe("useFilterVariables", () => {
  let filterVariables: ReturnType<typeof useFilterVariables>;

  beforeEach(() => {
    filterVariables = useFilterVariables();
  });

  it("starts with empty variables", () => {
    expect(filterVariables.variables.value).toEqual({});
  });

  it("sets a single variable", () => {
    filterVariables.setVariables({ entityType: "Asset" });

    expect(filterVariables.variables.value).toEqual({ entityType: "Asset" });
  });

  it("merges new variables into existing ones without clearing them", () => {
    filterVariables.setVariables({ entityType: "Asset" });
    filterVariables.setVariables({ entity: { id: "123" } as any });

    expect(filterVariables.variables.value).toEqual({
      entityType: "Asset",
      entity: { id: "123" },
    });
  });

  it("overwrites an existing key when the same key is set again", () => {
    filterVariables.setVariables({ entityType: "Asset" });
    filterVariables.setVariables({ entityType: "MediaFile" });

    expect(filterVariables.variables.value.entityType).toBe("MediaFile");
  });

  it("preserves unrelated keys when overwriting one key", () => {
    filterVariables.setVariables({ entityType: "Asset", parentIds: ["a", "b"] });
    filterVariables.setVariables({ entityType: "MediaFile" });

    expect(filterVariables.variables.value.parentIds).toEqual(["a", "b"]);
  });

  it("sets all four variable fields independently and accumulates them", () => {
    filterVariables.setVariables({ entityType: "Asset" });
    filterVariables.setVariables({ entity: { id: "e1" } as any });
    filterVariables.setVariables({ parentIds: ["p1"] });
    filterVariables.setVariables({ dateToday: "2026-05-19" });

    expect(filterVariables.variables.value).toEqual({
      entityType: "Asset",
      entity: { id: "e1" },
      parentIds: ["p1"],
      dateToday: "2026-05-19",
    });
  });
});
