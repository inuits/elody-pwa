<template>
  <div>
    <ViewModesAutocomplete
      v-if="
        field.type === InputFieldTypes.DropdownMultiselect ||
        field.type === InputFieldTypes.DropdownSingleselect
      "
      v-model="metadataValue"
      :metadata-key-to-get-options-for="
        field.advancedFilterInputForSearchingOptions?.item_types
          ? field.advancedFilterInputForSearchingOptions?.item_types[0]
          : fieldKey
      "
      :select-type="
        field.type === InputFieldTypes.DropdownSingleselect ? 'single' : 'multi'
      "
      :relation-type="field.relationType"
      :from-relation-type="field.fromRelationType"
      :advanced-filter-input-for-retrieving-options="
        field.advancedFilterInputForRetrievingOptions
      "
      :advanced-filter-input-for-searching-options="
        field.advancedFilterInputForSearchingOptions
      "
      :mode="formFlow"
      :form-id="formId"
      :auto-selectable="field.autoSelectable"
      :disabled="field.disabled"
      :canCreateOption="field.canCreateEntityFromOption"
      :metadataKeyToCreateEntityFromOption="
        field.metadataKeyToCreateEntityFromOption
      "
    />
    <BaseDropdownNew
      v-else-if="field.type === InputFieldTypes.Dropdown"
      v-model:model-value="metadataValue as DropdownOption"
      :options="(field.options as DropdownOption[])"
      dropdown-style="defaultWithBorder"
      :disable="fieldEditIsDisabled"
    />
    <BaseInputTextNumberDatetime
      v-else
      :name="fieldKey"
      v-model:model-value="metadataValue"
      :type="field.type as any"
      input-style="defaultWithBorder"
      @keyup.enter="keyUpEnterEvent()"
      @focusout="keyUpEnterEvent()"
      :disabled="fieldEditIsDisabled"
    />
    <div v-if="showErrors && !fieldIsValid" class="text-red-default">
      <p v-if="field.validation.fastValidationMessage">
        {{ t(field.validation.fastValidationMessage) }}
      </p>
      <p v-else>
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Conditional, DropdownOption } from "@/generated-types/queries";
import {
  InputFieldTypes,
  type BaseRelationValuesInput,
  type InputField as InputFieldType,
} from "@/generated-types/queries";
import BaseDropdownNew from "../base/BaseDropdownNew.vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import ViewModesAutocomplete from "@/components/library/view-modes/ViewModesAutocomplete.vue";
import { addCurrentTimeZoneToDateTimeString, isDateTime } from "@/helpers";
import { onMounted, watch, ref, computed } from "vue";
import { useConditionalValidation } from "@/composables/useConditionalValidation";
import { useFormHelper } from "@/composables/useFormHelper";
import { useI18n } from "vue-i18n";

const emit = defineEmits(["update:value", "registerEnterPressed:value"]);
const { t } = useI18n();

const props = defineProps<{
  fieldKey: string;
  label: string;
  value: string;
  field: InputFieldType;
  formId: string;
  unit?: string;
  linkText?: string;
  isMetadataOnRelation?: boolean;
  error?: string;
  showErrors: boolean;
  fieldIsValid: boolean;
  formFlow?: string;
}>();
const { addEditableMetadataKeys } = useFormHelper();
const metadataValue = ref<string | DropdownOption>(props.value);
const { conditionalFieldIsAvailable } = useConditionalValidation();
const fieldEditIsDisabled = computed(() => {
  if (
    props.field.type === InputFieldTypes.Dropdown &&
    !props.field.options?.length
  )
    return true;

  if (!props.field.validation || !props.field.validation.available_if)
    return false;

  return !conditionalFieldIsAvailable(
    props.field?.validation?.available_if as Conditional,
    props.formId
  );
});

onMounted(() => {
  if (props.isMetadataOnRelation)
    addEditableMetadataKeys([props.fieldKey], props.formId);
});

const getValueFromMetadata = (): string | BaseRelationValuesInput[] => {
  if (
    typeof metadataValue.value !== "object" ||
    Array.isArray(metadataValue.value)
  ) {
    if (isDateTime(metadataValue.value)) {
      return addCurrentTimeZoneToDateTimeString(metadataValue.value);
    }
    return metadataValue.value;
  }
  return metadataValue.value.value;
};

const keyUpEnterEvent = () => {
  const newValue = getValueFromMetadata();
  emit("registerEnterPressed:value", newValue);
};

watch(
  () => metadataValue.value,
  () => {
    const newValue = getValueFromMetadata();
    emit("update:value", newValue);
  }
);
</script>
