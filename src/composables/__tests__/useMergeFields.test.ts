import { describe, it, expect } from "vitest";
import { collectMergeFields } from "../useMergeFields";

const panelMetaData = (key: string, label: string) => ({
  __typename: "PanelMetaData",
  key,
  label,
});

const entityList = (relationType: string, label: string) => ({
  __typename: "EntityListElement",
  relationType,
  label,
});

describe("collectMergeFields", () => {
  it("collects metadata fields from anywhere in the entity view", () => {
    const entityView = {
      column1: { elements: { a: panelMetaData("name", "Name") } },
      column2: { elements: { b: panelMetaData("birth_year", "Birth year") } },
    };

    expect(collectMergeFields(entityView)).toEqual([
      { key: "name", label: "Name" },
      { key: "birth_year", label: "Birth year" },
    ]);
  });

  it("never offers a relation as a choice", () => {
    // Relations are unioned by the merge itself: two lists of authors cannot be
    // reconciled by picking one of them.
    const entityView = {
      column1: {
        elements: {
          a: panelMetaData("name", "Name"),
          b: entityList("refRelatedEntities", "Related"),
        },
      },
    };

    expect(collectMergeFields(entityView)).toEqual([
      { key: "name", label: "Name" },
    ]);
  });

  it("never offers a relation reached as a metadata projection", () => {
    // A work's entityView exposes refAuthors as a metaData entry too, and the
    // schema rejects that key outright on a write.
    const entityView = {
      column1: { elements: { a: panelMetaData("refAuthors", "Authors") } },
    };

    expect(collectMergeFields(entityView)).toEqual([]);
  });

  it("keeps a metadata key that merely starts with ref", () => {
    const entityView = {
      column1: { elements: { a: panelMetaData("reference_note", "Note") } },
    };

    expect(collectMergeFields(entityView)).toEqual([
      { key: "reference_note", label: "Note" },
    ]);
  });

  it("never offers the identifier as a mergeable field", () => {
    // Merging ids is meaningless: the survivor keeps its own.
    const entityView = { a: panelMetaData("id", "Id") };

    expect(collectMergeFields(entityView)).toEqual([]);
  });

  it("lists each field once even when it appears in several panels", () => {
    const entityView = {
      a: panelMetaData("name", "Name"),
      b: panelMetaData("name", "Name"),
    };

    expect(collectMergeFields(entityView)).toHaveLength(1);
  });

  it("skips fields in a panel the client marked read-only", () => {
    // They describe the record rather than belong to it, so the survivor keeps
    // its own.
    const entityView = {
      audit: {
        isEditable: false,
        elements: { a: panelMetaData("created_at", "Created at") },
      },
      main: { elements: { b: panelMetaData("name", "Name") } },
    };

    expect(collectMergeFields(entityView)).toEqual([
      { key: "name", label: "Name" },
    ]);
  });

  it("keeps fields in panels that say nothing about editability", () => {
    const entityView = { a: panelMetaData("name", "Name") };

    expect(collectMergeFields(entityView)).toEqual([
      { key: "name", label: "Name" },
    ]);
  });

  it("keeps a nested field read-only once its panel is", () => {
    const entityView = {
      audit: {
        isEditable: false,
        group: { nested: { deeper: panelMetaData("created_at", "Created at") } },
      },
    };

    expect(collectMergeFields(entityView)).toEqual([]);
  });

  it("copes with an empty or missing entity view", () => {
    expect(collectMergeFields(undefined)).toEqual([]);
  });

  it("falls back to the key when a client left the label out", () => {
    // label is nullable in the schema, and t(undefined) throws in the table.
    const entityView = {
      column1: {
        elements: { a: { __typename: "PanelMetaData", key: "literary_type" } },
      },
    };

    expect(collectMergeFields(entityView)).toEqual([
      { key: "literary_type", label: "literary_type" },
    ]);
  });
});
