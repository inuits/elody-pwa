import type { FieldMetadata } from "@/components/metadata/useMetadataWrapper";
import {
  type PanelMetaData,
  ValidationFields,
  ValidationRules,
} from "@/generated-types/queries";
import { useFormHelper } from "@/composables/useFormHelper";

export const useVeeValidate = (): {
  getVeeValidateKey: (
    metadata: FieldMetadata,
    linkedEntityId: string | undefined,
    isEdit: boolean | undefined,
  ) => string;
  isValidationRulePresentOnField: (
    metadata: FieldMetadata,
    rule: ValidationRules | ValidationRules[],
  ) => boolean;
} => {
  const getKeyWithId = (key: string, id: string | undefined): string => {
    if (!id) return key;
    return `${key}-${id}`;
  };

  const isValidationRulePresentOnField = (
    metadata: FieldMetadata,
    rule: ValidationRules | ValidationRules[],
  ): boolean => {
    try {
      if (Array.isArray(rule)) {
        const test = rule.map((item) =>
          String(metadata.inputField.validation).includes(item),
        );
        return test.some((item) => item);
      }
      return String(metadata.inputField.validation).includes(rule);
    } catch {
      return false;
    }
  };

  const getVeeValidateKey = (
    metadata: FieldMetadata,
    linkedEntityId: string | undefined = undefined,
    isEdit: boolean | undefined = undefined,
  ): string => {
    const fieldKind:
      | "PanelMetaData"
      | "PanelRelationMetaData"
      | "PanelRelationRootData"
      | undefined = metadata.__typename;
    const fieldKeyWithId = getKeyWithId(metadata.key, linkedEntityId);
    const { getKeyBasedOnInputField } = useFormHelper();

    if (!metadata.inputField && !linkedEntityId)
      return `${ValidationFields.IntialValues}.${fieldKeyWithId}`;

    // Todo: Does this regex field really need 'special treatment'?
    if (isValidationRulePresentOnField(metadata, ValidationRules.Regex))
      return `${ValidationFields.IntialValues}.${fieldKeyWithId}`;

    // Needs to be saved as metadata on a relation
    if (fieldKind === "PanelRelationMetaData")
      return `${ValidationFields.RelationMetadata}.${fieldKeyWithId}`;

    // Needs to be saved as root data on a relation
    if (fieldKind === "PanelRelationRootData")
      return `${ValidationFields.RelationRootdata}.${fieldKeyWithId}`;

    const requiredRelations = isValidationRulePresentOnField(metadata, [
      ValidationRules.HasRequiredRelation,
      ValidationRules.HasOneOfRequiredRelations,
    ]);

    // Required relations and not edit mode
    if (requiredRelations && !isEdit)
      return `${ValidationFields.IntialValues}.${getKeyBasedOnInputField(metadata as PanelMetaData)}`;

    if (requiredRelations)
      return `${ValidationFields.RelationValues}.${metadata.inputField.relationType}`;

    if (metadata.inputField)
      return `${ValidationFields.IntialValues}.${getKeyBasedOnInputField(metadata as PanelMetaData)}`;

    if (linkedEntityId === undefined)
      return `${ValidationFields.RelationValues}.${metadata.key}`;

    return `${ValidationFields.RelatedEntityData}.${fieldKeyWithId}`;
  };

  return { getVeeValidateKey, isValidationRulePresentOnField };
};
