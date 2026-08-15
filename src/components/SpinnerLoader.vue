<template>
  <svg
    class="ds-spinner shrink-0"
    :style="{ width: size, height: size }"
    :class="[theme === 'inherit' ? 'text-current' : 'text-commit']"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      class="opacity-25"
      stroke="currentColor"
      cx="12"
      cy="12"
      r="10"
      stroke-width="4"
    ></circle>
    <path
      class="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    /** "inherit" takes the surrounding ink; anything else is commit teal. */
    theme?: string;
    /** Steps of the Tailwind spacing scale, as the utility classes read. */
    dimensions?: number;
  }>(),
  {
    theme: "accent",
    dimensions: 20,
  },
);

const size = computed(
  () => `calc(var(--spacing, 0.25rem) * ${props.dimensions})`,
);
</script>

<style scoped>
/* The design system's single spinner: .8s, commit teal unless it inherits. */
.ds-spinner {
  animation: ds-spin 0.8s linear infinite;
}

@keyframes ds-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ds-spinner {
    animation-duration: 2.4s;
  }
}
</style>
