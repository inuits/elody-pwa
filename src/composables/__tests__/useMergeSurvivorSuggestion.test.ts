import { describe, it, expect } from "vitest";
import {
  MergeEvaluationStatus,
  MergeSurvivorStrategy,
  type MergeEvaluation,
} from "@/generated-types/queries";
import {
  expectedIdOf,
  hintForEvaluation,
  isSurvivorBlocked,
  pickRecommendedId,
} from "../useMergeSurvivorSuggestion";

const CANONICAL = "NO-2IL216T37";
const STALE = "NO-03K2TBT98";

const evaluation = (
  id: string,
  status: MergeEvaluationStatus,
  score = status === MergeEvaluationStatus.Valid ? 1 : 0,
  expectedId: string | null = CANONICAL,
): MergeEvaluation => ({
  id,
  strategy: MergeSurvivorStrategy.IdentifierIntegrity,
  status,
  score,
  details: expectedId ? { expected_id: expectedId } : {},
});

const config = {
  strategy: MergeSurvivorStrategy.IdentifierIntegrity,
  recommendedLabel: "merge.recommended",
  invalidLabel: "merge.invalid",
  unknownLabel: "merge.unknown",
};

describe("pickRecommendedId", () => {
  it("recommends the record that holds its generated identifier", () => {
    const recommended = pickRecommendedId([
      evaluation(STALE, MergeEvaluationStatus.Invalid),
      evaluation(CANONICAL, MergeEvaluationStatus.Valid),
    ]);

    expect(recommended).toBe(CANONICAL);
  });

  it("recommends nobody when no record holds its generated identifier", () => {
    const recommended = pickRecommendedId([
      evaluation(STALE, MergeEvaluationStatus.Invalid),
      evaluation("NO-OTHER", MergeEvaluationStatus.Invalid),
    ]);

    expect(recommended).toBeUndefined();
  });

  it("recommends nobody when both records are equally valid", () => {
    const recommended = pickRecommendedId([
      evaluation(STALE, MergeEvaluationStatus.Valid),
      evaluation(CANONICAL, MergeEvaluationStatus.Valid),
    ]);

    expect(recommended).toBeUndefined();
  });

  it("prefers the higher score when a strategy grades its candidates", () => {
    const recommended = pickRecommendedId([
      evaluation(STALE, MergeEvaluationStatus.Valid, 3),
      evaluation(CANONICAL, MergeEvaluationStatus.Valid, 7),
    ]);

    expect(recommended).toBe(CANONICAL);
  });

  it("never recommends a record whose identifier cannot be judged", () => {
    const recommended = pickRecommendedId([
      evaluation("W-1", MergeEvaluationStatus.Unknown, 9, null),
      evaluation("W-2", MergeEvaluationStatus.Unknown, 9, null),
    ]);

    expect(recommended).toBeUndefined();
  });

  it("recommends nobody when there is nothing to judge", () => {
    expect(pickRecommendedId([])).toBeUndefined();
  });
});

describe("expectedIdOf", () => {
  it("reports the identifier the candidates should have had", () => {
    expect(
      expectedIdOf([
        evaluation(STALE, MergeEvaluationStatus.Invalid),
        evaluation("NO-OTHER", MergeEvaluationStatus.Invalid),
      ]),
    ).toBe(CANONICAL);
  });

  it("reports nothing when the candidates disagree on it", () => {
    expect(
      expectedIdOf([
        evaluation(STALE, MergeEvaluationStatus.Invalid, 0, CANONICAL),
        evaluation("NO-OTHER", MergeEvaluationStatus.Invalid, 0, "NO-THIRD"),
      ]),
    ).toBeUndefined();
  });

  it("reports nothing when no identifier can be generated", () => {
    expect(
      expectedIdOf([evaluation("W-1", MergeEvaluationStatus.Unknown, 0, null)]),
    ).toBeUndefined();
  });
});

describe("hintForEvaluation", () => {
  it("labels the valid record as the recommended one", () => {
    expect(
      hintForEvaluation(
        evaluation(CANONICAL, MergeEvaluationStatus.Valid),
        config,
      ),
    ).toEqual({
      label: "merge.recommended",
      values: { expectedId: CANONICAL },
    });
  });

  it("labels a stale record with the identifier its content generates", () => {
    expect(
      hintForEvaluation(
        evaluation(STALE, MergeEvaluationStatus.Invalid),
        config,
      ),
    ).toEqual({
      label: "merge.invalid",
      values: { expectedId: CANONICAL },
    });
  });

  it("labels an unjudgeable record without claiming an identifier", () => {
    expect(
      hintForEvaluation(
        evaluation("W-1", MergeEvaluationStatus.Unknown, 0, null),
        config,
      ),
    ).toEqual({ label: "merge.unknown", values: { expectedId: "" } });
  });

  it("has nothing to say without an evaluation", () => {
    expect(hintForEvaluation(undefined, config)).toBeUndefined();
  });

  it("has nothing to say when the configuration provides no label", () => {
    expect(
      hintForEvaluation(evaluation(CANONICAL, MergeEvaluationStatus.Valid), {
        strategy: MergeSurvivorStrategy.IdentifierIntegrity,
      }),
    ).toBeUndefined();
  });
});

describe("isSurvivorBlocked", () => {
  const blocking = {
    strategy: MergeSurvivorStrategy.IdentifierIntegrity,
    requireRecommendedSurvivor: true,
  };

  it("blocks keeping the record that does not hold its identifier", () => {
    expect(isSurvivorBlocked(blocking, CANONICAL, STALE)).toBe(true);
  });

  it("allows keeping the recommended record", () => {
    expect(isSurvivorBlocked(blocking, CANONICAL, CANONICAL)).toBe(false);
  });

  it("allows the merge when neither record holds its identifier", () => {
    expect(isSurvivorBlocked(blocking, undefined, STALE)).toBe(false);
  });

  it("allows the override when the configuration does not require one", () => {
    expect(
      isSurvivorBlocked(
        {
          strategy: MergeSurvivorStrategy.IdentifierIntegrity,
          requireRecommendedSurvivor: false,
        },
        CANONICAL,
        STALE,
      ),
    ).toBe(false);
  });

  it("allows the merge when no suggestion is configured", () => {
    expect(isSurvivorBlocked(undefined, CANONICAL, STALE)).toBe(false);
  });
});
