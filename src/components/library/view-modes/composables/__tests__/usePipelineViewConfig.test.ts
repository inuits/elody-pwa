import { describe, expect, it } from "vitest";
import {
  DEFAULT_PIPELINE_VIEW_CONFIG,
  pipelineViewConfigFrom,
} from "../usePipelineViewConfig";

describe("pipelineViewConfigFrom", () => {
  it("returns the defaults without config", () => {
    expect(pipelineViewConfigFrom(undefined)).toEqual(
      DEFAULT_PIPELINE_VIEW_CONFIG,
    );
    expect(pipelineViewConfigFrom(null)).toEqual(DEFAULT_PIPELINE_VIEW_CONFIG);
  });

  it("declares no edges by default", () => {
    expect(DEFAULT_PIPELINE_VIEW_CONFIG.edgeRelations).toEqual([]);
  });

  it("reads edgeRelations as a list of relation types", () => {
    const config = pipelineViewConfigFrom([
      { key: "edgeRelations", value: ["refWork", "refExpressions"] },
    ]);
    expect(config.edgeRelations).toEqual(["refWork", "refExpressions"]);
  });

  it("accepts a single relation type as edgeRelations", () => {
    const config = pipelineViewConfigFrom([
      { key: "edgeRelations", value: "isPartOf" },
    ]);
    expect(config.edgeRelations).toEqual(["isPartOf"]);
  });

  it("drops non-string and empty entries from edgeRelations", () => {
    const config = pipelineViewConfigFrom([
      { key: "edgeRelations", value: ["refWork", 3, "", null] },
    ]);
    expect(config.edgeRelations).toEqual(["refWork"]);
  });

  it("overrides the pagination limit with a positive number", () => {
    expect(
      pipelineViewConfigFrom([{ key: "paginationLimit", value: 250 }])
        .paginationLimit,
    ).toBe(250);
    expect(
      pipelineViewConfigFrom([{ key: "paginationLimit", value: 0 }])
        .paginationLimit,
    ).toBe(DEFAULT_PIPELINE_VIEW_CONFIG.paginationLimit);
  });

  it("ignores unknown keys", () => {
    expect(
      pipelineViewConfigFrom([{ key: "connectionsKey", value: "wiring" }]),
    ).toEqual(DEFAULT_PIPELINE_VIEW_CONFIG);
  });
});
