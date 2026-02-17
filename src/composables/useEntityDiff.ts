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
    oldEntity: Entity,
    newEntity: Entity,
    fields: string[],
  ) => {
    const cloneOld = structuredClone(toRaw(oldEntity)) as any;
    const cloneNew = structuredClone(toRaw(newEntity)) as any;

    const oldValues = cloneOld?.intialValues || {};
    const newValues = cloneNew?.intialValues || {};

    const processedOld: Record<string, any> = { __typename: "IntialValues" };
    const processedNew: Record<string, any> = { __typename: "IntialValues" };

    fields.forEach((key) => {
      const valOld = oldValues[key]?.formatter
        ? oldValues[key].label
        : oldValues[key];
      const valNew = newValues[key]?.formatter
        ? newValues[key].label
        : newValues[key];

      if (!isEqual(valOld, valNew)) {
        processedOld[key] = {
          formatter: "pill|modified",
          label: formatDisplayValue(valOld),
        };
        processedNew[key] = {
          formatter: "pill|added",
          label: formatDisplayValue(valNew),
        };
      } else {
        processedOld[key] = valOld;
        processedNew[key] = valNew;
      }
    });

    cloneOld.intialValues = processedOld;
    cloneNew.intialValues = processedNew;

    return {
      oldResult: {
        ...cloneOld,
        id: `${oldEntity.id}_old_history_preview`,
      },
      newResult: {
        ...cloneNew,
        id: `${newEntity.id}_history_preview`,
      },
    };
  };

  const diffedResults = computed(() => {
    if (!props.entity || !parentEntity.value) return null;

    const selectedEntityIndex = props.entities.findIndex(
      (e) => e.id === props.entity.id,
    );

    if (selectedEntityIndex === -1) return null;

    const entityToCompare =
      selectedEntityIndex > 0
        ? props.entities[selectedEntityIndex - 1]
        : parentEntity.value;

    return computeEntityDiff(
      entityToCompare,
      props.entity,
      keysToCompare.value,
    );
  });

  return {
    diffedResults,
    keysToCompare,
  };
}
