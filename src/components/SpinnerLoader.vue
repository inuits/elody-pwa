<template>
  <span
    role="status"
    class="inline-block shrink-0 animate-spin rounded-full"
    :class="trackClass"
    :style="{
      width: `${sizePx}px`,
      height: `${sizePx}px`,
      borderWidth: `${borderWidth}px`,
    }"
  ></span>
</template>

<script lang="ts" setup>
import { computed } from "vue";

// Design-reference ring spinner: a light track with an accent top edge.
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

const trackClass = computed(() =>
  props.theme === "accent"
    ? "border-accent-light !border-t-accent-accent"
    : "border-neutral-30 !border-t-current",
);

// dimensions is historically a tailwind size unit (w-5, w-10, ...): 1 unit = 4px
const sizePx = computed(() => Number(props.dimensions) * 4);

const borderWidth = computed(() => (sizePx.value >= 48 ? 4 : 3));
</script>
