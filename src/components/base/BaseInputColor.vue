<template>
  <div
    class="flex items-center w-full pl-2 border rounded-lg"
    :class="
      disabled
        ? 'bg-background-normal border-text-disabled'
        : 'bg-background-light border-[rgba(0,58,82,0.6)]'
    "
  >
    <!-- click.stop: parents use click.prevent, which would keep the native picker from opening -->
    <input
      data-cy="base-input-color"
      type="color"
      class="w-6 h-6 shrink-0 p-0 border-0 bg-transparent cursor-pointer disabled:cursor-not-allowed"
      v-model="value"
      :disabled="disabled"
      @change.stop
      @click.stop
    />
    <BaseInputTextNumberDatetime
      class="flex-1 min-w-0"
      v-model="value"
      type="text"
      input-style="default"
      :disabled="disabled"
      placeholder="#000000"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";

const props = withDefaults(
  defineProps<{
    modelValue: string | undefined;
    disabled?: boolean;
  }>(),
  { disabled: false },
);

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: string | undefined): void;
}>();

const value = computed({
  get: () => props.modelValue,
  set: (newValue) => emit("update:modelValue", newValue as string | undefined),
});
</script>

<style scoped>
input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}
input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 0.25rem;
}
input[type="color"]::-moz-color-swatch {
  border: none;
  border-radius: 0.25rem;
}
</style>
