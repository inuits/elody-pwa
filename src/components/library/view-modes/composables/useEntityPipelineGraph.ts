// Turns an entity list into the graph the pipeline view mode draws.
//
// Entities are the nodes; the edges are the relations the view config
// declares (`edgeRelations`). For every declared relation an entity carries,
// the related entity feeds it. Nothing is persisted and nothing is inferred
// from naming: a relation key must equal the id or uuid of another rendered
// entity, otherwise it simply yields no edge.

import {
  DEFAULT_PIPELINE_VIEW_CONFIG,
  type PipelineViewConfig,
} from "./usePipelineViewConfig";

export type PipelinePort = {
  id: string;
};

export type PipelineGraphNode = {
  id: string;
  sources: string[];
  inputs: PipelinePort[];
  outputs: PipelinePort[];
};

export type PipelineGraphEdge = {
  id: string;
  from: string;
  to: string;
  relationType: string;
};

export type PipelineGraph = {
  nodes: PipelineGraphNode[];
  edges: PipelineGraphEdge[];
};

export type PipelineGraphInput = {
  id: string;
  entity: {
    id?: string;
    uuid?: string;
    relationValues?: unknown;
  };
};

export const PIPELINE_OUTPUT_PORT = "out";

const relatedKeysOf = (
  input: PipelineGraphInput,
  relationType: string,
): string[] => {
  const relationValues = input.entity?.relationValues as
    | Record<string, unknown>
    | undefined;
  const relations = relationValues?.[relationType];
  if (!Array.isArray(relations)) return [];
  return relations
    .map((relation) => relation?.key)
    .filter((key): key is string => typeof key === "string" && key !== "");
};

export const buildPipelineGraph = (
  inputs: PipelineGraphInput[],
  config: PipelineViewConfig = DEFAULT_PIPELINE_VIEW_CONFIG,
): PipelineGraph => {
  const nodeIdByKey = new Map<string, string>();
  for (const input of inputs) {
    for (const key of [input.id, input.entity?.id, input.entity?.uuid])
      if (key && !nodeIdByKey.has(key)) nodeIdByKey.set(key, input.id);
  }

  const edges: PipelineGraphEdge[] = [];
  const edgeIds = new Set<string>();
  for (const input of inputs) {
    for (const relationType of config.edgeRelations) {
      for (const key of relatedKeysOf(input, relationType)) {
        const from = nodeIdByKey.get(key);
        if (!from || from === input.id) continue;
        const id = `${from}->${input.id}:${relationType}`;
        if (edgeIds.has(id)) continue;
        edgeIds.add(id);
        edges.push({ id, from, to: input.id, relationType });
      }
    }
  }

  const nodes = inputs.map((input) => {
    const incoming = edges.filter((edge) => edge.to === input.id);
    const feedsSomeone = edges.some((edge) => edge.from === input.id);
    return {
      id: input.id,
      sources: [...new Set(incoming.map((edge) => edge.from))],
      inputs: [...new Set(incoming.map((edge) => edge.relationType))].map(
        (id) => ({ id }),
      ),
      outputs: feedsSomeone ? [{ id: PIPELINE_OUTPUT_PORT }] : [],
    };
  });

  return { nodes, edges };
};
