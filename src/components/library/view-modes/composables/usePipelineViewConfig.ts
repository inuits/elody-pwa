import type { ConfigItem } from "@/generated-types/queries";

// The pipeline view mode's declared configuration. Deliberately small:
// wiring is declared relations (edgeRelations) or the typed shapes the
// graph adapter reads (a `connections` object, a `ports` list) — never
// string-key naming conventions.
export type PipelineViewConfig = {
  // relation types that ARE the wiring: for every relation of these types
  // on an entity, an edge is drawn from the related entity (the producer)
  // to this one. Lets a plain hierarchy declare its edges without any
  // client resolver deriving a connections object.
  edgeRelations: string[];
  // an unpaged listing shows the whole chain; a config override wins
  paginationLimit: number;
};

export const DEFAULT_PIPELINE_VIEW_CONFIG: PipelineViewConfig = {
  edgeRelations: [],
  paginationLimit: 1000,
};

export const pipelineViewConfigFrom = (
  config?: ConfigItem[] | null,
): PipelineViewConfig => {
  const merged = { ...DEFAULT_PIPELINE_VIEW_CONFIG };
  for (const entry of config ?? []) {
    if (entry?.key === "edgeRelations") {
      const raw = entry.value;
      const list = Array.isArray(raw)
        ? raw
        : typeof raw === "string"
          ? raw.split(",")
          : [];
      merged.edgeRelations = list
        .map((value) => String(value).trim())
        .filter(Boolean);
    }
    if (entry?.key === "paginationLimit" && typeof entry.value === "number")
      merged.paginationLimit = entry.value;
  }
  return merged;
};
