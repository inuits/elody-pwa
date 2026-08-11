export interface RelationDiffEntry {
  key: string;
}

export interface RelationListDiffResult {
  addedIds: string[];
  removedIds: string[];
  unchangedIds: string[];
}

export function useRelationListDiff(
  currentRelations: RelationDiffEntry[] | undefined,
  historicalRelations: RelationDiffEntry[] | undefined,
): RelationListDiffResult {
  const currentIds = new Set((currentRelations ?? []).map((r) => r.key));
  const historicalIds = new Set((historicalRelations ?? []).map((r) => r.key));

  return {
    addedIds: [...currentIds].filter((id) => !historicalIds.has(id)),
    removedIds: [...historicalIds].filter((id) => !currentIds.has(id)),
    unchangedIds: [...currentIds].filter((id) => historicalIds.has(id)),
  };
}
