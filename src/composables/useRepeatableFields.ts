import { ref } from "vue";

type RepeatableFieldConfig = {
  repeatAmount: number;
};

const baseRepeatableFieldConfig: RepeatableFieldConfig = {
  repeatAmount: 1,
};

const repeatableFieldConfigurations = ref<{
  [key: string]: RepeatableFieldConfig;
}>({});

export type UseRepeatableFields = {
  getRepeatableFieldConfig: () => RepeatableFieldConfig;
  increaseFieldRepeatAmount: () => void;
  decreaseFieldRepeatAmount: () => void;
};

export const useRepeatableFields = (fieldName: string): UseRepeatableFields => {
  const initializeRepeatableField = (): void => {
    if (repeatableFieldConfigurations.value[fieldName]) return;
    else
      repeatableFieldConfigurations.value[fieldName] =
        baseRepeatableFieldConfig;
  };

  initializeRepeatableField();

  const getRepeatableFieldConfig = (): RepeatableFieldConfig => {
    return repeatableFieldConfigurations.value[fieldName];
  };

  const increaseFieldRepeatAmount = (): void => {
    repeatableFieldConfigurations.value[fieldName].repeatAmount++;
  };

  const decreaseFieldRepeatAmount = (): void => {
    repeatableFieldConfigurations.value[fieldName].repeatAmount--;
  };

  return {
    getRepeatableFieldConfig,
    increaseFieldRepeatAmount,
    decreaseFieldRepeatAmount,
  };
};
