import type { MetadataWrapperProps } from "@/components/metadata/MetadataWrapper.vue";
import {
  type FieldContext,
  type FormContext,
  useField,
  useForm,
} from "vee-validate";
import { computed, inject, type Ref, watch, type ComputedRef } from "vue";
import {
  InputFieldTypes,
  type PanelMetaData,
  type PanelRelationMetaData,
  type PanelRelationRootData,
  ValidationRules,
} from "@/generated-types/queries";
import { DateTime } from "luxon";
import { useConditionalValidation } from "@/composables/useConditionalValidation";
import { useVeeValidate } from "@/components/metadata/useVeeValidate";
import { useFieldValidation } from "@/components/metadata/useFieldValidation";
import { usePermissions } from "@/composables/usePermissions";
import { getTranslatedMessage } from "@/helpers";

export type FieldMetadata =
  | PanelMetaData
  | PanelRelationMetaData
  | PanelRelationRootData;

const checkIfFieldIsRequired = (
  fieldMetadata: FieldMetadata,
  formId: string,
): boolean => {
  const { conditionalFieldIsRequired } = useConditionalValidation();
  const mediafileViewerContext: any = inject("mediafileViewerContext");

  const validationRulesToCheckAgainst = [
    ValidationRules.Required,
    ValidationRules.HasRequiredRelation,
    ValidationRules.HasOneOfRequiredRelations,
  ];

  if (!fieldMetadata.inputField || !fieldMetadata.inputField.validation)
    return false;

  validationRulesToCheckAgainst.forEach((validationRule) => {
    if (String(fieldMetadata.inputField.validation).includes(validationRule))
      return true;
  });

  if (fieldMetadata.inputField.validation.required_if)
    return conditionalFieldIsRequired(
      fieldMetadata.inputField.validation.required_if,
      formId,
      mediafileViewerContext,
    );

  return false;
};

export const useMetadataWrapper = (
  props: MetadataWrapperProps,
): {
  getFieldKey: () => string;
  field: FieldContext;
  fieldKey: ComputedRef<string>;
  fieldKind: ComputedRef<string>;
  fieldType: ComputedRef<InputFieldTypes | undefined>;
  fieldLabel: ComputedRef<string>;
  isFieldValid: ComputedRef<boolean>;
  isFieldRequired: ComputedRef<boolean>;
  fieldValidationRules: ComputedRef<string>;
  fieldIsPermittedToBeSeenByUser: ComputedRef<boolean>;
  fieldValueProxy: ComputedRef<any>;
  setNewFieldValue: (newValue: any) => void;
} => {
  // Todo: Need to have a look if I really need a proxy for props.metadata, to set the value again, I think only setting the vee-validate will do

  const getFieldKey = (): string => {
    const { getVeeValidateKey } = useVeeValidate();
    return getVeeValidateKey(
      props.metadata,
      props.linkedEntityId,
      props.isEdit,
    );
  };

  const getFieldPermissions = (): boolean => {
    const { fetchAdvancedPermission } = usePermissions();
    const permissions = props.metadata.can;
    const hasPermissionsToCheck = permissions && permissions?.length > 0;

    if (!hasPermissionsToCheck) {
      return true;
    }
    return fetchAdvancedPermission(permissions) as boolean;
  };

  const { getValidationRules } = useFieldValidation(props.metadata);
  const { setExtraVariables } = usePermissions();

  const fieldKey = computed(() => getFieldKey());
  const field: FieldContext = useField<MetadataWrapperProps>(fieldKey.value);
  const fieldLabel = computed<string>(() =>
    getTranslatedMessage(props.metadata.label as string | "metadata.no-label"),
  );
  const fieldType = computed<InputFieldTypes | undefined>(
    () => props.metadata.inputField?.type as InputFieldTypes,
  );
  const fieldKind = computed<string>(() => props.metadata.__typename as string);
  const fieldTooltipValue = computed<any>(() => fieldValueProxy.value);
  const isFieldValid = computed<boolean>(() => field.meta.valid);
  const isFieldRequired = computed<boolean>(() =>
    checkIfFieldIsRequired(props.metadata, props.formId),
  );
  const fieldValidationRules = computed<string>(() =>
    getValidationRules(props.isEdit, isFieldRequired.value),
  );
  const fieldIsPermittedToBeSeenByUser = computed<boolean>(() =>
    getFieldPermissions(),
  );

  const fieldValueProxy = computed({
    get: () => field.value.value,
    set: (val) => (field.value.value = val),
  });

  const setNewFieldValue = (newValue: any): void => {
    if (fieldType.value === InputFieldTypes.Date) {
      const parsedDate = DateTime.fromISO(newValue);
      if (parsedDate.isValid)
        fieldValueProxy.value = parsedDate.toFormat("yyyy-MM-dd");
    } else {
      fieldValueProxy.value = newValue;
    }
    // Todo: Is it possible to just use the setter of fieldValueProxy instead of the form
    // if (!form) return;
    //
    // form.setFieldValue(veeValidateField.value, value.value);
  };

  watch(
    () => props.formId,
    () =>
      setExtraVariables({
        parentEntityId: props.formId,
        childEntityId: "",
      }),
  );

  return {
    getFieldKey,
    field,
    fieldKey,
    fieldKind,
    fieldType,
    fieldLabel,
    isFieldValid,
    isFieldRequired,
    fieldValidationRules,
    fieldIsPermittedToBeSeenByUser,
    fieldValueProxy,
    setNewFieldValue,
  };
};
