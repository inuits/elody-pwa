<template>
  <div class="w-full">
    <BaseInputTextNumberDatetime
      v-if="
        subField.inputField.type === InputFieldTypes.Text ||
        subField.inputField.type === InputFieldTypes.Checkbox
      "
      class="w-full"
      v-model:model-value="value as string"
      input-style="defaultWithBorder"
      :type="subField.inputField.type === InputFieldTypes.Checkbox ? 'checkbox' : 'text'"
      :disabled="disabled"
    />
    <AdvancedDropdown
      v-else-if="subField.inputField.type === InputFieldTypes.Dropdown"
      class="w-full"
      v-model:model-value="value as string"
      :options="(subField.inputField.options as DropdownOption[]) ?? []"
      :disable="disabled"
      style-type="defaultWithBorder"
    />
    <AutocompleteRelationCell
      v-else-if="isFieldRelationDropdown"
      v-model:model-value="value as string"
      :input-field="subField.inputField"
      :form-id="formId"
      :disabled="disabled"
    />
    <ViewModesAutocompleteMetadata
      v-else-if="isFieldMetadataDropdown"
      v-model:model-value="value as string"
      :metadata-dropdown-options="subField.inputField.options"
      :canCreateOption="true"
      :select-type="
        subField.inputField.type === InputFieldTypes.DropdownSingleselectMetadata
          ? 'single'
          : 'multi'
      "
      :disabled="false"
      mode="edit"
    />
    <p
      v-if="errorMessage"
      data-testid="inputfield-error"
      class="mt-0.5 text-xs text-red-default"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch } from "vue";
import { useField } from "vee-validate";
import {
  type DropdownOption,
  type SubField,
  InputFieldTypes,
} from "@/generated-types/queries";
import { useFieldValidation } from "@/components/metadata/useFieldValidation";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";
import AutocompleteRelationCell from "@/components/tableInputFields/AutocompleteRelationCell.vue";
import ViewModesAutocompleteMetadata from "@/components/library/view-modes/ViewModesAutocompleteMetadata.vue";
import { getTranslatedMessage } from "@/helpers";

const props = defineProps<{
  modelValue: any;
  subField: SubField;
  fieldKey: string;
  formId: string;
  disabled?: boolean;
}>();

const fieldLabel = computed<string>(() =>
  getTranslatedMessage(props.subField.label as string | "metadata.no-label"),
);

const { getValidationRules } = useFieldValidation(() => props.subField.inputField.validation);
const validationRules = computed(() => getValidationRules(true, false));
const { value, errorMessage } = useField<any>(props.fieldKey, validationRules, { label: fieldLabel.value });

const isFieldRelationDropdown = computed(
  () =>
    props.subField.inputField?.type === InputFieldTypes.DropdownMultiselectRelations ||
    props.subField.inputField?.type === InputFieldTypes.DropdownSingleselectRelations,
);
const isFieldMetadataDropdown = computed(
  () =>
    props.subField.inputField?.type === InputFieldTypes.DropdownMultiselectMetadata ||
    props.subField.inputField?.type === InputFieldTypes.DropdownSingleselectMetadata,
);

watch(
  () => props.modelValue,
  (newVal) => {
    value.value = newVal;
  },
  { immediate: true },
);
</script>
