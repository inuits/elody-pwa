import { ValidationRules, type Validation } from "@/generated-types/queries";
import { toArray } from "@/helpers";

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

const isRulePresent = (
  validation: Validation | null | undefined,
  rule: ValidationRules | ValidationRules[],
): boolean => {
  try {
    const value = String(validation?.value);
    if (Array.isArray(rule)) {
      return rule.some((r) => value.includes(r));
    }
    return value.includes(rule);
  } catch {
    return false;
  }
};

export const useFieldValidation = (
  getValidation: () => Validation | null | undefined,
): {
  getValidationRules: (isEdit: boolean, isFieldRequired: boolean) => string;
} => {
  const getValidationRules = (
    isEdit: boolean,
    isFieldRequired: boolean,
  ): string => {
    let defaultRules = "no_xss";
    const validationOnField = getValidation() ?? undefined;

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

    if (isRulePresent(validationOnField, ValidationRules.Regex)) {
      const cleanedRegex = cleanRegexValue(validationOnField.regex || "");
      return `${defaultRules}|${ValidationRules.Regex}:${cleanedRegex}`;
    }

    if (
      isRulePresent(validationOnField, [
        ValidationRules.HasRequiredRelation,
        ValidationRules.HasOneOfRequiredRelations,
      ]) &&
      !isEdit
    )
      return `${defaultRules}|required`;

    if (isRulePresent(validationOnField, ValidationRules.HasRequiredRelation)) {
      const {
        relationType,
        amount,
        exact = false,
      } = validationOnField.has_required_relation ?? {};
      return `${defaultRules}:${amount}:${relationType}:${exact}`;
    }

    if (
      isRulePresent(validationOnField, ValidationRules.HasOneOfRequiredRelations)
    ) {
      const { relationTypes = [], amount } =
        validationOnField.has_one_of_required_relations ?? {};
      return `${defaultRules}:${amount}:${relationTypes.join(":")}`;
    }

    if (
      isRulePresent(validationOnField, ValidationRules.HasOneOfRequiredMetadata)
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
