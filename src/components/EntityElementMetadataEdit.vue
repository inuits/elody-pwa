<template>
  <div v-if="field" class="text-sm pl-4">
    <BaseInputTextNumberDatetime
      v-if="!isDropdownType"
      v-model="computedValue"
      :label="label"
      :type="field.type as any"
      :validation="field.validation || ''"
      input-style="defaultWithBorder"
    />
    <ViewModesAutocomplete
      v-if="
        isDropdownType && field.type === InputFieldTypes.DropdownMultiselect
      "
      v-model="computedValue"
      :metadata-key-to-get-options-for="fieldKey"
      :label="label"
      :select-type="field.type === 'dropdownMultiselect' ? 'multi' : 'single'"
      :options="field.options"
    />
    <BaseDropdownNew
      v-if="
        isDropdownType &&
        field.type === InputFieldTypes.Dropdown &&
        field.options
      "
      :modelValue="computedValue"
      :options="(field.options as DropdownOption[])"
      dropdown-style="defaultWithBorder"
      :label="label"
      @update:model-value="setComputedValue"
    />
    <span v-if="fieldError" class="text-red-default">{{ fieldError }}</span>
  </div>
</template>

<script lang="ts" setup>
import type { FormContext } from "vee-validate";
import {
  InputFieldTypes,
  type InputField as InputFieldType,
} from "@/generated-types/queries";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import ViewModesAutocomplete from "@/components/library/view-modes/ViewModesAutocomplete.vue";
import { computed, onMounted, ref } from "vue";
import { useFormHelper } from "@/composables/useFormHelper";
import BaseDropdownNew from "./base/BaseDropdownNew.vue";
import type { DropdownOption } from "@/generated-types/queries";

const props = defineProps<{
  fieldKey: string;
  label: string;
  value: string;
  field?: InputFieldType;
  formId: string;
}>();
const { getForm, getFieldError } = useFormHelper();
let form: FormContext | undefined = undefined;
const fieldError = ref<string | undefined>(undefined);

onMounted(() => {
  form = getForm(props.formId);
});

const computedValue = computed<any>({
  get() {
    return props.value;
  },
  set(value) {
    if (props.field.type == "dropdown") {
      if (Array.isArray(value)) value = value[0];
    }
    if (form) form.setFieldValue(`intialValues.${props.fieldKey}`, value);
    fieldError.value = getFieldError(props.formId, props.fieldKey);
  },
});

const setComputedValue = (newDropdownOption: DropdownOption) => {
  if (computedValue.value === newDropdownOption.value) return;
  computedValue.value = newDropdownOption.value;
};

const isDropdownType = computed(() => {
  const dropdownTypes = [
    InputFieldTypes.Dropdown as string,
    InputFieldTypes.DropdownMultiselect as string,
  ];
  let isDropdown = false;
  if (props.field) {
    isDropdown = dropdownTypes.includes(props.field.type);
  }
  return isDropdown;
});
</script>
