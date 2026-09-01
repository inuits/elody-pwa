import { describe, it, expect } from "vitest";
import {
  buildMergeRows,
  buildMergedValues,
  buildMergedRelations,
  buildRelationRows,
} from "../useMergeDiff";

const fields = [
  { key: "name", label: "Name" },
  { key: "birth_year", label: "Birth year" },
];

describe("buildMergeRows", () => {
  it("omits fields whose value is the same on both sides", () => {
    // Equal values need no decision, so showing them is noise.
    const rows = buildMergeRows(
      fields,
      { name: "Herbert", birth_year: 1920 },
      { name: "Herbert", birth_year: 1920 },
    );

    expect(rows).toEqual([]);
  });

  it("includes a field whose value differs", () => {
    const rows = buildMergeRows(
      fields,
      { name: "Herbert", birth_year: 1920 },
      { name: "Herbert", birth_year: 1921 },
    );

    expect(rows).toEqual([
      { key: "birth_year", label: "Birth year", leftValue: 1920, rightValue: 1921 },
    ]);
  });

  it("includes a field that exists on one side only", () => {
    const rows = buildMergeRows(fields, { name: "Herbert" }, {});

    expect(rows).toEqual([
      { key: "name", label: "Name", leftValue: "Herbert", rightValue: undefined },
    ]);
  });

  it("treats an absent value and an empty string as the same", () => {
    // The backend stores cleared fields as empty, so this is not a real choice.
    const rows = buildMergeRows(fields, { name: "" }, {});

    expect(rows).toEqual([]);
  });

  it("compares list values by content rather than identity", () => {
    const rows = buildMergeRows(
      [{ key: "aliases", label: "Aliases" }],
      { aliases: ["a", "b"] },
      { aliases: ["a", "b"] },
    );

    expect(rows).toEqual([]);
  });

  it("reports a list whose contents differ", () => {
    const rows = buildMergeRows(
      [{ key: "aliases", label: "Aliases" }],
      { aliases: ["a"] },
      { aliases: ["a", "b"] },
    );

    expect(rows).toHaveLength(1);
  });

  it("keeps the field order it was given", () => {
    const rows = buildMergeRows(
      fields,
      { name: "A", birth_year: 1 },
      { name: "B", birth_year: 2 },
    );

    expect(rows.map((row) => row.key)).toEqual(["name", "birth_year"]);
  });
});

describe("buildMergedValues", () => {
  const rows = [
    { key: "name", label: "Name", leftValue: "A", rightValue: "B" },
    { key: "birth_year", label: "Birth year", leftValue: 1, rightValue: 2 },
  ];

  it("takes each field from the side that was chosen for it", () => {
    expect(buildMergedValues(rows, { name: "left", birth_year: "right" })).toEqual({
      name: "A",
      birth_year: 2,
    });
  });

  it("defaults to the surviving record's own value when no choice was made", () => {
    expect(buildMergedValues(rows, {})).toEqual({ name: "A", birth_year: 1 });
  });

  it("returns nothing to write when there are no differing fields", () => {
    expect(buildMergedValues([], {})).toEqual({});
  });

  it("carries an emptied value through as an empty string", () => {
    // Choosing a side that has no value must clear the field, not skip it.
    const emptyRows = [
      { key: "name", label: "Name", leftValue: "A", rightValue: undefined },
    ];

    expect(buildMergedValues(emptyRows, { name: "right" })).toEqual({ name: "" });
  });
});

describe("buildRelationRows", () => {
  const relationFields = [
    { relationType: "refRelatedEntities", label: "Related" },
    { relationType: "refGenres", label: "Genres" },
  ];
  const left = {
    refRelatedEntities: [{ key: "A" }],
    refGenres: [{ key: "G1" }],
  };

  it("omits relations that are identical on both sides", () => {
    const rows = buildRelationRows(relationFields, left, left);

    expect(rows).toEqual([]);
  });

  it("reports a relation whose members differ", () => {
    const rows = buildRelationRows(relationFields, left, {
      ...left,
      refGenres: [{ key: "G2" }],
    });

    expect(rows).toEqual([
      { key: "refGenres", label: "Genres", leftValue: ["G1"], rightValue: ["G2"] },
    ]);
  });

  it("treats a missing relation as an empty list", () => {
    const rows = buildRelationRows(
      [{ relationType: "refGenres", label: "Genres" }],
      { refGenres: [{ key: "G1" }] },
      {},
    );

    expect(rows[0].rightValue).toEqual([]);
  });
});

describe("buildMergedRelations", () => {
  const relationFields = [
    { relationType: "refRelatedEntities", label: "Related" },
    { relationType: "refGenres", label: "Genres" },
  ];
  const left = {
    refRelatedEntities: [{ key: "A" }],
    refGenres: [{ key: "G1" }],
  };
  const right = {
    refRelatedEntities: [{ key: "B" }],
    refGenres: [{ key: "G1" }],
  };

  it("sends every relation type, not only the contested ones", () => {
    // The relations endpoint replaces the whole set, so omitting an
    // uncontested relation type would delete it.
    const relations = buildMergedRelations(relationFields, left, right, {});

    expect(relations).toEqual([
      { key: "A", type: "refRelatedEntities", editStatus: "new" },
      { key: "G1", type: "refGenres", editStatus: "new" },
    ]);
  });

  it("takes a contested relation from the chosen side", () => {
    const relations = buildMergedRelations(relationFields, left, right, {
      refRelatedEntities: "right",
    });

    expect(relations).toEqual([
      { key: "B", type: "refRelatedEntities", editStatus: "new" },
      { key: "G1", type: "refGenres", editStatus: "new" },
    ]);
  });

  it("carries the editStatus BaseRelationValuesInput demands", () => {
    // Without it the whole mutation is rejected before it reaches a resolver.
    const [relation] = buildMergedRelations(relationFields, left, right, {});

    expect(relation.editStatus).toBe("new");
  });

  it("produces nothing when neither record has relations", () => {
    expect(buildMergedRelations(relationFields, {}, {}, {})).toEqual([]);
  });
});
