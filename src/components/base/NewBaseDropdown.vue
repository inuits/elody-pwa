<template>
  <label class="flex flex-col justify-end w-full">
    <span
      v-if="label"
      :class="[
        `ml-1 text-${labelColor} text-sm ${isDisabled ? 'opacity-50' : ''}`,
      ]"
      >{{ label }}</span
    >
    <select
      v-model="selectedItem"
      :class="[{ 'opacity-40 cursor-not-allowed': isDisabled }]"
      :disabled="isDisabled"
    >
      <option v-for="option in options" :key="option.value" :value="option">
        {{ option.label }}
      </option>
    </select>
  </label>
</template>

<script lang="ts">
import { defineComponent, ref, watch, type PropType } from "vue";
import type { MetadataFieldOption } from "@/generated-types/queries";

export default defineComponent({
  name: "BaseDropdown",
  props: {
    selectedItemPrefix: { type: String, default: "" },
    label: { type: String, default: "" },
    options: {
      type: Array as PropType<MetadataFieldOption[]>,
      required: true,
    },
    isDisabled: { type: Boolean, required: false },
    modelValue: {
      type: Object as PropType<MetadataFieldOption>,
      default: () => {
        return { label: "", value: "" };
      },
    },
    bgColor: {
      type: String,
      default: "neutral-0",
    },
    labelColor: {
      type: String,
      default: "text-light",
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const selectedItem = ref<MetadataFieldOption>(props.modelValue);
    watch(selectedItem, () => emit("update:modelValue", selectedItem.value));

    return { selectedItem };
  },
});
</script>

<style lang="postcss" scoped>
select {
  @apply block mr-4 p-2 w-full min-w-0 cursor-pointer;
  @apply border border-neutral-50;
  @apply text-neutral-700 text-sm;
  @apply rounded bg-neutral-20;
  @apply focus:outline-none;
}
option {
  @apply rounded py-2 px-4 bg-neutral-20 h-9;
}
</style>
