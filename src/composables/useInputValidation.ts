import { all } from "@vee-validate/rules";
import { localize } from "@vee-validate/i18n";
import { defineRule, configure } from "vee-validate";
import {
  type BaseRelationValuesInput,
  EditStatus,
  ValidationRules,
} from "@/generated-types/queries";
import { DateTime } from "luxon";
import { sanitizeHtml } from "@/helpers";

export const useInputValidation = () => {
  const initializeInputValidation = (translations: {
    [key: string]: any;
  }): void => {
    _defineValidationRules();
    _addCustomValidationRuleTranslations(translations);
  };

  const _defineValidationRules = () => {
    Object.entries(all).forEach(([name, rule]) => {
      defineRule(name, rule);
    });
    defineRule(
      ValidationRules.HasRequiredRelation,
      _getHasSpecificRelationRule,
    );
    defineRule(
      ValidationRules.HasOneOfRequiredRelations,
      _getHasOneOfSpecificRelationsRule,
    );
    defineRule(
      ValidationRules.HasOneOfRequiredMetadata,
      _getHasOneOfSpecificMetadataRule,
    );
    defineRule(ValidationRules.MaxDateToday, _getMaxDateTodayRule);
    defineRule(ValidationRules.ExistingDate, _mustBeExistingDateRule);
    defineRule(ValidationRules.Regex, _regexValidator);
    defineRule(ValidationRules.NoXss, _xssValidator);
  };

  const _addCustomValidationRuleTranslations = (translations: {
    [key: string]: any;
  }): void => {
    const rulesTranslations =
      extractValidationTranslationsFromAllTranslations(translations);
    configure({
      generateMessage: localize(rulesTranslations),
    });
  };

  const extractValidationTranslationsFromAllTranslations = (translations: {
    [key: string]: any;
  }): { [key: string]: any } => {
    const validationTranslations: { [key: string]: any } = {};
    const languageKeysWithValidationTranslations: string[] = Object.keys(
      translations,
    ).filter((languageKey: string) =>
      Object.keys(translations[languageKey]).includes("input-validation"),
    );

    languageKeysWithValidationTranslations.forEach((languageKey: string) => {
      validationTranslations[languageKey] =
        translations[languageKey]["input-validation"];
    });
    return validationTranslations;
  };

  const _getHasSpecificRelationRule = (
    value: BaseRelationValuesInput[],
    parameters: string[],
  ): boolean => {
    if (!Array.isArray(value)) {
      return false;
    }
    const relations = value.filter(
      (relation: BaseRelationValuesInput) =>
        relation.editStatus !== EditStatus.Deleted,
    );
    const [amount = 1, relationType, exact = false] = parameters[0].split(":");
    const specificRelationsLength =
      relations.filter(
        (relation: BaseRelationValuesInput) => relation.type === relationType,
      )?.length || 0;

    if (exact == "true") return specificRelationsLength == Number(amount);
    else return specificRelationsLength >= Number(amount);
  };

  const _getHasOneOfSpecificRelationsRule = (
    value: BaseRelationValuesInput[],
    parameters: string[],
    ctx: any,
  ) => {
    if (!Array.isArray(value)) {
      return false;
    }
    const relationValues = ctx.form.relationValues;
    const [amount = 1, ...relationTypes] = parameters[0].split(":");
    let specificRelationsLength = 0;
    relationTypes.forEach(async (relationType: string) => {
      specificRelationsLength += relationValues[relationType]?.length || 0;
    });
    const isValid = specificRelationsLength >= Number(amount);
    if (isValid) {
      relationTypes.forEach((relationType) => {
        if (relationValues[relationType] === undefined)
          relationValues[relationType] = [];
      });
    }
    return isValid;
  };

  const _getHasOneOfSpecificMetadataRule = (
    value: any,
    parameters: string[],
    ctx: any,
  ) => {
    const intialValues = ctx.form.intialValues;
    const [amount = 1, ...includedMetadataFields] = parameters[0].split(":");
    let filledInMetadataFields = 0;
    includedMetadataFields.forEach(async (metadataField: string) => {
      filledInMetadataFields += intialValues[metadataField]?.length ? 1 : 0;
    });
    return filledInMetadataFields >= Number(amount);
  };

  const _getMaxDateTodayRule = (value: string): string | boolean => {
    if (!value) return true;

    const timestamp = new Date(value).getTime();
    const now = Date.now();
    if (now < timestamp) return "notifications.errors.future-date-error.title";
    return true;
  };

  const _mustBeExistingDateRule = (value: string): boolean | string => {
    if (!value) return true;
    if (!DateTime.fromJSDate(new Date(value)).isValid)
      return "notifications.errors.construct-date-error.title";
    return true;
  };

  const _regexValidator = (
    value: unknown,
    params: [string | RegExp] | { regex: RegExp | string },
  ): boolean => {
    if (_isEmpty(value)) {
      return true;
    }

    let regex = _getSingleParam(params, "regex");
    if (typeof regex === "string") {
      regex = regex.replace(/\?\.c/g, ",").replace(/\?\./g, "|");
      regex = new RegExp(regex);
    }

    if (Array.isArray(value)) {
      return value.every((val) => _regexValidator(val, { regex }));
    }

    return regex.test(String(value));
  };

  const _xssValidator = (value: unknown): boolean => {
    if (typeof value !== "string") return true;

    // If it contains < or > but NOT a real tag, allow it
    const looksLikeTag = /<\s*\/?\s*\w+[^>]*>/.test(value);
    if (!looksLikeTag) return true;

    return sanitizeHtml(value) === value;
  };

  const _getSingleParam = <TParam = unknown>(
    params: [TParam] | Record<string, TParam>,
    paramName: string,
  ) => {
    return Array.isArray(params) ? params[0] : params[paramName];
  };

  const _isEmpty = (value: unknown): boolean => {
    if (value === null || value === undefined || value === "") {
      return true;
    }

    return Array.isArray(value) && value.length === 0;
  };

  const __test__ = {
    _regexValidator,
  };

  return {
    initializeInputValidation,
    extractValidationTranslationsFromAllTranslations,
    __test__,
  };
};
