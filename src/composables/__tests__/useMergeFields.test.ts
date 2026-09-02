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

    expect(collectMergeFields(entityView).metadataFields).toEqual([
      { key: "name", label: "Name" },
      { key: "birth_year", label: "Birth year" },
    ]);
  });

  it("collects relation panels separately from metadata", () => {
    const entityView = {
      column1: {
        elements: {
          a: panelMetaData("name", "Name"),
          b: entityList("refRelatedEntities", "Related"),
        },
      },
    };

    const { metadataFields, relationFields } = collectMergeFields(entityView);

    expect(metadataFields).toEqual([{ key: "name", label: "Name" }]);
    expect(relationFields).toEqual([
      { relationType: "refRelatedEntities", label: "Related" },
    ]);
  });

  it("never offers the identifier as a mergeable field", () => {
    // Merging ids is meaningless: the survivor keeps its own.
    const entityView = { a: panelMetaData("id", "Id") };

    expect(collectMergeFields(entityView).metadataFields).toEqual([]);
  });

  it("lists each field once even when it appears in several panels", () => {
    const entityView = {
      a: panelMetaData("name", "Name"),
      b: panelMetaData("name", "Name"),
    };

    expect(collectMergeFields(entityView).metadataFields).toHaveLength(1);
  });

  it("ignores a relation panel that declares no relation type", () => {
    const entityView = {
      a: { __typename: "EntityListElement", label: "Broken" },
    };

    expect(collectMergeFields(entityView).relationFields).toEqual([]);
  });

  it("skips fields in a panel the client marked read-only", () => {
    // Audit panels (created/updated timestamps) are declared isEditable:false.
    // They describe the record rather than belong to it, so the survivor keeps
    // its own — there is nothing for a user to decide.
    const entityView = {
      audit: {
        isEditable: false,
        elements: { a: panelMetaData("created_at", "Created at") },
      },
      info: {
        isEditable: true,
        elements: { b: panelMetaData("name", "Name") },
      },
    };

    expect(collectMergeFields(entityView).metadataFields).toEqual([
      { key: "name", label: "Name" },
    ]);
  });

  it("skips relation panels that are read-only", () => {
    const entityView = {
      audit: {
        isEditable: false,
        elements: { a: entityList("refAuthors", "Works") },
      },
    };

    expect(collectMergeFields(entityView).relationFields).toEqual([]);
  });

  it("keeps fields in panels that say nothing about editability", () => {
    const entityView = { panel: { elements: { a: panelMetaData("name", "Name") } } };

    expect(collectMergeFields(entityView).metadataFields).toHaveLength(1);
  });

  it("keeps a nested field read-only once its panel is", () => {
    // The flag sits on the panel; deeply nested metadata must still inherit it.
    const entityView = {
      audit: {
        isEditable: false,
        group: { nested: { deeper: panelMetaData("created_at", "Created at") } },
      },
    };

    expect(collectMergeFields(entityView).metadataFields).toEqual([]);
  });

  it("copes with an empty or missing entity view", () => {
    expect(collectMergeFields(undefined)).toEqual({
      metadataFields: [],
      relationFields: [],
    });
  });
});

describe("collectMergeFields without labels", () => {
  it("falls back to the key when a client left the label out", () => {
    // label is nullable in the schema, and t(undefined) throws in the table.
    const entityView = {
      column1: {
        elements: {
          a: { __typename: "PanelMetaData", key: "literary_type" },
          b: { __typename: "EntityListElement", relationType: "refAuthors" },
        },
      },
    };

    const { metadataFields, relationFields } = collectMergeFields(entityView);

    expect(metadataFields).toEqual([
      { key: "literary_type", label: "literary_type" },
    ]);
    expect(relationFields).toEqual([
      { relationType: "refAuthors", label: "refAuthors" },
    ]);
  });
});
