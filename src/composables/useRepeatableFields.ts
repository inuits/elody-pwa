import { computed, type ComputedRef, onMounted, type Ref } from "vue";
import { type FieldEntry, useFieldArray } from "vee-validate";

export type PanelRepetitionProps = {
  isRepeatable: boolean;
  index: number;
  field: FieldEntry<unknown>;
  repeatableFieldsHelper: UseRepeatableFields;
};

export type UseRepeatableFields = {
  fields: Ref<FieldEntry<unknown>[], FieldEntry<unknown>[]>;
  repetitionIds: ComputedRef<(string | number)[]>;
  repeatAmount: ComputedRef<number>;
  repetitionDeleteIsAvailable: ComputedRef<boolean>;
  increaseFieldRepeatAmount: (fieldValue: any) => void;
  decreaseFieldRepeatAmount: (index: number) => void;
};

export const useRepeatableFields = (
  fieldKey: string,
  value: any = undefined,
): UseRepeatableFields => {
  const { fields, push, remove } = useFieldArray(fieldKey);

  const increaseFieldRepeatAmount = (fieldValue: any) => {
    push(fieldValue);
  };

  const decreaseFieldRepeatAmount = (index: number) => {
    if (repetitionDeleteIsAvailable.value) {
      remove(index);
    }
  };

  const repetitionIds = computed(() => fields.value.map((field) => field.key));
  const repeatAmount = computed(() => fields.value.length);
  const repetitionDeleteIsAvailable = computed(() => fields.value.length > 1);

  onMounted(() => increaseFieldRepeatAmount(value));

  return {
    fields,
    repetitionIds,
    repeatAmount,
    repetitionDeleteIsAvailable,
    increaseFieldRepeatAmount,
    decreaseFieldRepeatAmount,
  };
};
