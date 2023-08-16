<template>
  <div v-if="field" class="text-sm pl-4">
    <InputField
      v-if="!isDropdownType"
      v-model="computedValue"
      :label="t(label)"
      :type="field.type"
    />
    <BaseDropdown
      v-else
      v-model="computedValue"
      :label="t(label)"
      :options="options"
    />
  </div>
</template>

<script lang="ts" setup>
import type { FormContext } from "vee-validate";
import type { InputField as InputFieldType } from "@/generated-types/queries";
import BaseDropdown from "@/components/base/BaseDropdown.vue";
import InputField from "@/components/base/InputField.vue";
import { computed } from "vue";
import { getEntityIdFromRoute } from "@/helpers";
import { useFormHelper } from "@/composables/useFormHelper";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  fieldKey: string;
  label: string;
  value: string;
  field?: InputFieldType;
  formId?: string;
}>();

const { t } = useI18n();
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

const options = computed(() => {
  const options =
    props.field && props.field.options ? (props.field.options as string[]) : [];
  return options;
});
</script>
