import { computed, type Ref } from "vue";
import { dequal as isEqual } from "dequal";
import { getMetadataFields, type RepeatablePanelFields } from "@/helpers";
import type { Entity, WindowElementPanel } from "@/generated-types/queries";
import { deepToRaw } from "@/utils/deepToRaw";

interface DiffArgs {
  previousVersion: Entity | null | undefined;
  selectedVersion: Entity;
  fields: string[];
  repeatableFields?: RepeatablePanelFields[];
}

const formatDisplayValue = (val: any) => {
  if (val === "" || val === null || val === undefined) {
    return "";
  }
  return val;
};

export const computeEntityDiff = ({
  previousVersion,
  selectedVersion,
  fields,
  repeatableFields = [],
}: DiffArgs) => {
  const cloneSelected = structuredClone(deepToRaw(selectedVersion)) as any;
  const selectedValues = cloneSelected?.intialValues || {};
  const processedSelected: Record<string, any> = {
    __typename: "IntialValues",
  };

  const clonePrevious = previousVersion
    ? (structuredClone(deepToRaw(previousVersion)) as any)
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

  // Repeatable panels store one object per repetition under
  // `intialValues[repetitionKey]`, keyed by each nested field's own key
  // (e.g. `intialValues.parallel_title_group[0].parallel_title`). Repetitions
  // aren't identity-matched — they're compared position by position, and
  // only the fields that actually differ at a given index get pill-wrapped,
  // the way a plain scalar field would.
  repeatableFields.forEach(({ repetitionKey, fieldKeys }) => {
    const currentArr: any[] = Array.isArray(selectedValues[repetitionKey])
      ? selectedValues[repetitionKey]
      : [];
    const prevArr: any[] = Array.isArray(previousValues[repetitionKey])
      ? previousValues[repetitionKey]
      : [];
    const maxLength = Math.max(currentArr.length, prevArr.length);

    const processedCurrentArr: any[] = [];
    const processedPrevArr: any[] = [];

    for (let index = 0; index < maxLength; index++) {
      const currentItem = currentArr[index];
      const prevItem = prevArr[index];

      if (currentItem !== undefined) {
        const processedItem: Record<string, any> = { ...currentItem };
        fieldKeys.forEach((subKey) => {
          const currentVal = currentItem?.[subKey];
          const prevVal = prevItem?.[subKey];
          if (canDiff && !isEqual(currentVal, prevVal)) {
            processedItem[subKey] = {
              formatter: "pill|added",
              label: formatDisplayValue(currentVal),
            };
          }
        });
        processedCurrentArr.push(processedItem);
      }

      if (prevItem !== undefined) {
        const processedItem: Record<string, any> = { ...prevItem };
        fieldKeys.forEach((subKey) => {
          const currentVal = currentItem?.[subKey];
          const prevVal = prevItem?.[subKey];
          if (canDiff && !isEqual(currentVal, prevVal)) {
            processedItem[subKey] = {
              formatter: "pill|modified",
              label: formatDisplayValue(prevVal),
            };
          }
        });
        processedPrevArr.push(processedItem);
      }
    }

    processedSelected[repetitionKey] = processedCurrentArr;
    processedPrevious[repetitionKey] = processedPrevArr;
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

export function useEntityDiff(
  props: {
    entity: Entity;
    entities: Entity[];
    entityId: string;
  },
  panels: Ref<any>,
) {
  const keysToCompare = computed(() => {
    if (!props.entity || !panels.value) return [];

    const fields = panels.value
      .map((panel: WindowElementPanel) =>
        getMetadataFields(panel, panel.panelType, props.entityId),
      )
      .flat();

    return fields.map((field: any) => field.key);
  });

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
