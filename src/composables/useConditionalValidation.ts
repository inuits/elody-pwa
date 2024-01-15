import { getValueForPanelMetadata } from "@/helpers";
import { type ConditionalRequired, PanelType } from "@/generated-types/queries";

const useConditionalValidation = () => {
  const conditionalFieldIsValid = (
    requireIf: ConditionalRequired,
    formId: string
  ): boolean => {
    let isValid: boolean = false;
    if (!formId || !requireIf.field) return isValid;
    try {
      const fieldValue: string = getValueForPanelMetadata(
        PanelType.Metadata,
        requireIf.field,
        formId
      ).toLowerCase();

      if (requireIf.ifAnyValue === true && fieldValue.length) return true;

      if (!requireIf.value) return isValid;

      isValid = fieldValue === requireIf.value.toLowerCase();
    } catch (e) {
      return isValid;
    }
    return isValid;
  };

  return { conditionalFieldIsValid };
};

export { useConditionalValidation };
