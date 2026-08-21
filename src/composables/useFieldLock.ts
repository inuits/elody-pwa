import { computed, type ComputedRef } from "vue";
import { useFormHelper } from "@/composables/useFormHelper";

export const useFieldLock = (
  formId: () => string | undefined,
  key: () => string | undefined,
): { isLocked: ComputedRef<boolean> } => {
  const { getForm } = useFormHelper();

  const isLocked = computed<boolean>(() => {
    const fieldKey = key();
    if (!fieldKey) return false;

    const lockedProperties =
      getForm(formId())?.values?.intialValues?.lockedProperties ?? [];
    return lockedProperties.includes(fieldKey);
  });

  return { isLocked };
};
