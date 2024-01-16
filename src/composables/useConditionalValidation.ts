import { getValueForPanelMetadata } from "@/helpers";
import { type Conditional, PanelType } from "@/generated-types/queries";

const useConditionalValidation = () => {
  const conditionalFieldIsAvailable = (
    availableIf: Conditional,
    formId: string
  ): boolean => {
    let isValid: boolean = false;
    if (!formId || !availableIf.field) return isValid;
    try {
      const fieldValue: string = getValueForPanelMetadata(
        PanelType.Metadata,
        availableIf.field,
        formId
      ).toLowerCase();

      if (availableIf.ifAnyValue && fieldValue.length) return true;

      if (!availableIf.value) return isValid;

      isValid = fieldValue === availableIf.value.toLowerCase();
    } catch (e) {
      return isValid;
    }
    return isValid;
  };

  return { conditionalFieldIsAvailable };
};

export { useConditionalValidation };
