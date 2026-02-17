import { computed, type Ref, toRaw } from "vue";
import isEqual from "lodash.isequal";
import { getMetadataFields } from "@/helpers";
import type { ColumnList, Entity } from "@/generated-types/queries";

export function useEntityDiff(
  props: {
    entity: Entity;
    entities: Entity[];
    entityId: string;
  },
  parentEntity: Ref<Entity | null | undefined>,
  panel: Ref<any>,
) {
  const keysToCompare = computed(() => {
    if (!props.entity || !panel.value) return [];

    const fields = getMetadataFields(
      panel.value,
      panel.value.panelType,
      props.entityId,
    );

    return fields.map((field: any) => field.key);
  });

  const formatDisplayValue = (val: any) => {
    if (val === "" || val === null || val === undefined) {
      return "";
    }
    return val;
  };

  const computeEntityDiff = (
    currentVersion: Entity,
    previousVersion: Entity,
    fields: string[],
  ) => {
    const cloneCurrentVersion = structuredClone(toRaw(currentVersion)) as any;
    const clonePreviousVersion = structuredClone(toRaw(previousVersion)) as any;

    const currentValues = cloneCurrentVersion?.intialValues || {};
    const previousValues = clonePreviousVersion?.intialValues || {};

    const processedCurrentValues: Record<string, any> = { __typename: "IntialValues" };
    const processedPreviousValues: Record<string, any> = { __typename: "IntialValues" };

    fields.forEach((key) => {
      const currentValue = currentValues[key]?.formatter
        ? currentValues[key].label
        : currentValues[key];
      const previousValue = previousValues[key]?.formatter
        ? previousValues[key].label
        : previousValues[key];

      if (!isEqual(currentValue, previousValue)) {
        processedPreviousValues[key] = {
          formatter: "pill|modified",
          label: formatDisplayValue(previousValue),
        };
        processedCurrentValues[key] = {
          formatter: "pill|added",
          label: formatDisplayValue(currentValue),
        };
      } else {
        processedPreviousValues[key] = previousValue;
        processedCurrentValues[key] = currentValue;
      }
    });

    cloneCurrentVersion.intialValues = processedCurrentValues;
    clonePreviousVersion.intialValues = processedPreviousValues;

    return {
      previousVersion: {
        ...clonePreviousVersion,
        id: `${previousVersion.id}_old_history_preview`,
      },
      currentVersion: {
        ...cloneCurrentVersion,
        id: `${currentVersion.id}_history_preview`,
      },
    };
  };

  const diffedResults = computed(() => {
    if (!props.entity || !parentEntity.value) return null;

    const selectedEntityIndex = props.entities.findIndex(
      (e) => e.id === props.entity.id,
    );

    if (selectedEntityIndex === -1) return null;

    return computeEntityDiff(
      parentEntity.value,
      props.entity,
      keysToCompare.value,
    );
  });

  return {
    diffedResults,
    keysToCompare,
  };
}
