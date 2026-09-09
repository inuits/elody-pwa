import {
  MergeEvaluationStatus,
  type MergeEvaluation,
  type MergeSurvivorSuggestionConfig,
} from "@/generated-types/queries";

export type MergeHint = {
  label: string;
  values: { expectedId: string };
};

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

const labelKeyFor = (
  status: MergeEvaluationStatus,
  config: MergeSurvivorSuggestionConfig,
): string | undefined => {
  if (status === MergeEvaluationStatus.Valid)
    return config.recommendedLabel ?? undefined;
  if (status === MergeEvaluationStatus.Invalid)
    return config.invalidLabel ?? undefined;
  return config.unknownLabel ?? undefined;
};

export const hintForEvaluation = (
  evaluation: MergeEvaluation | undefined,
  config: MergeSurvivorSuggestionConfig | undefined,
): MergeHint | undefined => {
  if (!evaluation || !config) return undefined;
  const label = labelKeyFor(evaluation.status, config);
  if (!label) return undefined;
  return {
    label,
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
