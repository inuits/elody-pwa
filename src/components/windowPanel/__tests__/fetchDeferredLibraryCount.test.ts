import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mocks = vi.hoisted(() => ({ query: vi.fn() }));

vi.mock("@/main", () => ({ apolloClient: { query: mocks.query } }));
vi.mock("@/composables/useImport", () => ({
  useImport: () => ({
    loadDocument: async (name: string) => ({ kind: "Document", name }),
  }),
}));

import { fetchDeferredLibraryCount } from "../fetchDeferredLibraryCount";
import { getLibraryDataValue } from "@/components/library/useBaseLibrary";

const posterFilters = {
  EntityTypeFilters: {
    advancedFilters: {
      type: {
        type: "type",
        defaultValue: "mediafile",
        hidden: true,
        __typename: "AdvancedFilter",
      },
      mediafile_type: {
        type: "text",
        key: ["podiumnet:1|metadata.mediafile_type"],
        defaultValue: "poster",
        hidden: true,
        __typename: "AdvancedFilter",
      },
      relation: {
        type: "selection",
        key: ["podiumnet:1|properties.ref_productions.value"],
        defaultValue: "$entity.id",
        hidden: true,
        __typename: "AdvancedFilter",
      },
      __typename: "AdvancedFilters",
    },
  },
};

const filtersTheListSends = [
  { type: "type", value: "mediafile", match_exact: true },
  {
    type: "text",
    key: ["podiumnet:1|metadata.mediafile_type"],
    value: "poster",
    match_exact: true,
  },
  {
    type: "selection",
    key: ["podiumnet:1|properties.ref_productions.value"],
    value: "PR-000001",
    match_exact: true,
  },
];

const libraryData = {
  queryName: "GetRelatedMediafilesWithTypePosterFilters",
  dataKey: "count",
};

let releases: (() => void)[] = [];
const run = async () => {
  const release = await fetchDeferredLibraryCount({
    list: {
      customQueryFilters: "GetRelatedMediafilesWithTypePosterFilters",
      entityTypes: ["mediafile"],
    },
    libraryDataKey: libraryData.queryName,
    identifiers: ["PR-000001"],
    parentEntity: { id: "PR-000001", uuid: "PR-000001" },
  });
  releases.push(release);
  return release;
};

const countQuery = () =>
  mocks.query.mock.calls.find(
    ([options]) => options.query.name === "GetEntitiesCount",
  )?.[0];

describe("fetchDeferredLibraryCount", () => {
  afterEach(() => {
    releases.forEach((release) => release());
    releases = [];
  });

  beforeEach(() => {
    mocks.query.mockReset();
    mocks.query.mockImplementation(async ({ query }) =>
      query.name === "GetEntitiesCount"
        ? { data: { Entities: { count: 3 } } }
        : { data: posterFilters },
    );
  });

  it("asks for the list's filters with the list's entity type", async () => {
    await run();
    expect(mocks.query).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({
          name: "GetRelatedMediafilesWithTypePosterFilters",
        }),
        variables: { entityType: "mediafile" },
      }),
    );
  });

  it("counts with the same filters the list sends, the entity filled in", async () => {
    await run();
    expect(countQuery()?.variables.advancedFilterInputs).toEqual(
      filtersTheListSends,
    );
  });

  it("asks only for the count, as the list's entity", async () => {
    await run();
    expect(countQuery()?.variables).toMatchObject({
      type: "mediafile",
      limit: 1,
    });
    expect(countQuery()?.context.headers).toEqual({
      "X-Parent-Entity-Id": "PR-000001",
    });
  });

  it("puts the count where the panel header reads it", async () => {
    await run();
    expect(getLibraryDataValue(libraryData)).toBe(3);
  });

  it("takes the count away again when released", async () => {
    const release = await run();
    release();
    expect(getLibraryDataValue(libraryData)).toBeUndefined();
  });

  it("shows no count when fetching it fails", async () => {
    mocks.query.mockRejectedValue(new Error("offline"));
    const release = await run();
    expect(getLibraryDataValue(libraryData)).toBeUndefined();
    expect(release).not.toThrow();
  });
});
