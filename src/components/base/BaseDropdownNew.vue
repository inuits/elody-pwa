<template>
  <label class="block w-full">
    <span v-if="label" class="m-0 ml-1 py-0.5 px-0 text-sm text-text-body">
      {{ label }}
    </span>
    <select
      v-model="selectedOption"
      class="block h-7 m-0 py-0 w-full cursor-pointer rounded text-sm"
      :class="{ 'opacity-40 pointer-events-none': disabled }"
      :disabled="disabled"
    >
      <option v-for="option in options" :key="option.value" :value="option">
        {{ option.label }}
      </option>
    </select>
  </label>
</template>

<script lang="ts" setup>
import { onUpdated, ref, watch } from "vue";

export type DropdownOption = {
  label: string;
  value: string;
};

const props = withDefaults(
  defineProps<{
    modelValue: DropdownOption;
    options: DropdownOption[];
    label: string;
    disabled: boolean;
  }>(),
  {
    label: "",
    disabled: false,
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: DropdownOption): void;
}>();

const selectedOption = ref(props.modelValue);

onUpdated(() => (selectedOption.value = props.modelValue));
watch(selectedOption, (value) => emit("update:modelValue", value));
</script>
