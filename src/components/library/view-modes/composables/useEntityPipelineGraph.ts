// The ONLY place that knows how pipeline entities encode their wiring.
//
// The pipeline view mode reads metadata the entities already carry; nothing
// is persisted for it. Every source of truth below is optional and a missing
// piece degrades gracefully — an unmatched producer reference simply yields
// no edge, never an error.
//
// Recognised inputs, in order of preference per entity:
// 1. `entity.connections` — `{ [portId]: { from, port?, status?, label? } }`
// 2. the entity's relation metadata — `<connectionsKey>.<port>.from` (raw
//    value, e.g. "local--alert-monitor-cm|out"), with optional
//    `<connectionsKey>.<port>.status` / `.state` and `.label` / `.badge`.
//    The status is the validation verdict already computed elsewhere; this
//    module never validates shapes itself.
// 3. declared edge relations — the view config names relation types
//    (`edgeRelations`) whose related entity is the producer feeding this
//    one; edges come straight from `entity.relationValues`, so a plain
//    hierarchy needs no wiring data at all.
// Contract labels surface as the consumes/produces metadata values
// (SHACL/DCAT catalog facts) and drive the implicit single input / output
// port when no explicit `entity.ports` is present.
//
// The metadata key names themselves are not fixed here: they come from the
// PipelineViewConfig the query declares (with sensible defaults).

import {
  DEFAULT_PIPELINE_VIEW_CONFIG,
  consumesKey,
  producesIrisKey,
  producesKey,
  type PipelineViewConfig,
} from "./usePipelineViewConfig";

export type PipelinePort = {
  id: string;
  label?: string;
  required?: boolean;
  connected: boolean;
  // output ports: the contract's shape IRI(s), for the port-scoped
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

const escapeForRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const connectionsOf = (
  input: PipelineGraphInput,
  config: PipelineViewConfig,
): RawConnection[] => {
  // 1. the spec shape, straight on the entity
  const direct = input.entity?.connections;
  if (direct && typeof direct === "object" && !Array.isArray(direct)) {
    return Object.entries<any>(direct)
      .filter(([, value]) => value?.from)
      .map(([port, value]) => ({
        port,
        from: String(value.from),
        fromPort: value.port ? String(value.port) : undefined,
        status: value.status,
        label: value.label,
      }));
  }

  // 2. relation metadata written by the connect modal
  const metadata = input.relation?.relation?.metadata;
  if (!Array.isArray(metadata)) return [];
  const byKey = new Map(metadata.map((entry) => [entry.key, entry.value]));
  const connections: RawConnection[] = [];
  const wiring = config.connectionsKey;
  const fromPattern = new RegExp(`^${escapeForRegex(wiring)}\\.(.+)\\.from$`);
  for (const entry of metadata) {
    const match = fromPattern.exec(entry.key ?? "");
    if (!match || !entry.value) continue;
    const port = match[1];
    const rawValue = String(entry.value);
    const [from, fromPort] = rawValue.split("|");
    connections.push({
      port,
      from,
      fromPort: fromPort || undefined,
      status:
        byKey.get(`${wiring}.${port}.status`) ??
        byKey.get(`${wiring}.${port}.state`),
      label:
        byKey.get(`${wiring}.${port}.label`) ??
        byKey.get(`${wiring}.${port}.badge`),
    });
  }
  return connections;
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

const contractValue = (input: PipelineGraphInput, key: string): string => {
  const fromValues = input.values?.[key];
  if (fromValues) return String(fromValues);
  const fromInitial = input.entity?.intialValues?.[key];
  return fromInitial ? String(fromInitial) : "";
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
      ...connectionsOf(input, config),
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
    const consumes = contractValue(input, consumesKey(config));
    const produces = contractValue(input, producesKey(config));
    const producesIris = contractValue(input, producesIrisKey(config))
      .split(/\s+/)
      .filter(Boolean);

    const explicitPorts = input.entity?.ports;
    let inputs_: PipelinePort[];
    let outputs: PipelinePort[];
    const isConnectedInput = (portId: string) =>
      connections.some((c) => c.port === portId && c.from);

    if (explicitPorts?.in || explicitPorts?.out) {
      inputs_ = (explicitPorts.in ?? []).map((port: any) => ({
        id: String(port.id),
        label: port.label,
        required: Boolean(port.required),
        connected: isConnectedInput(String(port.id)),
      }));
      outputs = (explicitPorts.out ?? []).map((port: any) => ({
        id: String(port.id),
        label: port.label,
        connected: edges.some(
          (e) => e.from === input.id && e.fromPort === String(port.id),
        ),
        shapeIris: port.shapeIri ? [String(port.shapeIri)] : producesIris,
      }));
    } else {
      // implicit ports: one per named connection, or a single one derived
      // from the presence of a Consumes / Produces contract
      inputs_ = connections.map((connection) => ({
        id: connection.port,
        connected: Boolean(connection.from),
      }));
      if (inputs_.length === 0 && consumes)
        inputs_ = [{ id: "in", label: consumes, required: true, connected: false }];
      const feedsSomeone = referencedProducers.has(input.id);
      outputs =
        produces || feedsSomeone
          ? [
              {
                id: "out",
                label: produces || undefined,
                connected: feedsSomeone,
                shapeIris: producesIris,
              },
            ]
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
