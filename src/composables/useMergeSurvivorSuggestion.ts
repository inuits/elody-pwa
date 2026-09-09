import {
  MergeEvaluationStatus,
  type MergeEvaluation,
  type MergeSurvivorStrategy,
  type MergeSurvivorSuggestionConfig,
} from "@/generated-types/queries";

export type MergeHint = {
  label: string;
  values: { expectedId: string };
};

export type MergeLabelSlot =
  | "recommended"
  | "invalid"
  | "unknown"
  | "no-recommendation"
  | "must-keep-recommended";

const LABEL_ROOT = "bulk-operations.merge-modal";

const SLOT_PER_STATUS: Record<MergeEvaluationStatus, MergeLabelSlot> = {
  [MergeEvaluationStatus.Valid]: "recommended",
  [MergeEvaluationStatus.Invalid]: "invalid",
  [MergeEvaluationStatus.Unknown]: "unknown",
};

const toKebabCase = (value: string): string =>
  value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

export const suggestionLabelKey = (
  strategy: MergeSurvivorStrategy,
  slot: MergeLabelSlot,
): string => `${LABEL_ROOT}.${toKebabCase(strategy)}.${slot}`;

export const expectedIdOf = (
  evaluations: MergeEvaluation[],
): string | undefined => {
  const expectedIds = new Set(
    evaluations
      .map((evaluation) => evaluation.details?.expected_id)
      .filter((expectedId): expectedId is string => !!expectedId),
  );
  return expectedIds.size === 1 ? [...expectedIds][0] : undefined;
};

export const pickRecommendedId = (
  evaluations: MergeEvaluation[],
): string | undefined => {
  const eligible = evaluations.filter(
    (evaluation) => evaluation.status === MergeEvaluationStatus.Valid,
  );
  if (eligible.length === 0) return undefined;

  const highestScore = Math.max(...eligible.map((one) => one.score));
  const best = eligible.filter(
    (evaluation) => evaluation.score === highestScore,
  );
  return best.length === 1 ? best[0].id : undefined;
};

export const hintForEvaluation = (
  evaluation: MergeEvaluation | undefined,
  config: MergeSurvivorSuggestionConfig | undefined,
): MergeHint | undefined => {
  if (!evaluation || !config) return undefined;
  if (config.hiddenVerdicts?.includes(evaluation.status)) return undefined;
  return {
    label: suggestionLabelKey(
      config.strategy,
      SLOT_PER_STATUS[evaluation.status],
    ),
    values: { expectedId: evaluation.details?.expected_id ?? "" },
  };
};

export const isSurvivorBlocked = (
  config: MergeSurvivorSuggestionConfig | undefined,
  recommendedId: string | undefined,
  survivorId: string | undefined,
): boolean => {
  if (!config?.requireRecommendedSurvivor || !recommendedId) return false;
  return recommendedId !== survivorId;
};
