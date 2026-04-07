import { describe, it, expect } from "vitest";
import {
  extractTagInputValuesFromRelations,
  mapDropdownOptionsToBulkProcessableItem,
} from "@/components/library/view-modes/mapDropdownOptionsToBulkProcessableItem";
import type {
  BaseRelationValuesInput,
  DropdownOption,
} from "@/generated-types/queries";
import { EditStatus } from "@/generated-types/queries";

const makeOption = (
  value: string,
  label: string,
): DropdownOption => ({ value, label });

describe("mapDropdownOptionsToBulkProcessableItem", () => {
  const options: DropdownOption[] = [
    makeOption("id-1", "Option A"),
    makeOption("id-2", "Option B"),
  ];

  it("maps dropdown options to bulk processable items", () => {
    const result = mapDropdownOptionsToBulkProcessableItem(options);

    expect(result).toEqual([
      { id: "id-1", value: "Option A" },
      { id: "id-2", value: "Option B" },
    ]);
  });

  it("returns empty array for empty input", () => {
    const result = mapDropdownOptionsToBulkProcessableItem([]);
    expect(result).toEqual([]);
  });

  it("attaches metadata when config is enabled and tag values exist", () => {
    const config = { enabled: true, key: "role" };
    const tagValues = new Map<string | number, string>([
      ["id-1", "author"],
      ["id-2", "editor"],
    ]);

    const result = mapDropdownOptionsToBulkProcessableItem(
      options,
      config,
      tagValues,
    );

    expect(result).toEqual([
      {
        id: "id-1",
        value: "Option A",
        metadata: [{ key: "role", value: "author" }],
      },
      {
        id: "id-2",
        value: "Option B",
        metadata: [{ key: "role", value: "editor" }],
      },
    ]);
  });

  it("does not attach metadata when config is disabled", () => {
    const config = { enabled: false, key: "role" };
    const tagValues = new Map<string | number, string>([
      ["id-1", "author"],
    ]);

    const result = mapDropdownOptionsToBulkProcessableItem(
      options,
      config,
      tagValues,
    );

    expect(result[0]).not.toHaveProperty("metadata");
    expect(result[1]).not.toHaveProperty("metadata");
  });

  it("does not attach metadata when config is undefined", () => {
    const tagValues = new Map<string | number, string>([
      ["id-1", "author"],
    ]);

    const result = mapDropdownOptionsToBulkProcessableItem(
      options,
      undefined,
      tagValues,
    );

    expect(result[0]).not.toHaveProperty("metadata");
  });

  it("does not attach metadata when tag value is empty string", () => {
    const config = { enabled: true, key: "role" };
    const tagValues = new Map<string | number, string>([["id-1", ""]]);

    const result = mapDropdownOptionsToBulkProcessableItem(
      options,
      config,
      tagValues,
    );

    expect(result[0]).not.toHaveProperty("metadata");
  });

  it("does not attach metadata when tag value is missing for an option", () => {
    const config = { enabled: true, key: "role" };
    const tagValues = new Map<string | number, string>([
      ["id-1", "author"],
    ]);

    const result = mapDropdownOptionsToBulkProcessableItem(
      options,
      config,
      tagValues,
    );

    expect(result[0].metadata).toEqual([{ key: "role", value: "author" }]);
    expect(result[1]).not.toHaveProperty("metadata");
  });

  it("does not attach metadata when tagInputValues map is undefined", () => {
    const config = { enabled: true, key: "role" };

    const result = mapDropdownOptionsToBulkProcessableItem(
      options,
      config,
      undefined,
    );

    expect(result[0]).not.toHaveProperty("metadata");
    expect(result[1]).not.toHaveProperty("metadata");
  });

  it("does not attach metadata when config key is empty string", () => {
    const config = { enabled: true, key: "" };
    const tagValues = new Map<string | number, string>([
      ["id-1", "author"],
    ]);

    const result = mapDropdownOptionsToBulkProcessableItem(
      options,
      config,
      tagValues,
    );

    expect(result[0]).not.toHaveProperty("metadata");
  });
});

const makeRelation = (
  key: string,
  metadata?: BaseRelationValuesInput["metadata"],
): BaseRelationValuesInput => ({
  key,
  type: "hasRelation",
  editStatus: EditStatus.New,
  metadata,
});

describe("extractTagInputValuesFromRelations", () => {
  it("extracts tag values from relations with matching metadata key", () => {
    const relations = [
      makeRelation("id-1", [{ key: "role", value: "author" }]),
      makeRelation("id-2", [{ key: "role", value: "editor" }]),
    ];

    const result = extractTagInputValuesFromRelations(relations, "role");

    expect(result).toEqual(
      new Map([
        ["id-1", "author"],
        ["id-2", "editor"],
      ]),
    );
  });

  it("returns empty map for empty relations array", () => {
    const result = extractTagInputValuesFromRelations([], "role");
    expect(result.size).toBe(0);
  });

  it("skips relations without metadata", () => {
    const relations = [
      makeRelation("id-1", undefined),
      makeRelation("id-2", [{ key: "role", value: "editor" }]),
    ];

    const result = extractTagInputValuesFromRelations(relations, "role");

    expect(result.size).toBe(1);
    expect(result.get("id-2")).toBe("editor");
  });

  it("skips relations with empty metadata value", () => {
    const relations = [
      makeRelation("id-1", [{ key: "role", value: "" }]),
      makeRelation("id-2", [{ key: "role", value: "editor" }]),
    ];

    const result = extractTagInputValuesFromRelations(relations, "role");

    expect(result.size).toBe(1);
    expect(result.get("id-2")).toBe("editor");
  });

  it("only extracts the matching metadata key when multiple keys exist", () => {
    const relations = [
      makeRelation("id-1", [
        { key: "department", value: "engineering" },
        { key: "role", value: "author" },
      ]),
    ];

    const result = extractTagInputValuesFromRelations(relations, "role");

    expect(result.size).toBe(1);
    expect(result.get("id-1")).toBe("author");
  });

  it("returns empty map when no relations have the matching key", () => {
    const relations = [
      makeRelation("id-1", [{ key: "department", value: "engineering" }]),
      makeRelation("id-2", [{ key: "department", value: "design" }]),
    ];

    const result = extractTagInputValuesFromRelations(relations, "role");

    expect(result.size).toBe(0);
  });

  it("converts non-string metadata values to strings", () => {
    const relations = [
      makeRelation("id-1", [{ key: "count", value: 42 }]),
    ];

    const result = extractTagInputValuesFromRelations(relations, "count");

    expect(result.get("id-1")).toBe("42");
  });
});
