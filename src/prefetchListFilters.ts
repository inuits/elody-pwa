import type { ApolloClient, DocumentNode } from "@apollo/client/core";
import { isSessionCachedConfig } from "@/configCacheLink";

type Node = Record<string, unknown>;

const showsCount = (panel: Node) =>
  (panel.panelHeaderContent as Node | undefined)?.libraryData &&
  ((panel.panelHeaderContent as Node).libraryData as Node).dataKey === "count";

const listsToPrefetch = (layout: unknown) => {
  const lists = new Map<string, { filtersQuery: string; entityType: string }>();
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(walk);
    const value = node as Node;
    if (value.isCollapsed === true && !showsCount(value)) return;
    const entityType = (value.entityTypes as string[] | undefined)?.[0];
    if (
      value.__typename === "EntityListElement" &&
      typeof value.customQueryFilters === "string" &&
      entityType &&
      !(value.filtersNeedContext as unknown[] | undefined)?.length
    )
      lists.set(`${value.customQueryFilters}|${entityType}`, {
        filtersQuery: value.customQueryFilters,
        entityType,
      });
    Object.values(value).forEach(walk);
  };
  walk(layout);
  return [...lists.values()];
};

export const prefetchListFilters = async (
  layout: unknown,
  client: Pick<ApolloClient<unknown>, "query">,
  loadDocument: (name: string) => Promise<DocumentNode | undefined>,
): Promise<void> => {
  await Promise.all(
    listsToPrefetch(layout).map(async ({ filtersQuery, entityType }) => {
      const query = await loadDocument(filtersQuery).catch(() => undefined);
      if (!query || !isSessionCachedConfig(query)) return;
      await client
        .query({ query, variables: { entityType }, fetchPolicy: "no-cache" })
        .catch(() => undefined);
    }),
  );
};
