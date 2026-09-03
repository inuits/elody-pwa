import type { ConfigItem } from "@/generated-types/queries";

// The metadata conventions that wire pipeline cards together. Nothing here is
// hardcoded knowledge of a particular client: these are DEFAULTS, and a query
// declares different ones through the pipeline view mode's generic config
// channel (`viewModes(input: [{ viewMode: ViewModesPipeline, config: [...] }])`)
// — e.g. `{ key: "connectionsKey", value: "wiring" }`.
export type PipelineViewConfig = {
  // metadata prefix whose `<prefix>.<port>.from` entries draw the edges
  connectionsKey: string;
  // metadata prefix carrying the contract facts shown as chips
  contractsKey: string;
  // sub-field names under the contracts prefix
  consumesField: string;
  producesField: string;
  // sub-field of produces carrying the raw shape IRIs for the port picker
  shapeIriField: string;
  // the declared bulk operation an output port's "+" triggers — the port
  // picker IS that operation's ordinary picker, only scoped. The scoping
  // filter itself is declared in that picker's query (a hidden filter
  // referencing the $portShapeIris variable), not here.
  addConsumerBulkOperation: string;
  // an unpaged listing shows the whole chain; a config override wins
  paginationLimit: number;
};

export const DEFAULT_PIPELINE_VIEW_CONFIG: PipelineViewConfig = {
  connectionsKey: "connections",
  contractsKey: "contracts",
  consumesField: "consumes",
  producesField: "produces",
  shapeIriField: "iri",
  addConsumerBulkOperation: "addRelation",
  paginationLimit: 1000,
};

export const pipelineViewConfigFrom = (
  config?: ConfigItem[] | null,
): PipelineViewConfig => {
  const merged = { ...DEFAULT_PIPELINE_VIEW_CONFIG };
  for (const entry of config ?? []) {
    const key = entry?.key as keyof PipelineViewConfig | undefined;
    if (!key || !(key in merged)) continue;
    const current = merged[key];
    if (typeof entry.value === typeof current)
      (merged as Record<string, unknown>)[key] = entry.value;
  }
  return merged;
};

// the composed metadata keys the convention produces
export const consumesKey = (config: PipelineViewConfig): string =>
  `${config.contractsKey}.${config.consumesField}`;
export const producesKey = (config: PipelineViewConfig): string =>
  `${config.contractsKey}.${config.producesField}`;
export const producesIrisKey = (config: PipelineViewConfig): string =>
  `${producesKey(config)}.${config.shapeIriField}`;
