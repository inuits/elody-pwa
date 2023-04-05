<template>
  <div v-if="field" class="text-sm pl-4">
    <InputField
      v-if="!isDropdownType"
      v-model="refValue"
      :label="label"
      :type="field.type"
    />
    <BaseDropdown v-else v-model="refValue" :label="label" :options="options" />
  </div>
</template>

<script lang="ts" setup>
import InputField from "./base/InputField.vue";
import BaseDropdown from "./base/BaseDropdown.vue";
import type { InputField as InputFieldType } from "@/generated-types/queries";
import { computed, onMounted, ref, watch, type PropType } from "vue";
import { getEntityIdFromRoute } from "@/helpers";
import { useFormHelper } from "@/composables/useFormHelper";
import type { FormContext } from "vee-validate";

const props = defineProps({
  fieldKey: { type: String, required: true },
  label: { type: String, required: true },
  field: { type: Object as PropType<InputFieldType>, required: false },
});
const { getForm } = useFormHelper();
const id = getEntityIdFromRoute();
const refValue = ref("");
let form: FormContext | undefined = undefined;

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

onMounted(() => {
  if (id) {
    form = getForm(id);
    refValue.value = form.values[props.fieldKey] || "-";
  }
});

watch(
  () => refValue.value,
  (value) => {
    if (form) {
      form.setFieldValue(props.fieldKey, value);
    }
  }
);
</script>
