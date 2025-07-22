<template>
  <svg
    :class="`animate-spin -ml-1 mr-3 text-white ${dimensions}`"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      :class="['opacity-25', color.stroke]"
      cx="12"
      cy="12"
      r="10"
      stroke-width="4"
    ></circle>
    <path
      :class="['opacity-75', color.fill]"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    theme?: string;
    dimensions?: number;
  }>(),
  {
    theme: "default",
    dimensions: 20,
  },
);

const colorMapping: { [key: string]: { stroke: string; fill: string } } = {
  default: { stroke: "currentColor", fill: "currentColor" },
  accent: { stroke: "stroke-accent-accent", fill: "fill-accent-accent" },
};

const dimensionMapping: { [key: number]: string } = {
  5: "w-5 h-5",
  10: "w-10 h-10",
  14: "w-14 h-14",
  16: "w-16 h-16",
  20: "w-20 h-20",
};

const color = computed(() => colorMapping[props.theme]);
const dimensions = computed(() => dimensionMapping[props.dimensions]);
</script>
