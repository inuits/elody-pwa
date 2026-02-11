import {
  computed,
  type ComputedRef,
  onMounted,
  ref,
  type Ref,
  watch,
} from "vue";
import { type FieldEntry, useFieldArray, useForm } from "vee-validate";
import { useFormHelper } from "@/composables/useFormHelper";

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

export const useRepeatableFields = (
  fieldKey: string,
  formId: string,
): UseRepeatableFields => {
  const initialized = ref<boolean>(false);
  const initRepeatAmount = ref<number>(1);

  const fieldArray = ref<ReturnType<typeof useFieldArray> | undefined>(
    undefined,
  );

  const { getForm, addEditableMetadataKeys } = useFormHelper();

  const setInitRepeatAmount = (): void => {
    const form = getForm(formId);

    if (!form) throw new Error(`Form with id ${formId} not found`);

    const formValues = form.values;
    initRepeatAmount.value = formValues?.intialValues?.[fieldKey]?.length || 1;
  };

  const init = () => {
    if (initialized.value) return;
    initialized.value = true;
    setInitRepeatAmount();
    addEditableMetadataKeys([fieldKey], formId)

    fieldArray.value = useFieldArray(
      `intialValues.repeatable-panels.${fieldKey}`,
    );

    for (let i = 0; i < initRepeatAmount.value; i++) {
      fieldArray.value?.push(undefined);
    }
  };

  const increaseFieldRepeatAmount = (fieldValue: any) => {
    if (!fieldArray.value) return;
    fieldArray.value.push(fieldValue);
  };

  const decreaseFieldRepeatAmount = (index: number) => {
    if (!repetitionDeleteIsAvailable.value || !fieldArray.value) return;
    fieldArray.value.remove(index);
  };

  const fields = computed(() => fieldArray.value?.fields ?? []);
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
