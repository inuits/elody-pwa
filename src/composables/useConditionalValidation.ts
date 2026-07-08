import { getValueForPanelMetadata } from "@/helpers";
import {
  type Conditional,
  PanelType,
  type VisibleIf,
} from "@/generated-types/queries";

const useConditionalValidation = () => {
  const conditionalFieldIsAvailable = (
    availableIf: Conditional,
    formId: string,
    mediafileViewerContext: string,
  ): boolean => {
    let isValid: boolean = false;
    if (!formId || !availableIf.field) return isValid;
    try {
      const fieldValue: string = getValueForPanelMetadata(
        PanelType.Metadata,
        availableIf.field,
        formId,
        mediafileViewerContext,
      ).toLowerCase();

      if (availableIf.ifAnyValue && fieldValue.length) return true;

      if (!availableIf.value) return isValid;

      isValid = fieldValue === availableIf.value.toLowerCase();
    } catch {
      return isValid;
    }
    return isValid;
  };

  const conditionalFieldIsRequired = (
    requiredIf: Conditional,
    formId: string,
    mediafileViewerContext: string,
  ): boolean => {
    let isValid: boolean = false;
    if (!formId || !requiredIf.field) return isValid;
    try {
      const fieldValue: string = getValueForPanelMetadata(
        PanelType.Metadata,
        requiredIf.field,
        formId,
        mediafileViewerContext,
      ).toLowerCase();

      if (requiredIf.ifAnyValue && fieldValue.length) return true;

      if (!requiredIf.value) return isValid;

      isValid = fieldValue === requiredIf.value.toLowerCase();
    } catch {
      return isValid;
    }
    return isValid;
  };

  // Returns true when the field configured with `visibleIf` should be shown.
  // The field is visible iff the initialValues entry named by `visibleIf.dependsOn`
  // currently holds one of the allowed `visibleIf.values`. When `visibleIf` is
  // absent, the field is always visible (backward-compatible default).
  const fieldIsVisibleByCondition = (
    visibleIf: VisibleIf | null | undefined,
    formId: string,
    mediafileViewerContext: string,
  ): boolean => {
    if (!visibleIf) return true;
    if (!formId || !visibleIf.dependsOn) return true;

    let currentValue: unknown;
    try {
      currentValue = getValueForPanelMetadata(
        PanelType.Metadata,
        visibleIf.dependsOn,
        formId,
        mediafileViewerContext,
      );
    } catch {
      return false;
    }

    if (currentValue === undefined || currentValue === null) return false;
    return (visibleIf.values ?? []).includes(String(currentValue));
  };

  return {
    conditionalFieldIsAvailable,
    conditionalFieldIsRequired,
    fieldIsVisibleByCondition,
  };
};

export { useConditionalValidation };
