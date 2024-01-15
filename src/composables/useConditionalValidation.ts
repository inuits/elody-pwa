import { getValueForPanelMetadata } from "@/helpers";
import { PanelType } from "@/generated-types/queries";

const useConditionalValidation = () => {
  const conditionalFieldIsValid = (
    conditionalFieldKey: string,
    fieldValueToMatch: string,
    formId: string
  ): boolean => {
    let isValid: boolean = false;
    if (!conditionalFieldKey || !fieldValueToMatch || !formId) return isValid;
    try {
      isValid =
        getValueForPanelMetadata(
          PanelType.Metadata,
          conditionalFieldKey,
          formId
        ).toLowerCase() === fieldValueToMatch.toLowerCase();
    } catch (e) {
      return isValid;
    }
    return isValid;
  };

  return { conditionalFieldIsValid };
};

export { useConditionalValidation };
