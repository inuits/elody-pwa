import { ref, computed, type ComputedRef } from "vue";
import { nanoid } from "nanoid";

export type RepeatablePanelConfig = {
  mainPanelId: string;
  repetitionId: string;
  repeatable: boolean;
};

type RepeatableFieldConfig = {
  repetitionIds: string[];
};

const repeatableFieldConfigurations = ref<{
  [key: string]: RepeatableFieldConfig;
}>({});

export type UseRepeatableFields = {
  repetitionIds: ComputedRef<string[]>;
  repeatAmount: ComputedRef<number>;
  repetitionDeleteIsAvailable: ComputedRef<boolean>;
  getRepeatableFieldConfig: () => RepeatableFieldConfig;
  increaseFieldRepeatAmount: () => void;
  decreaseFieldRepeatAmount: (id: string) => void;
  removeRepeatableFieldConfig: () => void;
};

export const useRepeatableFields = (fieldName: string): UseRepeatableFields => {
  const createBaseRepeatableFieldConfig = (): RepeatableFieldConfig => {
    return { repetitionIds: [nanoid()] };
  };

  const initializeRepeatableField = (): void => {
    if (repeatableFieldConfigurations.value[fieldName]) return;
    else
      repeatableFieldConfigurations.value[fieldName] =
        createBaseRepeatableFieldConfig();
  };

  initializeRepeatableField();

  const config = repeatableFieldConfigurations.value[fieldName];

  const getRepeatableFieldConfig = (): RepeatableFieldConfig => {
    return repeatableFieldConfigurations.value[fieldName];
  };

  const increaseFieldRepeatAmount = (): void => {
    repeatableFieldConfigurations.value[fieldName].repetitionIds.push(nanoid());
  };

  const decreaseFieldRepeatAmount = (id: string): void => {
    if (!repeatableFieldConfigurations.value[fieldName]) return;
    repeatableFieldConfigurations.value[fieldName].repetitionIds =
      repeatableFieldConfigurations.value[fieldName].repetitionIds.filter(
        (repetitionId) => repetitionId !== id,
      );
  };

  const repetitionIds = computed(() => config.repetitionIds);
  const repeatAmount = computed(() => config.repetitionIds.length);
  const repetitionDeleteIsAvailable = computed(
    () => config.repetitionIds.length > 1,
  );

  const removeRepeatableFieldConfig = (): void => {
    delete repeatableFieldConfigurations.value[fieldName];
  };

  return {
    repetitionIds,
    repeatAmount,
    repetitionDeleteIsAvailable,
    getRepeatableFieldConfig,
    increaseFieldRepeatAmount,
    decreaseFieldRepeatAmount,
    removeRepeatableFieldConfig,
  };
};
