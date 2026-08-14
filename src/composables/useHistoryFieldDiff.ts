import { computeEntityDiff } from "@/composables/useEntityDiff";
import type { Entity } from "@/generated-types/queries";
import type { RepeatablePanelFields } from "@/helpers";

export function useHistoryFieldDiff(
  currentEntity: Entity,
  selectedHistoricalEntity: Entity | null,
  fields: string[],
  repeatableFields: RepeatablePanelFields[] = [],
) {
  return computeEntityDiff({
    previousVersion: selectedHistoricalEntity,
    selectedVersion: currentEntity,
    fields,
    repeatableFields,
  });
}
