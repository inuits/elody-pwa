import { describe, expect, it, vi } from "vitest";
import { gql } from "@apollo/client/core";
import { prefetchListFilters } from "@/prefetchListFilters";

const filters = gql`
  query GetPosterFilters($entityType: String!) {
    EntityTypeFilters(type: $entityType) {
      advancedFilters {
        type(input: selection)
      }
    }
  }
`;
const permissionFilters = gql`
  query GetPrivateFilters($entityType: String!) {
    EntityTypeFilters(type: $entityType) {
      advancedFilters {
        type(input: selection)
        permitted(input: ["admin"])
      }
    }
  }
`;

const list = (customQueryFilters: string, extra: object = {}) => ({
  __typename: "EntityListElement",
  customQueryFilters,
  entityTypes: ["mediafile"],
  ...extra,
});

const setup = () => {
  const query = vi.fn().mockResolvedValue({ data: {} });
  const documents: Record<string, unknown> = {
    GetPosterFilters: filters,
    GetPrivateFilters: permissionFilters,
  };
  const loadDocument = vi.fn(async (name: string) => documents[name]);
  const prefetch = (layout: unknown) =>
    prefetchListFilters(layout, { query } as never, loadDocument);
  return { query, prefetch };
};

describe("prefetchListFilters", () => {
  it("fetches the filters of every list on the page", async () => {
    const { query, prefetch } = setup();
    await prefetch({ column: { panel: { list: list("GetPosterFilters") } } });
    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        query: filters,
        variables: { entityType: "mediafile" },
      }),
    );
  });

  it("fetches the filters a list shares with another only once", async () => {
    const { query, prefetch } = setup();
    await prefetch([list("GetPosterFilters"), list("GetPosterFilters")]);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it("leaves out lists in a closed panel without a count", async () => {
    const { query, prefetch } = setup();
    await prefetch({ isCollapsed: true, list: list("GetPosterFilters") });
    expect(query).not.toHaveBeenCalled();
  });

  it("fetches the filters of a closed panel that shows a count", async () => {
    const { query, prefetch } = setup();
    await prefetch({
      isCollapsed: true,
      panelHeaderContent: { libraryData: { dataKey: "count" } },
      list: list("GetPosterFilters"),
    });
    expect(query).toHaveBeenCalledTimes(1);
  });

  it("leaves out filters that are not kept for the session", async () => {
    const { query, prefetch } = setup();
    await prefetch(list("GetPrivateFilters"));
    expect(query).not.toHaveBeenCalled();
  });

  it("leaves out lists whose filters need the record's values", async () => {
    const { query, prefetch } = setup();
    await prefetch(
      list("GetPosterFilters", { filtersNeedContext: ["intialValues"] }),
    );
    expect(query).not.toHaveBeenCalled();
  });

  it("ignores a filters query that fails", async () => {
    const { query, prefetch } = setup();
    query.mockRejectedValue(new Error("offline"));
    await expect(prefetch(list("GetPosterFilters"))).resolves.toBeUndefined();
  });
});
