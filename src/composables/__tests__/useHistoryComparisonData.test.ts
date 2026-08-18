import { describe, it, expect, beforeEach, vi } from "vitest";
import { computed, defineComponent, unref } from "vue";
import { mount } from "@vue/test-utils";
import {
  findPanelMetadata,
  findWysiwygElement,
  findEntityListElement,
  convertDateToReadbleFormat,
} from "@/helpers";
import { useEditMode } from "@/composables/useEdit";
import useEntitySingle from "@/composables/useEntitySingle";
import {
  buildVersionOptions,
  sortHistoryVersionsByDate,
  useHistoryComparisonData,
  LIVE_VERSION_ID,
  type HistoryVersionRow,
} from "../useHistoryComparisonData";

const mocks = vi.hoisted(() => ({
  useQueryCalls: [] as any[],
  // Each entry is either a static { result, loading, error } object (used for
  // slots whose variables never change within a test), or a function
  // (variables) => { result, loading?, error? } for slots that must react to
  // variable changes (e.g. a detail query re-keyed when a version id switches).
  queryResults: [] as any[],
  apolloQueryMock: undefined as unknown as ReturnType<typeof vi.fn>,
}));
mocks.apolloQueryMock = vi.fn(() => Promise.resolve({ data: { Entity: null } }));

vi.mock("@vue/apollo-composable", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useQuery: (document: any, variables: any, options: any) => {
    const callIndex = mocks.useQueryCalls.length;
    mocks.useQueryCalls.push({ document, variables, options });
    const spec = mocks.queryResults[callIndex];

    if (typeof spec === "function") {
      return {
        result: computed(() => spec(unref(variables))?.result),
        loading: computed(() => spec(unref(variables))?.loading ?? false),
        error: computed(() => spec(unref(variables))?.error ?? null),
      };
    }

    return (
      spec ?? {
        result: { value: undefined },
        loading: { value: false },
        error: { value: null },
      }
    );
  },
}));

vi.mock("@/composables/useImport", () => ({
  useImport: () => ({ loadDocument: () => Promise.resolve(null) }),
}));

vi.mock("@/main", () => ({
  get apolloClient() {
    return { query: mocks.apolloQueryMock };
  },
}));

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const row = (id: string, updated_at?: string): HistoryVersionRow => ({
  id,
  intialValues: { updated_at },
});

const versionRow = (versionId: string, timestamp?: string) => ({
  versionId,
  documentVersion: 1,
  timestamp,
  editedBy: "tester",
});

describe("sortHistoryVersionsByDate", () => {
  it("sorts rows chronologically regardless of input order", () => {
    const rows = [
      row("b", "2026-02-01T00:00:00Z"),
      row("c", "2026-03-01T00:00:00Z"),
      row("a", "2026-01-01T00:00:00Z"),
    ];

    expect(sortHistoryVersionsByDate(rows).map((r) => r.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("does not mutate the input array", () => {
    const rows = [
      row("b", "2026-02-01T00:00:00Z"),
      row("a", "2026-01-01T00:00:00Z"),
    ];

    sortHistoryVersionsByDate(rows);

    expect(rows.map((r) => r.id)).toEqual(["b", "a"]);
  });

  it("treats rows with a missing or unparsable date as the oldest", () => {
    const rows = [
      row("dated", "2026-01-01T00:00:00Z"),
      row("undated"),
      row("garbage", "not-a-date"),
    ];

    expect(sortHistoryVersionsByDate(rows).map((r) => r.id)).toEqual([
      "undated",
      "garbage",
      "dated",
    ]);
  });

  it("returns an empty array for an empty input", () => {
    expect(sortHistoryVersionsByDate([])).toEqual([]);
  });
});

describe("buildVersionOptions", () => {
  const readableDate = (dateString: string) =>
    convertDateToReadbleFormat(dateString, "DEFAULT", true);

  it("labels versions from oldest to newest regardless of input order, including a human-readable date", () => {
    const rows = [
      row("newest", "2026-03-01T00:00:00Z"),
      row("oldest", "2026-01-01T00:00:00Z"),
      row("middle", "2026-02-01T00:00:00Z"),
    ];

    expect(buildVersionOptions(rows)).toEqual([
      {
        id: "oldest",
        label: `Version 1 (${readableDate("2026-01-01T00:00:00Z")})`,
        date: "2026-01-01T00:00:00Z",
      },
      {
        id: "middle",
        label: `Version 2 (${readableDate("2026-02-01T00:00:00Z")})`,
        date: "2026-02-01T00:00:00Z",
      },
      {
        id: "newest",
        label: `Version 3 (${readableDate("2026-03-01T00:00:00Z")})`,
        date: "2026-03-01T00:00:00Z",
      },
    ]);
  });

  it("labels a single version as Version 1", () => {
    expect(buildVersionOptions([row("only", "2026-01-01T00:00:00Z")])).toEqual([
      {
        id: "only",
        label: `Version 1 (${readableDate("2026-01-01T00:00:00Z")})`,
        date: "2026-01-01T00:00:00Z",
      },
    ]);
  });

  it("falls back to a plain label when the version has no date", () => {
    expect(buildVersionOptions([row("undated")])).toEqual([
      { id: "undated", label: "Version 1", date: undefined },
    ]);
  });

  it("returns no options when there is no history", () => {
    expect(buildVersionOptions([])).toEqual([]);
  });

  it("keeps the most recent version as the last option, so it can be used as the default selection", () => {
    const options = buildVersionOptions([
      row("a", "2026-01-01T00:00:00Z"),
      row("c", "2026-03-01T00:00:00Z"),
      row("b", "2026-02-01T00:00:00Z"),
    ]);

    expect(options[options.length - 1].id).toBe("c");
  });
});

describe("scalar field derivation", () => {
  it("derives the comparison field list from the entity's own entityView, not a hardcoded list", () => {
    const entityView = {
      column: {
        elements: {
          windowElement: {
            panels: {
              significance: {
                __typename: "PanelMetaData",
                key: "significance",
                label: "Significance",
              },
              refLanguage: {
                __typename: "PanelMetaData",
                key: "refLanguage",
                label: "Language",
              },
            },
          },
        },
      },
    };

    const fields = findPanelMetadata(entityView).map((f: any) => f.key);

    expect(fields).toEqual(
      expect.arrayContaining(["significance", "refLanguage"]),
    );
  });
});

describe("wysiwyg field derivation", () => {
  it("finds WysiwygElement fields by metadataKey, not key", () => {
    const entityView = {
      column2: {
        elements: {
          reading: {
            __typename: "WysiwygElement",
            metadataKey: "reading",
            label: "Reading",
          },
        },
      },
    };

    const fields = findWysiwygElement(entityView);

    expect(fields).toEqual([
      {
        __typename: "WysiwygElement",
        metadataKey: "reading",
        label: "Reading",
      },
    ]);
  });
});

describe("relation list panel derivation", () => {
  it("finds every EntityListElement panel regardless of its key name", () => {
    const entityView = {
      column2: {
        elements: {
          inscriptionRefWords: {
            __typename: "EntityListElement",
            relationType: "refWords",
            label: "Words",
          },
        },
      },
    };

    const panels = findEntityListElement(entityView);

    expect(panels).toEqual([
      {
        __typename: "EntityListElement",
        relationType: "refWords",
        label: "Words",
      },
    ]);
  });
});

describe("useHistoryComparisonData relationDiffs", () => {
  beforeEach(() => {
    mocks.useQueryCalls.length = 0;
    mocks.queryResults = [];
    mocks.apolloQueryMock.mockClear();
    mocks.apolloQueryMock.mockImplementation(() =>
      Promise.resolve({ data: { Entity: null } }),
    );
  });

  const withResult = (value: any) => ({
    result: { value },
    loading: { value: false },
    error: { value: null },
  });

  it("includes any relation panel found in the entityView, not just a hardcoded set of relation types", async () => {
    const entityView = {
      column2: {
        elements: {
          words: {
            __typename: "EntityListElement",
            relationType: "refWords",
            label: "Words",
          },
          relatedEntities: {
            __typename: "EntityListElement",
            relationType: "refRelatedEntities",
            label: "Related entities",
            // Deliberately no entityTypes, so no label lookup is possible —
            // the panel should still show up with a raw-id fallback label.
          },
        },
      },
    };

    mocks.queryResults[0] = withResult({
      Entity: {
        entityView,
        relationValues: {
          refWords: [{ key: "word-1" }],
          refRelatedEntities: [{ key: "genre-1" }],
        },
        intialValues: {},
      },
    });
    mocks.queryResults[1] = withResult({
      EntityHistoryVersions: [versionRow("history-1", "2026-01-01T00:00:00Z")],
    });
    mocks.queryResults[3] = withResult({
      EntityHistoryVersionDetail: {
        id: "history-1",
        intialValues: { updated_at: "2026-01-01T00:00:00Z" },
        relationValues: {},
      },
    });

    const { relationDiffs } = useHistoryComparisonData(
      "entity-1",
      "inscription",
    );
    await flushPromises();

    expect(relationDiffs.value).toHaveLength(2);
    const relatedEntitiesDiff = relationDiffs.value.find(
      (d) => d.relationType === "refRelatedEntities",
    );
    expect(relatedEntitiesDiff).toBeDefined();
    expect(
      relatedEntitiesDiff!.items.find((item) => item.key === "genre-1")
        ?.label,
    ).toBe("genre-1");
    expect(mocks.apolloQueryMock).not.toHaveBeenCalled();
  });

  it("labels items using the entity type declared on the panel itself, the same way the live entity picker/list titles any entity", async () => {
    mocks.apolloQueryMock.mockImplementation(({ variables }: any) =>
      Promise.resolve({
        data: {
          Entity:
            variables.id === "genre-1"
              ? { id: "genre-1", intialValues: { title: "Fiction" } }
              : null,
        },
      }),
    );

    const entityView = {
      column2: {
        elements: {
          relatedEntities: {
            __typename: "EntityListElement",
            relationType: "refRelatedEntities",
            label: "Related entities",
            entityTypes: ["genre", "person"],
          },
        },
      },
    };

    mocks.queryResults[0] = withResult({
      Entity: {
        entityView,
        relationValues: { refRelatedEntities: [{ key: "genre-1" }] },
        intialValues: {},
      },
    });
    mocks.queryResults[1] = withResult({ EntityHistoryVersions: [] });

    const { relationDiffs } = useHistoryComparisonData("entity-1", "genre");
    await flushPromises();
    await flushPromises();

    expect(mocks.apolloQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { id: "genre-1", type: "genre" },
      }),
    );

    const relatedEntitiesDiff = relationDiffs.value.find(
      (d) => d.relationType === "refRelatedEntities",
    );
    expect(
      relatedEntitiesDiff!.items.find((item) => item.key === "genre-1")
        ?.label,
    ).toBe("Fiction");
  });

  it("assembles added/removed/unchanged items from current vs historical relationValues", async () => {
    const entityView = {
      column2: {
        elements: {
          words: {
            __typename: "EntityListElement",
            relationType: "refWords",
            label: "Words",
          },
        },
      },
    };

    mocks.queryResults[0] = withResult({
      Entity: {
        entityView,
        relationValues: {
          refWords: [{ key: "word-1" }, { key: "word-2" }],
        },
        intialValues: {},
      },
    });
    mocks.queryResults[1] = withResult({
      EntityHistoryVersions: [versionRow("history-1", "2026-01-01T00:00:00Z")],
    });
    mocks.queryResults[3] = withResult({
      EntityHistoryVersionDetail: {
        id: "history-1",
        intialValues: { updated_at: "2026-01-01T00:00:00Z" },
        relationValues: { refWords: [{ key: "word-1" }] },
      },
    });

    const { relationDiffs } = useHistoryComparisonData(
      "entity-1",
      "inscription",
    );
    await flushPromises();

    const wordsDiff = relationDiffs.value.find(
      (d) => d.relationType === "refWords",
    );
    expect(wordsDiff).toBeDefined();
    const statusFor = (key: string) =>
      wordsDiff!.items.find((item) => item.key === key)?.status;

    expect(statusFor("word-2")).toBe("added");
    expect(statusFor("word-1")).toBe("unchanged");
    expect(wordsDiff!.items.some((item) => item.status === "removed")).toBe(
      false,
    );
  });

  it("leftRelationDiffs excludes removed items; rightRelationDiffs excludes added items", async () => {
    const entityView = {
      column2: {
        elements: {
          words: {
            __typename: "EntityListElement",
            relationType: "refWords",
            label: "Words",
          },
        },
      },
    };

    mocks.queryResults[0] = withResult({
      Entity: {
        entityView,
        relationValues: {
          refWords: [{ key: "word-1" }, { key: "word-2" }],
        },
        intialValues: {},
      },
    });
    mocks.queryResults[1] = withResult({
      EntityHistoryVersions: [versionRow("history-1", "2026-01-01T00:00:00Z")],
    });
    mocks.queryResults[3] = withResult({
      EntityHistoryVersionDetail: {
        id: "history-1",
        intialValues: { updated_at: "2026-01-01T00:00:00Z" },
        relationValues: {
          refWords: [{ key: "word-1" }, { key: "word-3" }],
        },
      },
    });

    const { leftRelationDiffs, rightRelationDiffs } =
      useHistoryComparisonData("entity-1", "inscription");
    await flushPromises();

    const currentWords = leftRelationDiffs.value.find(
      (d) => d.relationType === "refWords",
    );
    const previousWords = rightRelationDiffs.value.find(
      (d) => d.relationType === "refWords",
    );

    expect(
      currentWords!.items.map((item) => [item.key, item.status]),
    ).toEqual(
      expect.arrayContaining([
        ["word-1", "unchanged"],
        ["word-2", "added"],
      ]),
    );
    expect(currentWords!.items).toHaveLength(2);
    expect(currentWords!.items.some((item) => item.status === "removed")).toBe(
      false,
    );

    expect(
      previousWords!.items.map((item) => [item.key, item.status]),
    ).toEqual(
      expect.arrayContaining([
        ["word-1", "unchanged"],
        ["word-3", "removed"],
      ]),
    );
    expect(previousWords!.items).toHaveLength(2);
    expect(previousWords!.items.some((item) => item.status === "added")).toBe(
      false,
    );
  });
});

describe("useHistoryComparisonData merged entities", () => {
  beforeEach(() => {
    mocks.useQueryCalls.length = 0;
    mocks.queryResults = [];
  });

  const withResult = (value: any) => ({
    result: { value },
    loading: { value: false },
    error: { value: null },
  });

  const entityView = {
    column: {
      elements: {
        windowElement: {
          __typename: "WindowElement",
          info: {
            __typename: "WindowElementPanel",
            isEditable: true,
            significance: {
              __typename: "PanelMetaData",
              key: "significance",
              label: "metadata.labels.significance",
            },
            reading: {
              __typename: "WysiwygElement",
              metadataKey: "reading",
              label: "metadata.labels.reading",
            },
          },
          audit: {
            __typename: "WindowElementPanel",
            isEditable: false,
            date_updated: {
              __typename: "PanelMetaData",
              key: "date_updated",
              label: "metadata.labels.date-updated",
            },
          },
        },
      },
    },
  };

  const currentIntialValues = {
    __typename: "IntialValues",
    significance: "current significance",
    reading: "<p>Current reading</p>",
    date_updated: "2026-03-01T00:00:00Z",
  };

  const historicalIntialValues = {
    __typename: "IntialValues",
    updated_at: "2026-01-01T00:00:00Z",
    significance: "historical significance",
    reading: "<p>Historical reading</p>",
    date_updated: "2026-01-01T00:00:00Z",
  };

  const setupWithHistory = () => {
    mocks.queryResults[0] = withResult({
      Entity: {
        id: "entity-1",
        entityView,
        relationValues: {},
        intialValues: currentIntialValues,
      },
    });
    mocks.queryResults[1] = withResult({
      EntityHistoryVersions: [versionRow("history-1", "2026-01-01T00:00:00Z")],
    });
    mocks.queryResults[3] = withResult({
      EntityHistoryVersionDetail: {
        id: "history-1",
        entityView,
        relationValues: {},
        intialValues: historicalIntialValues,
      },
    });
  };

  it("pill-tags the compared fields on both sides", async () => {
    setupWithHistory();

    const { leftVersionEntity, rightVersionEntity } =
      useHistoryComparisonData("entity-1", "inscription");
    await flushPromises();

    expect(leftVersionEntity.value?.intialValues.significance).toEqual({
      formatter: "pill|added",
      label: "current significance",
    });
    expect(rightVersionEntity.value?.intialValues.significance).toEqual({
      formatter: "pill|modified",
      label: "historical significance",
    });
  });

  it("keeps the real value of fields the diff does not compare, on both sides", async () => {
    setupWithHistory();

    const { leftVersionEntity, rightVersionEntity } =
      useHistoryComparisonData("entity-1", "inscription");
    await flushPromises();

    expect(leftVersionEntity.value?.intialValues.reading).toBe(
      "<p>Current reading</p>",
    );
    expect(rightVersionEntity.value?.intialValues.reading).toBe(
      "<p>Historical reading</p>",
    );

    expect(leftVersionEntity.value?.intialValues.date_updated).toBe(
      "2026-03-01T00:00:00Z",
    );
    expect(rightVersionEntity.value?.intialValues.date_updated).toBe(
      "2026-01-01T00:00:00Z",
    );
  });

  it("keeps the diff's synthetic ids, so neither column overwrites the real entity's form", async () => {
    setupWithHistory();

    const { leftVersionEntity, rightVersionEntity } =
      useHistoryComparisonData("entity-1", "inscription");
    await flushPromises();

    expect(leftVersionEntity.value?.id).toBe("entity-1_selected");
    expect(rightVersionEntity.value?.id).toBe("history-1_previous");
  });

  it("leaves the compared fields untagged when there is no historical version, without dropping any field", async () => {
    mocks.queryResults[0] = withResult({
      Entity: {
        id: "entity-1",
        entityView,
        relationValues: {},
        intialValues: currentIntialValues,
      },
    });

    const { leftVersionEntity, rightVersionEntity } =
      useHistoryComparisonData("entity-1", "inscription");
    await flushPromises();

    expect(rightVersionEntity.value).toBeNull();
    expect(leftVersionEntity.value?.intialValues).toMatchObject({
      significance: "current significance",
      reading: "<p>Current reading</p>",
      date_updated: "2026-03-01T00:00:00Z",
    });
  });

  it("is null for the current version while the entity has not loaded yet", async () => {
    const { leftVersionEntity } = useHistoryComparisonData(
      "entity-1",
      "inscription",
    );
    await flushPromises();

    expect(leftVersionEntity.value).toBeNull();
  });
});

describe("useHistoryComparisonData repeatable panel fields", () => {
  beforeEach(() => {
    mocks.useQueryCalls.length = 0;
    mocks.queryResults = [];
  });

  const withResult = (value: any) => ({
    result: { value },
    loading: { value: false },
    error: { value: null },
  });

  const entityView = {
    column: {
      elements: {
        parallelTitle: {
          __typename: "WindowElementPanel",
          repetitionConfig: { repetitionKey: "parallel_title_group" },
          parallel_title: {
            __typename: "PanelMetaData",
            key: "parallel_title",
          },
          other_title_details: {
            __typename: "PanelMetaData",
            key: "other_title_details",
          },
        },
      },
    },
  };

  it("pill-tags only the sub-field that changed within a repetition item, on both sides", async () => {
    mocks.queryResults[0] = withResult({
      Entity: {
        id: "entity-1",
        entityView,
        relationValues: {},
        intialValues: {
          parallel_title_group: [
            { parallel_title: "New title", other_title_details: "Same" },
          ],
        },
      },
    });
    mocks.queryResults[1] = withResult({
      EntityHistoryVersions: [versionRow("history-1", "2026-01-01T00:00:00Z")],
    });
    mocks.queryResults[3] = withResult({
      EntityHistoryVersionDetail: {
        id: "history-1",
        entityView,
        relationValues: {},
        intialValues: {
          updated_at: "2026-01-01T00:00:00Z",
          parallel_title_group: [
            { parallel_title: "Old title", other_title_details: "Same" },
          ],
        },
      },
    });

    const { leftVersionEntity, rightVersionEntity } =
      useHistoryComparisonData("entity-1", "inscription");
    await flushPromises();

    expect(
      leftVersionEntity.value?.intialValues.parallel_title_group[0]
        .parallel_title,
    ).toEqual({ formatter: "pill|added", label: "New title" });
    expect(
      rightVersionEntity.value?.intialValues.parallel_title_group[0]
        .parallel_title,
    ).toEqual({ formatter: "pill|modified", label: "Old title" });
    expect(
      leftVersionEntity.value?.intialValues.parallel_title_group[0]
        .other_title_details,
    ).toBe("Same");
  });

  it("shows an entirely added repetition item only on the current side", async () => {
    mocks.queryResults[0] = withResult({
      Entity: {
        id: "entity-1",
        entityView,
        relationValues: {},
        intialValues: {
          parallel_title_group: [
            { parallel_title: "First", other_title_details: "A" },
            { parallel_title: "Second", other_title_details: "B" },
          ],
        },
      },
    });
    mocks.queryResults[1] = withResult({
      EntityHistoryVersions: [versionRow("history-1", "2026-01-01T00:00:00Z")],
    });
    mocks.queryResults[3] = withResult({
      EntityHistoryVersionDetail: {
        id: "history-1",
        entityView,
        relationValues: {},
        intialValues: {
          updated_at: "2026-01-01T00:00:00Z",
          parallel_title_group: [
            { parallel_title: "First", other_title_details: "A" },
          ],
        },
      },
    });

    const { leftVersionEntity, rightVersionEntity } =
      useHistoryComparisonData("entity-1", "inscription");
    await flushPromises();

    const currentArr =
      leftVersionEntity.value?.intialValues.parallel_title_group;
    expect(currentArr).toHaveLength(2);
    expect(currentArr[1].parallel_title).toEqual({
      formatter: "pill|added",
      label: "Second",
    });

    expect(
      rightVersionEntity.value?.intialValues.parallel_title_group,
    ).toHaveLength(1);
  });
});

describe("useHistoryComparisonData wysiwygDiffs", () => {
  beforeEach(() => {
    mocks.useQueryCalls.length = 0;
    mocks.queryResults = [];
  });

  const withResult = (value: any) => ({
    result: { value },
    loading: { value: false },
    error: { value: null },
  });

  it("computes `changed` by indexing intialValues by metadataKey on both current and historical sides", async () => {
    const entityView = {
      column2: {
        elements: {
          reading: {
            __typename: "WysiwygElement",
            metadataKey: "reading",
            label: "Reading",
          },
          translation: {
            __typename: "WysiwygElement",
            metadataKey: "translation",
            label: "Translation",
          },
        },
      },
    };

    mocks.queryResults[0] = withResult({
      Entity: {
        entityView,
        relationValues: {},
        intialValues: {
          reading: "<p>Current reading</p>",
          translation: "<p>Same on both sides</p>",
        },
      },
    });
    mocks.queryResults[1] = withResult({
      EntityHistoryVersions: [versionRow("history-1", "2026-01-01T00:00:00Z")],
    });
    mocks.queryResults[3] = withResult({
      EntityHistoryVersionDetail: {
        id: "history-1",
        intialValues: {
          updated_at: "2026-01-01T00:00:00Z",
          reading: "<p>Historical reading</p>",
          translation: "<p>Same on both sides</p>",
        },
        relationValues: {},
      },
    });

    const { leftWysiwygDiffs, rightWysiwygDiffs } =
      useHistoryComparisonData("entity-1", "inscription");
    await flushPromises();

    const changedFor = (diffs: typeof leftWysiwygDiffs.value, key: string) =>
      diffs.find((diff) => diff.key === key)?.changed;

    expect(changedFor(leftWysiwygDiffs.value, "reading")).toBe(true);
    expect(changedFor(rightWysiwygDiffs.value, "reading")).toBe(true);
    expect(changedFor(leftWysiwygDiffs.value, "translation")).toBe(false);
    expect(changedFor(rightWysiwygDiffs.value, "translation")).toBe(false);
  });

  it("tags leftWysiwygDiffs with colorVariant 'current' and rightWysiwygDiffs with 'previous'", async () => {
    const entityView = {
      column2: {
        elements: {
          reading: {
            __typename: "WysiwygElement",
            metadataKey: "reading",
            label: "Reading",
          },
        },
      },
    };

    mocks.queryResults[0] = withResult({
      Entity: {
        entityView,
        relationValues: {},
        intialValues: { reading: "<p>Current reading</p>" },
      },
    });
    mocks.queryResults[1] = withResult({
      EntityHistoryVersions: [versionRow("history-1", "2026-01-01T00:00:00Z")],
    });
    mocks.queryResults[3] = withResult({
      EntityHistoryVersionDetail: {
        id: "history-1",
        intialValues: {
          updated_at: "2026-01-01T00:00:00Z",
          reading: "<p>Historical reading</p>",
        },
        relationValues: {},
      },
    });

    const { leftWysiwygDiffs, rightWysiwygDiffs } =
      useHistoryComparisonData("entity-1", "inscription");
    await flushPromises();

    expect(
      leftWysiwygDiffs.value.find((d) => d.key === "reading")
        ?.colorVariant,
    ).toBe("current");
    expect(
      rightWysiwygDiffs.value.find((d) => d.key === "reading")
        ?.colorVariant,
    ).toBe("previous");
  });

  it("reports nothing as changed when there is no historical version to compare against", async () => {
    const entityView = {
      column2: {
        elements: {
          reading: {
            __typename: "WysiwygElement",
            metadataKey: "reading",
            label: "Reading",
          },
        },
      },
    };

    mocks.queryResults[0] = withResult({
      Entity: {
        id: "entity-1",
        entityView,
        relationValues: {},
        intialValues: { reading: "<p>Current reading</p>" },
      },
    });

    const { leftWysiwygDiffs } = useHistoryComparisonData(
      "entity-1",
      "inscription",
    );
    await flushPromises();

    expect(leftWysiwygDiffs.value).toEqual([
      {
        key: "reading",
        label: "Reading",
        changed: false,
        colorVariant: "current",
      },
    ]);
  });
});

describe("useHistoryComparisonData versions query", () => {
  beforeEach(() => {
    mocks.useQueryCalls.length = 0;
    mocks.queryResults = [];
  });

  it("requests EntityHistoryVersions scoped to the given id and type directly, with no client-key-format filter hack", () => {
    useHistoryComparisonData("entity-1", "inscription");

    expect(mocks.useQueryCalls[1].variables).toEqual({
      id: "entity-1",
      type: "inscription",
    });
  });
});

describe("useHistoryComparisonData edit-state isolation", () => {
  const mountHost = (entityId: string, entityType = "inscription") =>
    mount(
      defineComponent({
        setup() {
          useHistoryComparisonData(entityId, entityType);
          return () => null;
        },
      }),
    );

  it("points useEntitySingle at this entity while mounted and restores the previous value on unmount", () => {
    useEntitySingle().setEntityUuid("previous-uuid");
    useEntitySingle().setEntityType("previous-type");

    const host = mountHost("edit-state-uuid-test");

    expect(useEntitySingle().getEntityUuid()).toBe("edit-state-uuid-test");
    expect(useEntitySingle().getEntityType()).toBe("inscription");

    host.unmount();

    expect(useEntitySingle().getEntityUuid()).toBe("previous-uuid");
    expect(useEntitySingle().getEntityType()).toBe("previous-type");
  });

  it("forces the entity's global edit state off while mounted, and restores it to editing on unmount if it was being edited", () => {
    useEditMode("edit-state-restore-test").isEdit = true;

    const host = mountHost("edit-state-restore-test");

    expect(useEditMode("edit-state-restore-test").isEdit).toBe(false);

    host.unmount();

    expect(useEditMode("edit-state-restore-test").isEdit).toBe(true);
  });

  it("leaves the entity's edit state off on unmount when it was not being edited beforehand", () => {
    useEditMode("edit-state-noop-test").isEdit = false;

    const host = mountHost("edit-state-noop-test");
    host.unmount();

    expect(useEditMode("edit-state-noop-test").isEdit).toBe(false);
  });
});

describe("useHistoryComparisonData left/right version selection", () => {
  beforeEach(() => {
    mocks.useQueryCalls.length = 0;
    mocks.queryResults = [];
  });

  const withResult = (value: any) => ({
    result: { value },
    loading: { value: false },
    error: { value: null },
  });

  const entityView = {
    column: {
      elements: {
        windowElement: {
          significance: {
            __typename: "PanelMetaData",
            key: "significance",
            label: "Significance",
          },
        },
      },
    },
  };

  const setup = () => {
    mocks.queryResults[0] = withResult({
      Entity: {
        id: "entity-1",
        entityView,
        relationValues: {},
        intialValues: { significance: "live significance" },
      },
    });
    mocks.queryResults[1] = withResult({
      EntityHistoryVersions: [
        versionRow("hist-old", "2026-01-01T00:00:00Z"),
        versionRow("hist-new", "2026-02-01T00:00:00Z"),
      ],
    });

    const detailByVersionId: Record<string, any> = {
      "hist-old": {
        id: "hist-old",
        entityView,
        relationValues: {},
        intialValues: {
          updated_at: "2026-01-01T00:00:00Z",
          significance: "old significance",
        },
      },
      "hist-new": {
        id: "hist-new",
        entityView,
        relationValues: {},
        intialValues: {
          updated_at: "2026-02-01T00:00:00Z",
          significance: "new significance",
        },
      },
    };
    // Function specs, so each side's detail query reactively re-resolves
    // whenever that side's own version id changes.
    const detailSpec = (variables: any) => ({
      result: {
        EntityHistoryVersionDetail:
          detailByVersionId[variables.versionId] ?? null,
      },
    });
    mocks.queryResults[2] = detailSpec;
    mocks.queryResults[3] = detailSpec;

    return useHistoryComparisonData("entity-1", "inscription");
  };

  it("defaults leftVersionId to the live sentinel and rightVersionId to the most recent historical version", async () => {
    const { leftVersionId, rightVersionId } = setup();
    await flushPromises();

    expect(leftVersionId.value).toBe(LIVE_VERSION_ID);
    expect(rightVersionId.value).toBe("hist-new");
  });

  it("resolves the left side to the live entity and the right side to the most recent historical version by default", async () => {
    const { leftVersionEntity, rightVersionEntity } = setup();
    await flushPromises();

    expect(leftVersionEntity.value?.id).toBe("entity-1_selected");
    expect(rightVersionEntity.value?.id).toBe("hist-new_previous");
  });

  it("switching leftVersionId to a historical version updates leftVersionEntity without affecting rightVersionEntity", async () => {
    const { leftVersionId, rightVersionEntity, leftVersionEntity } = setup();
    await flushPromises();

    const rightIdBeforeSwitch = rightVersionEntity.value?.id;
    leftVersionId.value = "hist-old";
    await flushPromises();

    expect(leftVersionEntity.value?.id).toBe("hist-old_selected");
    expect(rightVersionEntity.value?.id).toBe(rightIdBeforeSwitch);
  });

  it("switching rightVersionId updates rightVersionEntity without affecting leftVersionEntity", async () => {
    const { rightVersionId, leftVersionEntity, rightVersionEntity } = setup();
    await flushPromises();

    const leftIdBeforeSwitch = leftVersionEntity.value?.id;
    rightVersionId.value = "hist-old";
    await flushPromises();

    expect(rightVersionEntity.value?.id).toBe("hist-old_previous");
    expect(leftVersionEntity.value?.id).toBe(leftIdBeforeSwitch);
  });

  it("assigns the selectedVersion/previousVersion diff roles by screen position, not by chronological order", async () => {
    const { leftVersionId, rightVersionId, leftVersionEntity, rightVersionEntity } =
      setup();
    await flushPromises();

    leftVersionId.value = "hist-new";
    rightVersionId.value = "hist-old";
    await flushPromises();

    expect(leftVersionEntity.value?.intialValues.significance).toEqual({
      formatter: "pill|added",
      label: "new significance",
    });
    expect(rightVersionEntity.value?.intialValues.significance).toEqual({
      formatter: "pill|modified",
      label: "old significance",
    });
  });

  it("resolves leftVersionEntity/rightVersionEntity to null, without crashing, when a side's id is cleared to null", async () => {
    const { leftVersionId, rightVersionId, leftVersionEntity, rightVersionEntity } =
      setup();
    await flushPromises();

    leftVersionId.value = null;
    rightVersionId.value = null;
    await flushPromises();

    expect(leftVersionEntity.value).toBeNull();
    expect(rightVersionEntity.value).toBeNull();
  });

  it("re-resolves normally once a cleared side is given a new id", async () => {
    const { leftVersionId, leftVersionEntity } = setup();
    await flushPromises();

    leftVersionId.value = null;
    await flushPromises();
    expect(leftVersionEntity.value).toBeNull();

    leftVersionId.value = "hist-old";
    await flushPromises();
    expect(leftVersionEntity.value?.id).toBe("hist-old_selected");
  });
});

describe("useHistoryComparisonData per-side loading", () => {
  beforeEach(() => {
    mocks.useQueryCalls.length = 0;
    mocks.queryResults = [];
    mocks.apolloQueryMock.mockClear();
    mocks.apolloQueryMock.mockImplementation(() =>
      Promise.resolve({ data: { Entity: null } }),
    );
  });

  const resultWithLoading = (value: any, isLoading: boolean) => ({
    result: { value },
    loading: { value: isLoading },
    error: { value: null },
  });

  it("leftLoading follows the live entity query's own loading state while showing the live version", async () => {
    mocks.queryResults[0] = resultWithLoading(undefined, true);
    mocks.queryResults[1] = resultWithLoading(
      { EntityHistoryVersions: [] },
      false,
    );

    const { leftVersionId, leftLoading } = useHistoryComparisonData(
      "entity-1",
      "inscription",
    );
    await flushPromises();

    expect(leftVersionId.value).toBe(LIVE_VERSION_ID);
    expect(leftLoading.value).toBe(true);
  });

  it("leftLoading follows its own detail query's loading state once switched to a historical version, independently of the live query", async () => {
    mocks.queryResults[0] = resultWithLoading(
      {
        Entity: {
          id: "entity-1",
          entityView: {},
          relationValues: {},
          intialValues: {},
        },
      },
      true,
    );
    mocks.queryResults[1] = resultWithLoading(
      { EntityHistoryVersions: [versionRow("hist-1", "2026-01-01T00:00:00Z")] },
      false,
    );
    mocks.queryResults[2] = resultWithLoading(
      {
        EntityHistoryVersionDetail: {
          id: "hist-1",
          entityView: {},
          relationValues: {},
          intialValues: {},
        },
      },
      false,
    );

    const { leftVersionId, leftLoading } = useHistoryComparisonData(
      "entity-1",
      "inscription",
    );
    await flushPromises();

    leftVersionId.value = "hist-1";
    await flushPromises();

    expect(leftLoading.value).toBe(false);
  });

  it("rightLoading follows its own detail query's loading state, independently of the live query", async () => {
    mocks.queryResults[0] = resultWithLoading(
      {
        Entity: {
          id: "entity-1",
          entityView: {},
          relationValues: {},
          intialValues: {},
        },
      },
      true,
    );
    mocks.queryResults[1] = resultWithLoading(
      { EntityHistoryVersions: [versionRow("hist-1", "2026-01-01T00:00:00Z")] },
      false,
    );
    mocks.queryResults[3] = resultWithLoading(
      {
        EntityHistoryVersionDetail: {
          id: "hist-1",
          entityView: {},
          relationValues: {},
          intialValues: {},
        },
      },
      false,
    );

    const { rightLoading } = useHistoryComparisonData(
      "entity-1",
      "inscription",
    );
    await flushPromises();

    expect(rightLoading.value).toBe(false);
  });

  it("rightLoading is true while its own detail query is still loading", async () => {
    mocks.queryResults[0] = resultWithLoading(
      {
        Entity: {
          id: "entity-1",
          entityView: {},
          relationValues: {},
          intialValues: {},
        },
      },
      false,
    );
    mocks.queryResults[1] = resultWithLoading(
      { EntityHistoryVersions: [versionRow("hist-1", "2026-01-01T00:00:00Z")] },
      false,
    );
    mocks.queryResults[3] = resultWithLoading(undefined, true);

    const { rightLoading } = useHistoryComparisonData(
      "entity-1",
      "inscription",
    );
    await flushPromises();

    expect(rightLoading.value).toBe(true);
  });

  it("leftLoading and rightLoading are both true while any relation-label lookup is still in flight", async () => {
    const entityView = {
      column2: {
        elements: {
          relatedEntities: {
            __typename: "EntityListElement",
            relationType: "refRelatedEntities",
            label: "Related entities",
            entityTypes: ["genre"],
          },
        },
      },
    };

    mocks.queryResults[0] = resultWithLoading(
      {
        Entity: {
          id: "entity-1",
          entityView,
          relationValues: { refRelatedEntities: [{ key: "genre-1" }] },
          intialValues: {},
        },
      },
      false,
    );
    mocks.queryResults[1] = resultWithLoading(
      { EntityHistoryVersions: [] },
      false,
    );

    let resolveEntityLookup: (value: any) => void = () => {};
    mocks.apolloQueryMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveEntityLookup = resolve;
        }),
    );

    const { leftLoading, rightLoading } = useHistoryComparisonData(
      "entity-1",
      "inscription",
    );
    await flushPromises();

    expect(leftLoading.value).toBe(true);
    expect(rightLoading.value).toBe(true);

    resolveEntityLookup({ data: { Entity: null } });
    await flushPromises();
  });

  it("leftLoading and rightLoading are both false once every relation-label lookup has finished", async () => {
    const entityView = {
      column2: {
        elements: {
          relatedEntities: {
            __typename: "EntityListElement",
            relationType: "refRelatedEntities",
            label: "Related entities",
            entityTypes: ["genre"],
          },
        },
      },
    };

    mocks.queryResults[0] = resultWithLoading(
      {
        Entity: {
          id: "entity-1",
          entityView,
          relationValues: { refRelatedEntities: [{ key: "genre-1" }] },
          intialValues: {},
        },
      },
      false,
    );
    mocks.queryResults[1] = resultWithLoading(
      { EntityHistoryVersions: [] },
      false,
    );

    const { leftLoading, rightLoading } = useHistoryComparisonData(
      "entity-1",
      "inscription",
    );
    await flushPromises();
    await flushPromises();

    expect(leftLoading.value).toBe(false);
    expect(rightLoading.value).toBe(false);
  });
});
