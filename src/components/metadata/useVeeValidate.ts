import type { FieldMetadata } from "@/components/metadata/useMetadataWrapper";
import {
  type PanelMetaData,
  ValidationFields,
  ValidationRules,
} from "@/generated-types/queries";
import { useFormHelper } from "@/composables/useFormHelper";
import type { PanelRepetitionProps } from "@/composables/useRepeatableFields";

export const useVeeValidate = (): {
  getVeeValidateKey: (
    metadata: FieldMetadata,
    linkedEntityId: string | undefined,
    isEdit: boolean | undefined,
    repeatablePanelConfig: PanelRepetitionProps | undefined,
  ) => string;
  isValidationRulePresentOnField: (
    metadata: FieldMetadata,
    rule: ValidationRules | ValidationRules[],
  ) => boolean;
} => {
  const getBaseKey = (
    metadata: PanelMetaData,
    repeatablePanelConfig: PanelRepetitionProps | undefined,
    id: string | undefined,
  ): string => {
    const { getKeyBasedOnInputField } = useFormHelper();
    const baseKey: string = getKeyBasedOnInputField(metadata);
    if (!id && !repeatablePanelConfig?.isRepeatable) return baseKey;
    if (repeatablePanelConfig?.isRepeatable) {
      return `repeatable-panels.${repeatablePanelConfig.repeatableFieldsHelper.fieldKey}.${repeatablePanelConfig.index}.${baseKey}`;
    }
    if (id) return `${baseKey}-${id}`;
    return `${baseKey}`;
  };

  const isValidationRulePresentOnField = (
    metadata: FieldMetadata,
    rule: ValidationRules | ValidationRules[],
  ): boolean => {
    try {
      if (Array.isArray(rule)) {
        const test = rule.map((item) =>
          String(metadata.inputField.validation?.value).includes(item),
        );
        return test.some((item) => item);
      }
      return String(metadata.inputField.validation?.value).includes(rule);
    } catch {
      return false;
    }
  };

  const getVeeValidateKey = (
    metadata: FieldMetadata,
    linkedEntityId: string | undefined = undefined,
    isEdit: boolean | undefined = undefined,
    repeatablePanelConfig: RepeatablePanelConfig | undefined = undefined,
  ): string => {
    const fieldKind:
      | "PanelMetaData"
      | "PanelRelationMetaData"
      | "PanelRelationRootData"
      | undefined = metadata.__typename;
    const baseFieldKey = getBaseKey(
      metadata as PanelMetaData,
      repeatablePanelConfig,
      linkedEntityId,
    );

    if (!metadata.inputField && !linkedEntityId)
      return `${ValidationFields.IntialValues}.${baseFieldKey}`;

    // Todo: Does this regex field really need 'special treatment'?
    if (isValidationRulePresentOnField(metadata, ValidationRules.Regex))
      return `${ValidationFields.IntialValues}.${baseFieldKey}`;

    // Needs to be saved as metadata on a relation
    if (fieldKind === "PanelRelationMetaData")
      return `${ValidationFields.RelationMetadata}.${baseFieldKey}`;

    // Needs to be saved as root data on a relation
    if (fieldKind === "PanelRelationRootData")
      return `${ValidationFields.RelationRootdata}.${baseFieldKey}`;

    const requiredRelations = isValidationRulePresentOnField(metadata, [
      ValidationRules.HasRequiredRelation,
      ValidationRules.HasOneOfRequiredRelations,
    ]);

    // Required relations and not edit mode
    if (requiredRelations && !isEdit)
      return `${ValidationFields.IntialValues}.${baseFieldKey}`;

    if (requiredRelations)
      return `${ValidationFields.RelationValues}.${metadata.inputField.relationType}`;

    if (metadata.inputField)
      return `${ValidationFields.IntialValues}.${baseFieldKey}`;

    if (linkedEntityId === undefined)
      return `${ValidationFields.RelationValues}.${baseFieldKey}`;

    return `${ValidationFields.RelatedEntityData}.${baseFieldKey}`;
  };

  return { getVeeValidateKey, isValidationRulePresentOnField };
};
