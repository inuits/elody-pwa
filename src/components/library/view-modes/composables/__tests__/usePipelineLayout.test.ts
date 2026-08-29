import { describe, it, expect } from "vitest";
import {
  layoutPipeline,
  PIPELINE_CARD_WIDTH,
  PIPELINE_COLUMN_GAP,
  PIPELINE_ROW_GAP,
  PIPELINE_CANVAS_PADDING,
  type PipelineNodeInput,
} from "../usePipelineLayout";

const node = (
  id: string,
  sources: string[] = [],
  height = 100,
): PipelineNodeInput => ({ id, height, sources });

describe("layoutPipeline", () => {
  it("places a linear chain one node per column, left to right", () => {
    const layout = layoutPipeline([
      node("a"),
      node("b", ["a"]),
      node("c", ["b"]),
    ]);

    expect(layout.positions["a"].col).toBe(0);
    expect(layout.positions["b"].col).toBe(1);
    expect(layout.positions["c"].col).toBe(2);
    expect(layout.positions["b"].x).toBe(
      layout.positions["a"].x + PIPELINE_CARD_WIDTH + PIPELINE_COLUMN_GAP,
    );
  });

  it("uses the longest path to a source for the column", () => {
    // a → b → d and a → d: d sits after b, not directly after a
    const layout = layoutPipeline([
      node("a"),
      node("b", ["a"]),
      node("d", ["a", "b"]),
    ]);

    expect(layout.positions["d"].col).toBe(2);
  });

  it("stacks a fan-out adjacent to its producer and centres the producer", () => {
    const layout = layoutPipeline([
      node("api"),
      node("monitor", ["api"]),
      node("dash", ["monitor"]),
      node("svc", ["monitor"]),
      node("mail", ["svc"]),
    ]);

    // both consumers share column 2, stacked without overlap
    expect(layout.positions["dash"].col).toBe(2);
    expect(layout.positions["svc"].col).toBe(2);
    const [top, bottom] = [
      layout.positions["dash"],
      layout.positions["svc"],
    ].sort((a, b) => a.y - b.y);
    expect(bottom.y).toBeGreaterThanOrEqual(top.y + 100 + PIPELINE_ROW_GAP);

    // the producer's vertical centre falls between its two consumers
    const producerCentre = layout.positions["monitor"].y + 50;
    expect(producerCentre).toBeGreaterThan(top.y);
    expect(producerCentre).toBeLessThan(bottom.y + 100);
  });

  it("keeps query order inside column 0", () => {
    const layout = layoutPipeline([node("first"), node("second")]);

    expect(layout.positions["first"].y).toBeLessThan(
      layout.positions["second"].y,
    );
  });

  it("terminates on a cycle and still positions every node", () => {
    const layout = layoutPipeline([node("a", ["b"]), node("b", ["a"])]);

    expect(Object.keys(layout.positions)).toHaveLength(2);
    expect(layout.positions["a"]).toBeDefined();
    expect(layout.positions["b"]).toBeDefined();
  });

  it("ignores sources that are not part of the node list", () => {
    const layout = layoutPipeline([node("a", ["ghost-of-elsewhere"])]);

    expect(layout.positions["a"].col).toBe(0);
  });

  it("stacks an extra node in an occupied column below the others", () => {
    // suggestion hangs off "svc" whose column already holds "mail"
    const layout = layoutPipeline([
      node("api"),
      node("svc", ["api"]),
      node("mail", ["svc"]),
      node("__suggestion__", ["svc"]),
    ]);

    expect(layout.positions["__suggestion__"].col).toBe(2);
    const a = layout.positions["mail"];
    const b = layout.positions["__suggestion__"];
    // no overlap: the two occupy disjoint vertical ranges
    const [top, bottom] = [a, b].sort((x, y) => x.y - y.y);
    expect(bottom.y).toBeGreaterThanOrEqual(top.y + 100 + PIPELINE_ROW_GAP);
  });

  it("recomputes positions when measured heights change", () => {
    const before = layoutPipeline([node("a", [], 100), node("b", ["a"], 100)]);
    const after = layoutPipeline([node("a", [], 300), node("b", ["a"], 100)]);

    // taller column 0 pushes the vertically-centred b downwards
    expect(after.positions["b"].y).toBeGreaterThan(before.positions["b"].y);
    expect(after.contentHeight).toBeGreaterThan(before.contentHeight);
  });

  it("reports content dimensions including padding", () => {
    const layout = layoutPipeline([node("a", [], 120), node("b", ["a"], 80)]);

    expect(layout.contentWidth).toBe(
      PIPELINE_CANVAS_PADDING * 2 + PIPELINE_CARD_WIDTH * 2 + PIPELINE_COLUMN_GAP,
    );
    expect(layout.contentHeight).toBe(PIPELINE_CANVAS_PADDING * 2 + 120);
  });

  it("returns an empty layout for no nodes", () => {
    const layout = layoutPipeline([]);

    expect(layout.positions).toEqual({});
    expect(layout.contentWidth).toBe(0);
    expect(layout.contentHeight).toBe(0);
  });
});
