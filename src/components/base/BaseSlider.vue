<template>
  <Slider
    class="base-slider"
    :value="modelValue"
    :min="min"
    :max="max"
    :tooltips="false"
    @change="handleChange"
  />
</template>

<script lang="ts" setup>
import Slider from "@vueform/slider";

defineProps<{
  modelValue: number | number[];
  min: number;
  max: number;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: number | number[]): void;
}>();

const handleChange = (value: number | number[]) => {
  emit("update:modelValue", value);
};
</script>

<style src="@vueform/slider/themes/default.css"></style>

<style scoped>
.base-slider {
  --slider-connect-bg: theme("colors.accent.normal");
  --slider-handle-ring-color: rgba(0, 0, 0, 0.32);
  --slider-handle-shadow: 0.5px 0.5px 2px 1px rgba(0, 0, 0, 0.32);
  --slider-handle-height: 0.875rem;
  --slider-handle-width: 0.875rem;
}
</style>
