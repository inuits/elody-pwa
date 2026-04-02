import type { FieldMetadata } from "@/components/metadata/useMetadataWrapper";
import {
  type PanelMetaData,
  ValidationFields,
  ValidationRules,
} from "@/generated-types/queries";
import { useFormHelper } from "@/composables/useFormHelper";
import type { PanelRepetitionProps } from "@/composables/useRepeatableFields";

export type GetVeeValidateKeyParams = {
  metadata: FieldMetadata;
  linkedEntityId?: string;
  isEdit?: boolean;
  repeatablePanelConfig?: PanelRepetitionProps;
};

export type IsValidationRulePresentOnFieldParams = {
  metadata: FieldMetadata;
  rule: ValidationRules | ValidationRules[];
};

export const useVeeValidate = (): {
  getVeeValidateKey: (params: GetVeeValidateKeyParams) => string;
  isValidationRulePresentOnField: (
    params: IsValidationRulePresentOnFieldParams,
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
      return `repeatable-panels.${repeatablePanelConfig.repeatableFieldsHelper.fieldKey}[${repeatablePanelConfig.index}].${baseKey}`;
    }
    if (id) return `${baseKey}-${id}`;
    return `${baseKey}`;
  };

  const isValidationRulePresentOnField = ({
    metadata,
    rule,
  }: IsValidationRulePresentOnFieldParams): boolean => {
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

  const getVeeValidateKey = ({
    metadata,
    linkedEntityId,
    isEdit,
    repeatablePanelConfig,
  }: GetVeeValidateKeyParams): string => {
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
    if (
      isValidationRulePresentOnField({ metadata, rule: ValidationRules.Regex })
    )
      return `${ValidationFields.IntialValues}.${baseFieldKey}`;

    // Needs to be saved as metadata on a relation
    if (fieldKind === "PanelRelationMetaData")
      return `${ValidationFields.RelationMetadata}.${baseFieldKey}`;

    // Needs to be saved as root data on a relation
    if (fieldKind === "PanelRelationRootData")
      return `${ValidationFields.RelationRootdata}.${baseFieldKey}`;

    const requiredRelations = isValidationRulePresentOnField({
      metadata,
      rule: [
        ValidationRules.HasRequiredRelation,
        ValidationRules.HasOneOfRequiredRelations,
      ],
    });

    // Required relations and not edit mode
    if (requiredRelations && !isEdit)
      return `${ValidationFields.IntialValues}.${baseFieldKey}`;

    if (requiredRelations)
      return `${ValidationFields.RelationValues}.${metadata.inputField.relationType}`;

    // If the field has a formatter, we want to validate a label and only in edit mode
    if (metadata.inputField && metadata.value?.formatter && isEdit)
      return `${ValidationFields.IntialValues}.${baseFieldKey}.label`;

    if (metadata.inputField)
    {
      return `${ValidationFields.IntialValues}.${baseFieldKey}`;
      // if (!metadata.inputField?.isMetadataField && metadata.inputField?.relationType) {
      //   console.log("Returning intialValues for :", baseFieldKey)
      //   return `${ValidationFields.RelationValues}.${baseFieldKey}`;
      // }
      // else {
      //   console.log("Returning IntialValues for :", baseFieldKey)
      //   return `${ValidationFields.IntialValues}.${baseFieldKey}`;
      // }
    }

    if (linkedEntityId === undefined)
      return `${ValidationFields.RelationValues}.${baseFieldKey}`;

    return `${ValidationFields.RelatedEntityData}.${baseFieldKey}`;
  };

  return { getVeeValidateKey, isValidationRulePresentOnField };
};
