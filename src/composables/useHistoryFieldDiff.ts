import { computeEntityDiff } from "@/composables/useEntityDiff";
import type { Entity } from "@/generated-types/queries";

export function useHistoryFieldDiff(
  currentEntity: Entity,
  selectedHistoricalEntity: Entity | null,
  fields: string[],
) {
  return computeEntityDiff({
    previousVersion: selectedHistoricalEntity,
    selectedVersion: currentEntity,
    fields,
  });
}
