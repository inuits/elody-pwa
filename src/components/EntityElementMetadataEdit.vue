<template>
  <div v-if="field" class="text-sm pl-4">
    <BaseInputTextNumberDatetime
      v-if="!isDropdownType"
      v-model="computedValue"
      :label="label"
      :type="field.type as any"
      input-style="defaultWithBorder"
    />
    <BaseDropdownNew
      v-if="isDropdownType"
      v-model="computedValue"
      :options="options"
      :label="label"
      dropdown-style="defaultWithBorder"
    />
  </div>
</template>

<script lang="ts" setup>
import type { FormContext } from "vee-validate";
import {
  DamsIcons,
  type DropdownOption,
  type InputField as InputFieldType,
} from "@/generated-types/queries";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
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
  set(value: string) {
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

const options = computed<DropdownOption[]>(() => {
  const fieldOptions =
    props.field && props.field.options ? (props.field.options as string[]) : [];
  const options = fieldOptions.map((option) => {
    return { icon: DamsIcons.NoIcon, label: option, value: option };
  });
  return options;
});
</script>
