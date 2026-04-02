<template>
  <div class="w-full">
    <BaseInputTextNumberDatetime
      v-if="
        inputField.type === InputFieldTypes.Text ||
        inputField.type === InputFieldTypes.Checkbox
      "
      class="w-full"
      v-model:model-value="value as string"
      input-style="defaultWithBorder"
      :type="inputField.type === InputFieldTypes.Checkbox ? 'checkbox' : 'text'"
      :disabled="disabled"
    />
    <AdvancedDropdown
      v-else-if="inputField.type === InputFieldTypes.Dropdown"
      class="w-full"
      v-model:model-value="value as string"
      :options="(inputField.options as DropdownOption[]) ?? []"
      :disable="disabled"
      style-type="defaultWithBorder"
    />
    <AutocompleteRelationCell
      v-else-if="isFieldRelationDropdown"
      v-model:model-value="value as string"
      :input-field="inputField"
      :form-id="formId"
      :disabled="disabled"
    />
    <ViewModesAutocompleteMetadata
      v-else-if="isFieldMetadataDropdown"
      v-model:model-value="value as string"
      :metadata-dropdown-options="inputField.options"
      :canCreateOption="true"
      :select-type="
        inputField.type === InputFieldTypes.DropdownSingleselectMetadata
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
  type InputField,
  InputFieldTypes,
} from "@/generated-types/queries";
import { useFieldValidation } from "@/components/metadata/useFieldValidation";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";
import AutocompleteRelationCell from "@/components/base/AutocompleteRelationCell.vue";
import ViewModesAutocompleteMetadata from "@/components/library/view-modes/ViewModesAutocompleteMetadata.vue";

const props = defineProps<{
  modelValue: any;
  inputField: InputField;
  fieldKey: string;
  formId: string;
  disabled?: boolean;
}>();

const { getValidationRules } = useFieldValidation(() => props.inputField.validation);
const validationRules = computed(() => getValidationRules(true, false));
const { value, errorMessage } = useField<any>(props.fieldKey, validationRules);

const isFieldRelationDropdown = computed(
  () =>
    props.inputField?.type === InputFieldTypes.DropdownMultiselectRelations ||
    props.inputField?.type === InputFieldTypes.DropdownSingleselectRelations,
);
const isFieldMetadataDropdown = computed(
  () =>
    props.inputField?.type === InputFieldTypes.DropdownMultiselectMetadata ||
    props.inputField?.type === InputFieldTypes.DropdownSingleselectMetadata,
);

watch(
  () => props.modelValue,
  (newVal) => {
    value.value = newVal;
  },
  { immediate: true },
);
</script>
