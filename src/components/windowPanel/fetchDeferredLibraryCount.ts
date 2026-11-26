import { DateTime } from "luxon";
import { apolloClient } from "@/main";
import { useImport } from "@/composables/useImport";
import { useFiltersBaseNew } from "@/composables/useFiltersBaseNew";
import { registerLibraryDataCount } from "@/components/library/useBaseLibrary";
import { SearchInputType } from "@/generated-types/queries";

type DeferredList = {
  customQueryFilters?: string | null;
  entityTypes?: (string | null)[] | null;
};

export const fetchDeferredLibraryCount = async ({
  list,
  libraryDataKey,
  identifiers,
  parentEntity,
}: {
  list: DeferredList;
  libraryDataKey: string;
  identifiers: string[];
  parentEntity?: unknown;
}): Promise<() => void> => {
  const entityType = list.entityTypes?.[0];
  if (!list.customQueryFilters || !entityType) return () => {};
  const { loadDocument } = useImport();
  const { setVariables, initializeFilters, getNormalizedFiltersForApi } =
    useFiltersBaseNew();

  try {
    const filters = await apolloClient.query({
      query: await loadDocument(list.customQueryFilters),
      variables: { entityType },
      fetchPolicy: "no-cache",
    });
    setVariables({
      parentIds: identifiers,
      entityType,
      entity: parentEntity as never,
      dateToday: DateTime.now().toISO() ?? undefined,
    });
    await initializeFilters({
      advancedFilters: filters.data?.EntityTypeFilters?.advancedFilters,
    });
    const result = await apolloClient.query({
      query: await loadDocument("GetEntitiesCount"),
      variables: {
        type: entityType,
        limit: 1,
        skip: 1,
        searchValue: { value: "", isAsc: false, key: "title", order_by: "" },
        advancedFilterInputs: getNormalizedFiltersForApi(),
        searchInputType: SearchInputType.AdvancedInputType,
      },
      context: { headers: { "X-Parent-Entity-Id": identifiers[0] ?? "" } },
      fetchPolicy: "no-cache",
    });
    return registerLibraryDataCount(
      libraryDataKey,
      result.data?.Entities?.count ?? 0,
    );
  } catch {
    return () => {};
  }
};
