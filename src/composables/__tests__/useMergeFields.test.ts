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

  it("copes with an empty or missing entity view", () => {
    expect(collectMergeFields(undefined)).toEqual({
      metadataFields: [],
      relationFields: [],
    });
  });
});
