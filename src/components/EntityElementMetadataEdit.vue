<template>
  <div v-if="field" class="text-sm pl-4">
    <BaseInputTextNumberDatetime
      v-if="!isDropdownType"
      v-model="computedValue"
      :label="label"
      :type="field.type as any"
      input-style="defaultWithBorder"
    />
    <ViewModesAutocomplete
      v-if="isDropdownType"
      v-model="computedValue"
      :metadata-key-to-get-options-for="fieldKey"
      :label="label"
      select-type="single"
    />
  </div>
</template>

<script lang="ts" setup>
import type { FormContext } from "vee-validate";
import type { InputField as InputFieldType } from "@/generated-types/queries";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import ViewModesAutocomplete from "@/components/library/view-modes/ViewModesAutocomplete.vue";
import { computed } from "vue";
import { getEntityIdFromRoute } from "@/helpers";
import { useFormHelper } from "@/composables/useFormHelper";

const props = defineProps<{
  fieldKey: string;
  label: string;
  value: string;
  field?: InputFieldType;
  formId?: string;
}>();

const { getForm } = useFormHelper();
const id = getEntityIdFromRoute() || "";
const form: FormContext = getForm(props.formId || id);

const computedValue = computed<any>({
  get() {
    return props.value;
  },
  set(value) {
    if (Array.isArray(value)) value = value[0];
    if (form) form.setFieldValue(`intialValues.${props.fieldKey}`, value);
  },
});

const isDropdownType = computed(() => {
  const dropdownTypes = ["dropdown", "dropdownMultiselect"];
  let isDropdown = false;
  if (props.field) {
    isDropdown = dropdownTypes.includes(props.field.type);
  }
  return isDropdown;
});
</script>
