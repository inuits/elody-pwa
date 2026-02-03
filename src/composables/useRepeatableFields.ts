import { computed, type ComputedRef, ref, type Ref } from "vue";
import { type FieldEntry, useFieldArray } from "vee-validate";

export type PanelRepetitionProps = {
  isRepeatable: boolean;
  index: number;
  field: FieldEntry<unknown> | undefined;
  repeatableFieldsHelper: UseRepeatableFields;
};

export type UseRepeatableFields = {
  init: () => void;
  fields: Ref<FieldEntry<unknown>[], FieldEntry<unknown>[]>;
  repeatAmount: ComputedRef<number>;
  repetitionDeleteIsAvailable: ComputedRef<boolean>;
  increaseFieldRepeatAmount: (fieldValue: any) => void;
  decreaseFieldRepeatAmount: (index: number) => void;
  fieldKey: string;
};

export const useRepeatableFields = (fieldKey: string): UseRepeatableFields => {
  const initialized = ref<boolean>(false);

  let fieldArray: ReturnType<typeof useFieldArray> | null = null;

  const init = () => {
    if (initialized.value) return;
    initialized.value = true;

    fieldArray = useFieldArray(`intialValues.repeatable-panels.${fieldKey}`);
    fieldArray.push(undefined);
  };

  const increaseFieldRepeatAmount = (fieldValue: any) => {
    if (!fieldArray) return;
    fieldArray.push(fieldValue);
  };

  const decreaseFieldRepeatAmount = (index: number) => {
    if (!repetitionDeleteIsAvailable.value || !fieldArray) return;
    fieldArray.remove(index);
  };

  const fields = computed(() => fieldArray?.fields.value ?? []);
  const repeatAmount = computed(() => fields.value.length || 1);
  const repetitionDeleteIsAvailable = computed(
    () => repeatAmount.value > 1 || false,
  );

  return {
    init,
    fields,
    repeatAmount,
    repetitionDeleteIsAvailable,
    increaseFieldRepeatAmount,
    decreaseFieldRepeatAmount,
    fieldKey,
  };
};
