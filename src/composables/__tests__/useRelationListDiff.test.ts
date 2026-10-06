import { describe, it, expect } from "vitest";
import { useRelationListDiff } from "../useRelationListDiff";

describe("useRelationListDiff", () => {
  it("classifies ids present only in the current version as added", () => {
    const result = useRelationListDiff(
      [{ key: "word-1" }, { key: "word-2" }],
      [{ key: "word-1" }],
    );
    expect(result.addedIds).toEqual(["word-2"]);
    expect(result.removedIds).toEqual([]);
    expect(result.unchangedIds).toEqual(["word-1"]);
  });

  it("classifies ids present only in the historical version as removed", () => {
    const result = useRelationListDiff(
      [{ key: "word-1" }],
      [{ key: "word-1" }, { key: "word-2" }],
    );
    expect(result.removedIds).toEqual(["word-2"]);
    expect(result.addedIds).toEqual([]);
    expect(result.unchangedIds).toEqual(["word-1"]);
  });

  it("handles missing relation arrays as empty", () => {
    const result = useRelationListDiff(undefined, undefined);
    expect(result).toEqual({ addedIds: [], removedIds: [], unchangedIds: [] });
  });
});
