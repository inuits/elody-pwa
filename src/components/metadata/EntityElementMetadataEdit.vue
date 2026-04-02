<template>
  <div>
    <ViewModesAutocompleteRelations
      v-if="
        (field.type === InputFieldTypes.DropdownMultiselectRelations ||
          field.type === InputFieldTypes.DropdownSingleselectRelations) &&
        !hiddenField?.inherited
      "
      v-model="metadataValue"
      :metadata-key-to-get-options-for="metadataKeyToGetOptionsFor"
      :select-type="
        field.type === InputFieldTypes.DropdownSingleselectRelations
          ? 'single'
          : 'multi'
      "
      :relation-type="field.relationType"
      :from-relation-type="field.fromRelationType"
      :advanced-filter-input-for-retrieving-options="
        field.advancedFilterInputForRetrievingOptions
      "
      :advanced-filter-input-for-retrieving-related-options="
        field.advancedFilterInputForRetrievingRelatedOptions
      "
      :advanced-filter-input-for-retrieving-all-options="
        field.advancedFilterInputForRetrievingAllOptions
      "
      :advanced-filter-input-for-searching-options="
        field.advancedFilterInputForSearchingOptions
      "
      :is-metadata-field="field.isMetadataField"
      :relation-filter="relationFilter"
      :mode="formFlow"
      :form-id="formId"
      :auto-selectable="field.autoSelectable"
      :disabled="field.disabled"
      :canCreateOption="field.canCreateEntityFromOption"
      :metadataKeyToCreateEntityFromOption="
        field.metadataKeyToCreateEntityFromOption
      "
      :depends-on="field.dependsOn"
      :metadataOnRelationConfig="field?.metadataOnRelationFieldConfig"
    />
    <ViewModesAutocompleteMetadata
      v-else-if="
        field?.type === InputFieldTypes.DropdownMultiselectMetadata ||
        field?.type === InputFieldTypes.DropdownSingleselectMetadata
      "
      v-model:model-value="metadataValue"
      :metadata-dropdown-options="field.options"
      :formId="formId"
      :canCreateOption="field.canCreateEntityFromOption"
      :select-type="
        field.type === InputFieldTypes.DropdownSingleselectMetadata
          ? 'single'
          : 'multi'
      "
      :disabled="field.disabled"
      mode="edit"
    />
    <AdvancedDropdown
      v-else-if="field.type === InputFieldTypes.Dropdown"
      v-model:model-value="metadataValue"
      :options="field.options as DropdownOption[]"
      :clearable="!isFieldRequired"
      :multiple="field.multiple || false"
      :disable="fieldEditIsDisabled"
      :show-menu-header="false"
      style-type="defaultWithBorder"
    />
    <TableInputField
      v-else-if="field.type === InputFieldTypes.InputFieldWithSubFields"
      v-model:model-value="metadataValue"
      :is-flow-relation-values="!field.isMetadataField && field.relationType !== undefined"
      :sub-fields="(field as any).subFields ?? []"
      :form-id="formId"
      :parent-field-key="fieldKey"
      :relation-type="field.relationType"
      :disabled="fieldEditIsDisabled"
    />
    <div v-else :class="[{ 'grid grid-cols-[80%_20%]': enableCopyFromParent }]">
      <BaseInputTextNumberDatetime
        :name="fieldKey"
        v-model:model-value="metadataValue"
        :type="field.type as any"
        input-style="defaultWithBorder"
        :disabled="fieldEditIsDisabled"
      />
      <base-button-new
        v-if="enableCopyFromParent"
        class="ml-1"
        :label="t(copyValueFromParent.label)"
        button-style="accentAccent"
        button-size="small"
        @click="() => copyValueFromParentAction(copyValueFromParent.key)"
      />
    </div>
    <div v-if="showErrors && !fieldIsValid" class="text-red-default">
      <p>
        {{ computedError }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  type AdvancedFilterInput,
  type Conditional,
  type CopyValueFromParentIntialValues,
  type DropdownOption,
  type HiddenField,
  type BaseRelationValuesInput,
  type InputField as InputFieldType,
  InputFieldTypes,
} from "@/generated-types/queries";
import { useDefaultValue } from "@/components/metadata/useDefaultValue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import ViewModesAutocompleteRelations from "@/components/library/view-modes/ViewModesAutocompleteRelations.vue";
import { addCurrentTimeZoneToDateTimeString, isDateTime } from "@/helpers";
import { computed, inject, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import ViewModesAutocompleteMetadata from "@/components/library/view-modes/ViewModesAutocompleteMetadata.vue";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import TableInputField from "@/components/base/TableInputField.vue";
import type { PanelRepetitionProps } from "@/composables/useRepeatableFields";
import { useHiddenField } from "@/components/metadata/useHiddenField";
import { useConditionalValidation } from "@/composables/useConditionalValidation";
import { useFormHelper } from "@/composables/useFormHelper";

const emit = defineEmits(["update:value"]);
const { t } = useI18n();

const props = defineProps<{
  fieldKey: string;
  label: string;
  value: string;
  hiddenField?: HiddenField;
  field: InputFieldType;
  formId: string;
  relationFilter?: AdvancedFilterInput;
  unit?: string;
  linkText?: string;
  isMetadataOnRelation?: boolean;
  isRootDataOnRelation?: boolean;
  error?: string;
  showErrors: boolean;
  fieldIsValid: boolean;
  formFlow?: string;
  isFieldRequired: boolean;
  copyValueFromParent: CopyValueFromParentIntialValues;
  extractValueFromParent: (
    key: string,
  ) => string | string[] | number | number[] | undefined;
  repeatablePanelConfig?: PanelRepetitionProps;
  disabled?: boolean;
  defaultValue?: string;
}>();

const mediafileViewerContext: any = inject("mediafileViewerContext");
const computedError = computed<string>(() => {
  const fastValidationMessage = props.field?.validation
    ?.fastValidationMessage as string;
  if (fastValidationMessage) return t(fastValidationMessage);

  if (props.error) return t(props.error);
  return "";
});

const { addEditableMetadataKeys } = useFormHelper();
const metadataValue = computed<string | string[] | number | number[] | object>({
  get() {
    if (typeof props.value === "object" && props.value?.formatter) {
      if (props.value?.formatter.startsWith("pill")) {
        return props.value.label;
      } else {
        return props.value;
      }
    } else {
      return props.value;
    }
  },
  set(newValue) {
    let valueFromMetadata = getValueFromMetadata(newValue);
    if (
      typeof props.value === "object" &&
      props.value?.formatter?.startsWith("pill")
    ) {
      valueFromMetadata = {
        ...props.value,
        label: valueFromMetadata as string,
      };
    }
    emit("update:value", valueFromMetadata);
  },
});
const { conditionalFieldIsAvailable } = useConditionalValidation();

const onUpdate = (newValue?: BaseRelationValuesInput[] | string) =>
  emit("update:value", newValue);

const hiddenFieldRef = computed(() => props.hiddenField);
const fieldRef = computed(() => props.field);
useHiddenField(
  hiddenFieldRef,
  fieldRef,
  computed(() => props.formId),
  onUpdate,
);

useDefaultValue({ defaultValue: props.defaultValue, onUpdate });

const fieldEditIsDisabled = computed(() => {
  if (
    props.field.type === InputFieldTypes.Dropdown &&
    !props.field.options?.length
  )
    return true;

  if (props.disabled) return true;

  if (!props.field.validation || !props.field.validation.available_if)
    return false;

  return !conditionalFieldIsAvailable(
    props.field?.validation?.available_if as Conditional,
    props.formId,
    mediafileViewerContext,
  );
});

const enableCopyFromParent = computed(() => {
  if (
    !props.copyValueFromParent ||
    !props.extractValueFromParent ||
    !props.copyValueFromParent.label
  )
    return false;
  const value = props.extractValueFromParent(props.copyValueFromParent?.key);
  return !(!value || value == "");
});

onMounted(() => {
  if (props.isMetadataOnRelation || props.isRootDataOnRelation)
    addEditableMetadataKeys([props.fieldKey], props.formId);
  if (props.copyValueFromParent?.autoCopy)
    copyValueFromParentAction(props.copyValueFromParent.key);
});

const getValueFromMetadata = (
  newValue: any,
): string | BaseRelationValuesInput[] => {
  if (Array.isArray(newValue)) {
    const returnArray = [];
    newValue.forEach((metadataItem) => {
      if (isDateTime(metadataItem)) {
        returnArray.push(addCurrentTimeZoneToDateTimeString(metadataItem));
      } else returnArray.push(metadataItem);
    });
    return returnArray;
  }
  if (typeof newValue !== "object") {
    if (isDateTime(newValue)) {
      return addCurrentTimeZoneToDateTimeString(newValue);
    }
    return newValue;
  }
  return newValue.value;
};

const metadataKeyToGetOptionsFor = computed(() => {
  const field = props.field;
  if (field.entityType) return field.entityType;

  return field.advancedFilterInputForSearchingOptions?.item_types
    ? field.advancedFilterInputForSearchingOptions?.item_types[0]
    : props.fieldKey;
});

const copyValueFromParentAction = (key: string) => {
  const newValue = props.extractValueFromParent(key);
  if (!newValue) return;
  metadataValue.value = newValue;
};

</script>
