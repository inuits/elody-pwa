import { describe, it, expect } from "vitest";
import type { ColumnList } from "@/generated-types/queries";
import {
  filterColumnListByKeys,
  pickColumnElements,
} from "@/components/previews/filterColumnListByKeys";

const getColumnList = () =>
  ({
    __typename: "ColumnList",
    column: {
      __typename: "Column",
      size: "hundred",
      elements: {
        __typename: "ColumnElements",
        windowElement: {
          __typename: "WindowElement",
          label: "changes",
          info: {
            __typename: "WindowElementPanel",
            isEditable: false,
            title: {
              __typename: "PanelMetaData",
              key: "title",
              label: "Title",
            },
            premiere_date: {
              __typename: "PanelMetaData",
              key: "premiere_date",
              label: "Premiere date",
            },
          },
          texts: {
            __typename: "WindowElementPanel",
            isEditable: false,
            description_short: {
              __typename: "WysiwygElement",
              metadataKey: "description_short",
              label: "Short description",
            },
          },
        },
        entityListElement: {
          __typename: "EntityListElement",
          label: "media",
        },
      },
    },
  }) as unknown as ColumnList;

const elementsOf = (columnList: ColumnList | null) =>
  (columnList as any)?.column.elements;

describe("filterColumnListByKeys", () => {
  it("keeps only metadata fields whose key is in the list", () => {
    const result = filterColumnListByKeys(getColumnList(), ["premiere_date"]);
    const info = elementsOf(result).windowElement.info;

    expect(info.premiere_date.key).toBe("premiere_date");
    expect(info.title).toBeUndefined();
  });

  it("matches wysiwyg elements by their metadataKey", () => {
    const result = filterColumnListByKeys(getColumnList(), [
      "description_short",
    ]);

    expect(
      elementsOf(result).windowElement.texts.description_short.metadataKey,
    ).toBe("description_short");
  });

  it("drops panels that have no fields left", () => {
    const result = filterColumnListByKeys(getColumnList(), ["title"]);

    expect(elementsOf(result).windowElement.texts).toBeUndefined();
  });

  it("keeps panel settings next to the remaining fields", () => {
    const result = filterColumnListByKeys(getColumnList(), ["title"]);

    expect(elementsOf(result).windowElement.info.isEditable).toBe(false);
  });

  it("leaves elements that are not window elements untouched", () => {
    const result = filterColumnListByKeys(getColumnList(), ["title"]);

    expect(elementsOf(result).entityListElement.label).toBe("media");
  });

  it("drops window elements without matching fields but keeps other elements", () => {
    const result = filterColumnListByKeys(getColumnList(), ["poster"]);

    expect(elementsOf(result).windowElement).toBeUndefined();
    expect(elementsOf(result).entityListElement.label).toBe("media");
  });

  it("drops entity lists whose relation type has no relations", () => {
    const columnList = getColumnList();
    elementsOf(columnList).entityListElement.relationType = "ref_mediafiles";

    const result = filterColumnListByKeys(columnList, ["title"], {
      ref_mediafiles: [],
    });

    expect(elementsOf(result).entityListElement).toBeUndefined();
  });

  it("keeps entity lists whose relation type has relations", () => {
    const columnList = getColumnList();
    elementsOf(columnList).entityListElement.relationType = "ref_mediafiles";

    const result = filterColumnListByKeys(columnList, ["title"], {
      ref_mediafiles: [{ key: "mediafile-1" }],
    });

    expect(elementsOf(result).entityListElement.label).toBe("media");
  });

  it("returns null when nothing is left to render", () => {
    const columnList = getColumnList();
    delete elementsOf(columnList).entityListElement;

    expect(filterColumnListByKeys(columnList, ["poster"])).toBeNull();
  });

  it("does not mutate the given column list", () => {
    const columnList = getColumnList();
    filterColumnListByKeys(columnList, ["title"]);

    expect(
      elementsOf(columnList).windowElement.info.premiere_date,
    ).toBeDefined();
  });
});

describe("pickColumnElements", () => {
  const isWindowElement = (element: any) =>
    element.__typename === "WindowElement";

  it("keeps only the elements matching the predicate", () => {
    const result = pickColumnElements(getColumnList(), isWindowElement);

    expect(elementsOf(result).windowElement.label).toBe("changes");
    expect(elementsOf(result).entityListElement).toBeUndefined();
  });

  it("returns null when no element matches", () => {
    expect(pickColumnElements(getColumnList(), () => false)).toBeNull();
  });
});
