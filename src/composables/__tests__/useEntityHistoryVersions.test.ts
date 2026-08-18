import { describe, it, expect, beforeEach, vi } from "vitest";
import { useEntityHistoryVersions } from "../useEntityHistoryVersions";

const mocks = vi.hoisted(() => ({
  useQueryCalls: [] as any[],
  queryResults: [] as any[],
}));

vi.mock("@vue/apollo-composable", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useQuery: (document: any, variables: any, options: any) => {
    const callIndex = mocks.useQueryCalls.length;
    mocks.useQueryCalls.push({ document, variables, options });
    return (
      mocks.queryResults[callIndex] ?? {
        result: { value: undefined },
        loading: { value: false },
        error: { value: null },
      }
    );
  },
}));

beforeEach(() => {
  mocks.useQueryCalls = [];
  mocks.queryResults = [];
});

describe("useEntityHistoryVersions", () => {
  it("passes id and type through as query variables", () => {
    useEntityHistoryVersions("W-1", "work_music");

    expect(mocks.useQueryCalls[0].variables).toEqual({
      id: "W-1",
      type: "work_music",
      limit: undefined,
      skip: undefined,
    });
  });

  it("forwards optional limit and skip", () => {
    useEntityHistoryVersions("W-1", "work_music", { limit: 10, skip: 5 });

    expect(mocks.useQueryCalls[0].variables).toEqual({
      id: "W-1",
      type: "work_music",
      limit: 10,
      skip: 5,
    });
  });

  it("returns an empty list while the query has no result yet", () => {
    const { versions } = useEntityHistoryVersions("W-1", "work_music");

    expect(versions.value).toEqual([]);
  });

  it("exposes the resolved versions from the query result", () => {
    mocks.queryResults = [
      {
        result: {
          value: {
            EntityHistoryVersions: [
              {
                versionId: "v1",
                documentVersion: 1,
                timestamp: "2026-01-01T00:00:00Z",
                editedBy: "alice",
              },
            ],
          },
        },
        loading: { value: false },
        error: { value: null },
      },
    ];

    const { versions } = useEntityHistoryVersions("W-1", "work_music");

    expect(versions.value).toEqual([
      {
        versionId: "v1",
        documentVersion: 1,
        timestamp: "2026-01-01T00:00:00Z",
        editedBy: "alice",
      },
    ]);
  });

  it("exposes loading and error state from the underlying query", () => {
    const queryError = new Error("boom");
    mocks.queryResults = [
      {
        result: { value: undefined },
        loading: { value: true },
        error: { value: queryError },
      },
    ];

    const { loading, error } = useEntityHistoryVersions("W-1", "work_music");

    expect(loading.value).toBe(true);
    expect(error.value).toBe(queryError);
  });
});
