import type { ConfigItem } from "@/generated-types/queries";

// What a query declares about the pipeline view mode, through the view
// mode's generic config channel:
// `viewModes(input: [{ viewMode: ViewModesPipeline, config: [...] }])`.
export type PipelineViewConfig = {
  // relation types whose related entity feeds the entity carrying them,
  // e.g. ["refWork", "refExpressions"] draws work -> expression ->
  // manifestation; without any, the entities render as unconnected cards
  edgeRelations: string[];
  // an unpaged listing shows the whole flow; a positive override wins
  paginationLimit: number;
};

export const DEFAULT_PIPELINE_VIEW_CONFIG: PipelineViewConfig = {
  edgeRelations: [],
  paginationLimit: 1000,
};

const toRelationTypes = (value: unknown): string[] => {
  const values = Array.isArray(value) ? value : [value];
  return values.filter(
    (item): item is string => typeof item === "string" && item.length > 0,
  );
};

export const pipelineViewConfigFrom = (
  config?: ConfigItem[] | null,
): PipelineViewConfig => {
  const merged = { ...DEFAULT_PIPELINE_VIEW_CONFIG };
  for (const entry of config ?? []) {
    if (entry?.key === "edgeRelations")
      merged.edgeRelations = toRelationTypes(entry.value);
    if (
      entry?.key === "paginationLimit" &&
      typeof entry.value === "number" &&
      entry.value > 0
    )
      merged.paginationLimit = entry.value;
  }
  return merged;
};
