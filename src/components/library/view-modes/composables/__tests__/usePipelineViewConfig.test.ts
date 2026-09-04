import { describe, it, expect } from "vitest";
import {
  DEFAULT_PIPELINE_VIEW_CONFIG,
  PIPELINE_CONNECTIONS_KEY,
  PIPELINE_CONSUMES_KEY,
  PIPELINE_PRODUCES_IRIS_KEY,
  PIPELINE_PRODUCES_KEY,
  pipelineViewConfigFrom,
} from "../usePipelineViewConfig";

describe("pipelineViewConfigFrom", () => {
  it("falls back to the defaults without a declaration", () => {
    expect(pipelineViewConfigFrom(undefined)).toEqual(
      DEFAULT_PIPELINE_VIEW_CONFIG,
    );
    expect(pipelineViewConfigFrom([])).toEqual(DEFAULT_PIPELINE_VIEW_CONFIG);
  });

  it("parses edgeRelations from a list or a comma-separated string", () => {
    expect(
      pipelineViewConfigFrom([
        { key: "edgeRelations", value: ["refWork", "refExpressions"] },
      ] as any).edgeRelations,
    ).toEqual(["refWork", "refExpressions"]);
    expect(
      pipelineViewConfigFrom([
        { key: "edgeRelations", value: "refWork, refExpressions" },
      ] as any).edgeRelations,
    ).toEqual(["refWork", "refExpressions"]);
  });

  it("takes a declared pagination limit and ignores unknown keys", () => {
    const config = pipelineViewConfigFrom([
      { key: "paginationLimit", value: 250 },
      { key: "connectionsKey", value: "wiring" },
    ] as any);
    expect(config.paginationLimit).toBe(250);
    expect(config).not.toHaveProperty("connectionsKey");
  });

  it("exposes the fixed platform conventions", () => {
    expect(PIPELINE_CONNECTIONS_KEY).toBe("connections");
    expect(PIPELINE_CONSUMES_KEY).toBe("contracts.consumes");
    expect(PIPELINE_PRODUCES_KEY).toBe("contracts.produces");
    expect(PIPELINE_PRODUCES_IRIS_KEY).toBe("contracts.produces.iri");
  });
});
