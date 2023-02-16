<template>
  <label class="block w-full">
    <span
      v-if="label"
      :class="[
        `ml-1 text-[var(--color-text-body)] text-sm ${
          isDisabled ? 'opacity-50' : ''
        }`,
      ]"
      >{{ label }}</span
    >
    <select
      v-model="selectedItem"
      :class="isDisabled ? 'opacity-40 cursor-not-allowed' : ''"
      :disabled="isDisabled"
    >
      <option v-for="option in options" :key="option" :value="option">
        {{ option }}
      </option>
    </select>
  </label>
</template>

<script lang="ts">
import { defineComponent, onUpdated, ref, watch, type PropType } from "vue";
import { Unicons } from "@/types";

export default defineComponent({
  name: "BaseDropdownNew",
  props: {
    label: { type: String, default: "" },
    options: {
      type: Array as PropType<Array<string | number>>,
      required: true,
    },
    isDisabled: { type: Boolean, required: false },
    modelValue: { type: [String, Number], default: undefined },
    bgColor: {
      type: String,
      default: "neutral-0",
    },
    labelColor: {
      type: String,
      default: "neutral-600",
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const selectedItem = ref(props.modelValue);
    watch(selectedItem, (value) => emit("update:modelValue", value));

    onUpdated(() => {
      selectedItem.value = props.modelValue;
    });

    return { Unicons, selectedItem };
  },
});
</script>

<style lang="postcss" scoped>
select {
  @apply block h-7 mr-4 p-0 pl-2 w-full min-w-0 cursor-pointer;
  @apply border border-[var(--color-text-body)];
  @apply text-[var(--color-text-body)] text-sm;
  @apply rounded;
  @apply focus:outline-none;
}
option {
  @apply rounded py-2 px-4 bg-neutral-20 h-9;
}
</style>
