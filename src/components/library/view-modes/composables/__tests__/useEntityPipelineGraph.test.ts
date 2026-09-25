import { describe, expect, it } from "vitest";
import { buildPipelineGraph } from "../useEntityPipelineGraph";
import { DEFAULT_PIPELINE_VIEW_CONFIG } from "../usePipelineViewConfig";

const WEMI_CONFIG = {
  ...DEFAULT_PIPELINE_VIEW_CONFIG,
  edgeRelations: ["refWork", "refExpressions"],
};

const entity = (
  id: string,
  relationValues: Record<string, { key: string; type?: string }[]> = {},
  uuid?: string,
) => ({ id, entity: { id, uuid: uuid ?? id, relationValues } });

describe("buildPipelineGraph", () => {
  it("returns one node per entity and no edges without declared relations", () => {
    const graph = buildPipelineGraph(
      [entity("w1"), entity("e1", { refWork: [{ key: "w1" }] })],
      DEFAULT_PIPELINE_VIEW_CONFIG,
    );
    expect(graph.nodes.map((node) => node.id)).toEqual(["w1", "e1"]);
    expect(graph.edges).toEqual([]);
  });

  it("draws an edge from the related entity to the entity carrying a declared relation", () => {
    const graph = buildPipelineGraph(
      [entity("w1"), entity("e1", { refWork: [{ key: "w1" }] })],
      WEMI_CONFIG,
    );
    expect(graph.edges).toEqual([
      { id: "w1->e1:refWork", from: "w1", to: "e1", relationType: "refWork" },
    ]);
  });

  it("chains a WEMI family work -> expression -> manifestation", () => {
    const graph = buildPipelineGraph(
      [
        entity("m1", { refExpressions: [{ key: "e1" }] }),
        entity("e1", { refWork: [{ key: "w1" }] }),
        entity("w1"),
      ],
      WEMI_CONFIG,
    );
    expect(graph.edges.map((edge) => `${edge.from}->${edge.to}`)).toEqual([
      "e1->m1",
      "w1->e1",
    ]);
    const byId = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));
    expect(byId.w1.sources).toEqual([]);
    expect(byId.e1.sources).toEqual(["w1"]);
    expect(byId.m1.sources).toEqual(["e1"]);
  });

  it("ignores relation types that are not declared", () => {
    const graph = buildPipelineGraph(
      [entity("p1"), entity("w1", { hasAuthor: [{ key: "p1" }] })],
      WEMI_CONFIG,
    );
    expect(graph.edges).toEqual([]);
  });

  it("ignores relations to entities outside the rendered list", () => {
    const graph = buildPipelineGraph(
      [entity("e1", { refWork: [{ key: "not-loaded" }] })],
      WEMI_CONFIG,
    );
    expect(graph.edges).toEqual([]);
  });

  it("matches the relation key on the entity uuid as well as its id", () => {
    const graph = buildPipelineGraph(
      [
        entity("entities/w1", {}, "w1-uuid"),
        entity("e1", { refWork: [{ key: "w1-uuid" }] }),
      ],
      WEMI_CONFIG,
    );
    expect(graph.edges.map((edge) => edge.from)).toEqual(["entities/w1"]);
  });

  it("does not match on partial or normalized identifiers", () => {
    const graph = buildPipelineGraph(
      [entity("work-1"), entity("e1", { refWork: [{ key: "Work 1" }] })],
      WEMI_CONFIG,
    );
    expect(graph.edges).toEqual([]);
  });

  it("skips self references and duplicate relations", () => {
    const graph = buildPipelineGraph(
      [
        entity("w1"),
        entity("e1", {
          refWork: [{ key: "w1" }, { key: "w1" }, { key: "e1" }],
        }),
      ],
      WEMI_CONFIG,
    );
    expect(graph.edges.map((edge) => edge.id)).toEqual(["w1->e1:refWork"]);
  });

  it("tolerates missing or malformed relationValues", () => {
    const graph = buildPipelineGraph(
      [
        { id: "a", entity: {} },
        { id: "b", entity: { relationValues: { refWork: "a" } } },
        { id: "c", entity: { relationValues: { refWork: [null, {}] } } },
      ],
      WEMI_CONFIG,
    );
    expect(graph.nodes).toHaveLength(3);
    expect(graph.edges).toEqual([]);
  });

  it("gives a node one input port per declared relation type it receives edges on", () => {
    const graph = buildPipelineGraph(
      [
        entity("w1"),
        entity("e0"),
        entity("m1", {
          refWork: [{ key: "w1" }],
          refExpressions: [{ key: "e0" }],
        }),
      ],
      WEMI_CONFIG,
    );
    const m1 = graph.nodes.find((node) => node.id === "m1")!;
    expect(m1.inputs.map((port) => port.id)).toEqual([
      "refWork",
      "refExpressions",
    ]);
    expect(m1.outputs).toEqual([]);
  });

  it("gives a node a single output port when it feeds another node", () => {
    const graph = buildPipelineGraph(
      [
        entity("w1"),
        entity("e1", { refWork: [{ key: "w1" }] }),
        entity("e2", { refWork: [{ key: "w1" }] }),
      ],
      WEMI_CONFIG,
    );
    const w1 = graph.nodes.find((node) => node.id === "w1")!;
    expect(w1.inputs).toEqual([]);
    expect(w1.outputs.map((port) => port.id)).toEqual(["out"]);
  });
});
