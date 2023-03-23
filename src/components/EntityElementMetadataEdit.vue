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
import { computed, ref, watch, type PropType } from "vue";

const props = defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  field: { type: Object as PropType<InputFieldType>, required: false },
});

const refValue = ref(props.value);

const isDropdownType = computed(() => {
  let isDropdown = false;
  if (props.field) {
    isDropdown =
      props.field.type === "dropdown" ||
      props.field.type === "dropdownMultiselect"
        ? true
        : false;
  }
  return isDropdown;
});

const options = computed(() => {
  const options =
    props.field && props.field.options ? (props.field.options as string[]) : [];
  return options;
});
</script>
