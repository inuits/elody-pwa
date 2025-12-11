import type { FieldMetadata } from "@/components/metadata/useMetadataWrapper";
import { useVeeValidate } from "./useVeeValidate";
import { ValidationRules } from "@/generated-types/queries";
import { toArray } from "@/helpers";

const { isValidationRulePresentOnField } = useVeeValidate();

const unescapeString = (str: string | undefined): string => {
  if (!str) return "";
  return str.replace(/\\\\/g, "\\");
};

const cleanRegexValue = (regex: string): string => {
  const rawRegex = regex.replace(/^\/|\/$/g, "") ?? "";
  const cleanedRegex = unescapeString(rawRegex.replace(/\|/g, "?.")).replace(
    /,/g,
    "?.c",
  );
  return cleanedRegex;
};

export const useFieldValidation = (
  field: FieldMetadata,
): {
  getValidationRules: (isEdit: boolean, isFieldRequired: boolean) => string;
} => {
  const getValidationRules = (
    isEdit: boolean,
    isFieldRequired: boolean,
  ): string => {
    let defaultRules = "no_xss";
    const validationOnField = field.inputField?.validation || undefined;

    if (!validationOnField) return defaultRules;

    const validationValue: ValidationRules[] = toArray<ValidationRules>(
      validationOnField.value || undefined,
    );

    if (validationValue) {
      if (validationValue.includes(ValidationRules.CustomValue)) {
        if (!validationOnField.customValue)
          throw Error("Please define a 'customValue' when using CustomValue");
        return validationOnField.customValue;
      } else defaultRules += `|${validationValue.join("|")}`;
    }

    if (isValidationRulePresentOnField(field, ValidationRules.Regex)) {
      const cleanedRegex = cleanRegexValue(validationOnField.regex || "");
      return `${defaultRules}|${ValidationRules.Regex}:${cleanedRegex}`;
    }

    if (
      isValidationRulePresentOnField(field, [
        ValidationRules.HasRequiredRelation,
        ValidationRules.HasOneOfRequiredRelations,
      ]) &&
      !isEdit
    )
      return `${defaultRules}|required`;

    if (
      isValidationRulePresentOnField(field, ValidationRules.HasRequiredRelation)
    ) {
      const {
        relationType,
        amount,
        exact = false,
      } = validationOnField.has_required_relation ?? {};
      return `${defaultRules}:${amount}:${relationType}:${exact}`;
    }

    if (
      isValidationRulePresentOnField(
        field,
        ValidationRules.HasOneOfRequiredRelations,
      )
    ) {
      const { relationTypes = [], amount } =
        validationOnField.has_one_of_required_relations ?? {};
      return `${defaultRules}:${amount}:${relationTypes.join(":")}`;
    }

    if (
      isValidationRulePresentOnField(
        field,
        ValidationRules.HasOneOfRequiredMetadata,
      )
    ) {
      const { includedMetadataFields = [], amount } =
        validationOnField.has_one_of_required_metadata ?? {};
      return `${defaultRules}:${amount}:${includedMetadataFields.join(":")}|no_xss`;
    }

    if (isFieldRequired) {
      if (defaultRules.includes(ValidationRules.Required)) return defaultRules;
      return `${defaultRules}|required`;
    }

    return defaultRules;
  };

  return { getValidationRules };
};
