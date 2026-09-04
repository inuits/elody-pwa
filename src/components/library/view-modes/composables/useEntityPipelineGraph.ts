// The ONLY place that knows how pipeline entities encode their wiring.
//
// The pipeline view mode reads data the entities already carry; nothing is
// persisted for it. Every source below is optional and a missing piece
// degrades gracefully — an unmatched producer reference simply yields no
// edge, never an error.
//
// Recognised sources, all typed shapes (never string-key parsing):
// 1. declared edge relations — the view config names relation types
//    (`edgeRelations`) whose related entity is the producer feeding this
//    one; edges come straight from `entity.relationValues`, so a plain
//    hierarchy needs no wiring data at all.
// 2. a `connections` object — `{ [portId]: { from, port?, status?, label? } }`
//    — either directly on the entity, or as the value of a single relation
//    metadata entry keyed "connections" (per-use wiring: the same entity may
//    appear twice in one flow, so the wiring belongs to the relation). The
//    status is a validation verdict computed elsewhere; this module never
//    validates anything itself.
// 3. a `ports` list on the entity — `[{ id|name, direction: "in"|"out",
//    label?, required?, shapeIri?|shapeIris? }]` — naming the ports and, for
//    outputs, the shape IRIs that power the port-scoped "add a consumer"
//    picker.

import {
  DEFAULT_PIPELINE_VIEW_CONFIG,
  type PipelineViewConfig,
} from "./usePipelineViewConfig";

export type PipelinePort = {
  id: string;
  label?: string;
  required?: boolean;
  connected: boolean;
  // output ports: the port's shape IRI(s), for the port-scoped
  // "add a consumer" picker
  shapeIris?: string[];
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
  fromPort: string;
  to: string;
  toPort: string;
  status: "valid" | "mismatch" | "unknown";
  label?: string;
};

export type PipelineGraph = {
  nodes: PipelineGraphNode[];
  edges: PipelineGraphEdge[];
};

export type PipelineGraphInput = {
  id: string;
  entity: any;
  // enriched values (catalog facts merged in) keyed by metadata key
  values?: Record<string, any>;
  // the entity's relation on the parent, as returned by findRelation
  relation?: { relation?: { metadata?: Array<{ key: string; value: any }> } };
};

type RawConnection = {
  port: string;
  from: string;
  fromPort?: string;
  status?: string;
  label?: string;
};

const normalize = (value: unknown): string =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

// Producer references and entity identifiers come from different layers
// (component keys vs entity ids), so equality is judged on normalized
// suffixes rather than exact strings.
const matchReference = (
  reference: string,
  candidates: PipelineGraphInput[],
): PipelineGraphInput | undefined => {
  const target = normalize(String(reference).split("|")[0]);
  if (!target) return undefined;
  return candidates.find((candidate) => {
    const keys = [
      candidate.id,
      candidate.entity?.uuid,
      candidate.entity?.intialValues?.name,
      candidate.values?.name,
    ]
      .filter(Boolean)
      .map(normalize)
      .filter((key) => key.length > 0);
    return keys.some(
      (key) => key === target || key.endsWith(target) || target.endsWith(key),
    );
  });
};

const readStatus = (raw: unknown): "valid" | "mismatch" | "unknown" => {
  const value = String(raw ?? "").toLowerCase();
  if (value === "valid" || value === "ok") return "valid";
  if (value === "mismatch" || value === "invalid") return "mismatch";
  return "unknown";
};

const objectToConnections = (raw: unknown): RawConnection[] => {
  let value: any = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries<any>(value)
    .filter(([, entry]) => entry?.from)
    .map(([port, entry]) => ({
      port,
      from: String(entry.from),
      fromPort: entry.port ? String(entry.port) : undefined,
      status: entry.status,
      label: entry.label,
    }));
};

const connectionsOf = (input: PipelineGraphInput): RawConnection[] => {
  // directly on the entity (client-computed, entity-level wiring)
  const direct = objectToConnections(input.entity?.connections);
  if (direct.length > 0) return direct;

  // as a single relation metadata entry (per-use wiring)
  const metadata = input.relation?.relation?.metadata;
  if (!Array.isArray(metadata)) return [];
  const entry = metadata.find((item) => item?.key === "connections");
  return entry ? objectToConnections(entry.value) : [];
};

// Edges declared as relations: for every relation of a configured type on
// this entity, the related entity feeds it. The port id combines relation
// type and producer so multiple relations of one type stay distinct.
const relationEdgesOf = (
  input: PipelineGraphInput,
  config: PipelineViewConfig,
): RawConnection[] => {
  if (config.edgeRelations.length === 0) return [];
  const relationValues = input.entity?.relationValues;
  if (!relationValues || typeof relationValues !== "object") return [];
  const connections: RawConnection[] = [];
  for (const relationType of config.edgeRelations) {
    const relations = relationValues[relationType];
    if (!Array.isArray(relations)) continue;
    for (const relation of relations) {
      if (!relation?.key) continue;
      connections.push({
        port: `${relationType}:${relation.key}`,
        from: String(relation.key),
      });
    }
  }
  return connections;
};

export const buildPipelineGraph = (
  inputs: PipelineGraphInput[],
  config: PipelineViewConfig = DEFAULT_PIPELINE_VIEW_CONFIG,
): PipelineGraph => {
  const edges: PipelineGraphEdge[] = [];
  const referencedProducers = new Set<string>();
  const connectionsPerNode = new Map<string, RawConnection[]>();

  for (const input of inputs) {
    const connections = [
      ...connectionsOf(input),
      ...relationEdgesOf(input, config),
    ];
    connectionsPerNode.set(input.id, connections);
    for (const connection of connections) {
      const producer = matchReference(connection.from, inputs);
      if (!producer || producer.id === input.id) continue;
      referencedProducers.add(producer.id);
      edges.push({
        id: `${producer.id}->${input.id}:${connection.port}`,
        from: producer.id,
        fromPort: connection.fromPort ?? "out",
        to: input.id,
        toPort: connection.port,
        status: readStatus(connection.status),
        label: connection.label ? String(connection.label) : undefined,
      });
    }
  }

  const nodes: PipelineGraphNode[] = inputs.map((input) => {
    const connections = connectionsPerNode.get(input.id) ?? [];
    const feedsSomeone = referencedProducers.has(input.id);

    const isConnectedInput = (portId: string) =>
      connections.some((c) => c.port === portId && c.from);

    const portList: any[] = Array.isArray(input.entity?.ports)
      ? input.entity.ports
      : [];
    let inputs_: PipelinePort[];
    let outputs: PipelinePort[];

    if (portList.length > 0) {
      const portId = (port: any) => String(port.id ?? port.name ?? "");
      const portShapeIris = (port: any): string[] | undefined => {
        if (Array.isArray(port.shapeIris) && port.shapeIris.length > 0)
          return port.shapeIris.map(String);
        return port.shapeIri ? [String(port.shapeIri)] : undefined;
      };
      inputs_ = portList
        .filter((port) => port?.direction === "in")
        .map((port) => ({
          id: portId(port),
          label: port.label ?? port.shapeLabel ?? undefined,
          required: Boolean(port.required),
          connected: isConnectedInput(portId(port)),
        }));
      outputs = portList
        .filter((port) => port?.direction === "out")
        .map((port) => ({
          id: portId(port),
          label: port.label ?? port.shapeLabel ?? undefined,
          connected:
            feedsSomeone ||
            edges.some(
              (e) => e.from === input.id && e.fromPort === portId(port),
            ),
          shapeIris: portShapeIris(port),
        }));
    } else {
      // implicit ports: one input per named connection, one output when
      // something downstream is fed by this node
      inputs_ = connections.map((connection) => ({
        id: connection.port,
        connected: Boolean(connection.from),
      }));
      outputs = feedsSomeone
        ? [{ id: "out", connected: true }]
        : [];
    }

    return {
      id: input.id,
      sources: [...new Set(edges.filter((e) => e.to === input.id).map((e) => e.from))],
      inputs: inputs_,
      outputs,
    };
  });

  return { nodes, edges };
};
