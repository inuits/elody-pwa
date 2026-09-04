import type { ConfigItem } from "@/generated-types/queries";

// The pipeline view mode's declared configuration. Deliberately small:
// wiring is either declared relations (edgeRelations) or the fixed platform
// conventions below — platform vocabulary like `teaserMetadata`, not
// client vocabulary, so it is not renameable.
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

// Fixed platform conventions for the richer wiring channel: relation
// metadata `connections.<port>.from` (with optional status/label) and the
// contract facts shown as chips / carrying the port shape IRIs. Clients
// project their data INTO these names, the way metadata projects into
// teaserMetadata.
export const PIPELINE_CONNECTIONS_KEY = "connections";
export const PIPELINE_CONSUMES_KEY = "contracts.consumes";
export const PIPELINE_PRODUCES_KEY = "contracts.produces";
export const PIPELINE_PRODUCES_IRIS_KEY = "contracts.produces.iri";

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
