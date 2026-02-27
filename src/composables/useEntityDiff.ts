import { computed, type Ref, toRaw } from "vue";
import { dequal as isEqual } from "dequal";
import { getMetadataFields } from "@/helpers";
import type { Entity } from "@/generated-types/queries";

interface DiffArgs {
  previousVersion: Entity | null | undefined;
  selectedVersion: Entity;
  fields: string[];
}

export function useEntityDiff(
  props: {
    entity: Entity;
    entities: Entity[];
    entityId: string;
  },
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

  const computeEntityDiff = ({
    previousVersion,
    selectedVersion,
    fields,
  }: DiffArgs) => {
    const cloneSelected = structuredClone(toRaw(selectedVersion)) as any;
    const selectedValues = cloneSelected?.intialValues || {};
    const processedSelected: Record<string, any> = {
      __typename: "IntialValues",
    };

    const clonePrevious = previousVersion
      ? (structuredClone(toRaw(previousVersion)) as any)
      : null;
    const previousValues = clonePrevious?.intialValues || {};
    const processedPrevious: Record<string, any> = {
      __typename: "IntialValues",
    };

    const canDiff = !!clonePrevious;

    fields.forEach((key) => {
      const currentVal = selectedValues[key]?.formatter
        ? selectedValues[key].label
        : selectedValues[key];
      const prevVal = previousValues[key]?.formatter
        ? previousValues[key].label
        : previousValues[key];

      const hasChanged = canDiff && !isEqual(currentVal, prevVal);

      if (hasChanged) {
        processedPrevious[key] = {
          formatter: "pill|modified",
          label: formatDisplayValue(prevVal),
        };
        processedSelected[key] = {
          formatter: "pill|added",
          label: formatDisplayValue(currentVal),
        };
      } else {
        processedPrevious[key] = prevVal;
        processedSelected[key] = currentVal;
      }
    });

    cloneSelected.intialValues = processedSelected;

    if (clonePrevious) {
      clonePrevious.intialValues = processedPrevious;
    }

    return {
      previousVersion: clonePrevious
        ? { ...clonePrevious, id: `${previousVersion!.id}_previous` }
        : {},
      selectedVersion: {
        ...cloneSelected,
        id: `${selectedVersion.id}_selected`,
      },
    };
  };

  const diffedResults = computed(() => {
    if (!props.entity || !props.entities) return null;

    const selectedEntityIndex = props.entities.findIndex(
      (e) => e.id === props.entity.id,
    );

    if (selectedEntityIndex === -1) return null;
    const previousVersion = props.entities[selectedEntityIndex + 1];

    return computeEntityDiff({
      previousVersion: previousVersion,
      selectedVersion: props.entity,
      fields: keysToCompare.value,
    });
  });

  return {
    diffedResults,
    keysToCompare,
  };
}
