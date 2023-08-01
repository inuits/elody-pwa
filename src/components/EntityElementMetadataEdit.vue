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
import InputField from "./base/InputField.vue";
import BaseDropdown from "./base/BaseDropdown.vue";
import type { InputField as InputFieldType } from "@/generated-types/queries";
import { computed, type PropType } from "vue";
import { getEntityIdFromRoute } from "@/helpers";
import { useFormHelper } from "@/composables/useFormHelper";
import type { FormContext } from "vee-validate";
import { useI18n } from "vue-i18n";

const props = defineProps({
  fieldKey: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: String, required: true },
  field: { type: Object as PropType<InputFieldType>, required: false },
});

const { t } = useI18n();
const { getForm } = useFormHelper();
const id = getEntityIdFromRoute() || "";
const form: FormContext = getForm(id);

const computedValue = computed<any>({
  get() {
    return props.value;
  },
  set(value: string) {
    if (form) {
      form.setFieldValue(props.fieldKey, value);
    }
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
