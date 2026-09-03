import { describe, it, expect } from "vitest";
import {
  DEFAULT_PIPELINE_VIEW_CONFIG,
  consumesKey,
  pipelineViewConfigFrom,
  producesIrisKey,
  producesKey,
} from "../usePipelineViewConfig";

describe("pipelineViewConfigFrom", () => {
  it("falls back to the defaults without a declaration", () => {
    expect(pipelineViewConfigFrom(undefined)).toEqual(
      DEFAULT_PIPELINE_VIEW_CONFIG,
    );
    expect(pipelineViewConfigFrom([])).toEqual(DEFAULT_PIPELINE_VIEW_CONFIG);
  });

  it("lets the declaration override any convention key", () => {
    const config = pipelineViewConfigFrom([
      { key: "connectionsKey", value: "wiring" },
      { key: "contractsKey", value: "io" },
      { key: "paginationLimit", value: 250 },
    ] as any);

    expect(config.connectionsKey).toBe("wiring");
    expect(config.contractsKey).toBe("io");
    expect(config.paginationLimit).toBe(250);
    // untouched entries keep their defaults
    expect(config.consumesField).toBe("consumes");
    expect(config.addConsumerBulkOperation).toBe("addRelation");
  });

  it("ignores unknown keys and wrongly typed values", () => {
    const config = pipelineViewConfigFrom([
      { key: "multiLine", value: true },
      { key: "connectionsKey", value: 42 },
    ] as any);

    expect(config).toEqual(DEFAULT_PIPELINE_VIEW_CONFIG);
  });

  it("composes the contract metadata keys from the declared parts", () => {
    const config = pipelineViewConfigFrom([
      { key: "contractsKey", value: "io" },
      { key: "shapeIriField", value: "shape" },
    ] as any);

    expect(consumesKey(config)).toBe("io.consumes");
    expect(producesKey(config)).toBe("io.produces");
    expect(producesIrisKey(config)).toBe("io.produces.shape");
  });
});
