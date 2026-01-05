import { ref } from "vue";
import { nanoid } from "nanoid";

type BaseRepeatableFieldConfig = {
  repeatAmount: number;
};

type RepeatableFieldConfig = BaseRepeatableFieldConfig & { id: string };

const baseRepeatableFieldConfig: BaseRepeatableFieldConfig = {
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
      repeatableFieldConfigurations.value[fieldName] = {
        id: nanoid(),
        ...baseRepeatableFieldConfig,
      };
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
