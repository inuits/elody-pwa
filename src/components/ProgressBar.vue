<template>
  <div class="progress-track w-full">
    <div class="top-0 w-full"></div>

    <progress
      :class="`h-full w-full rounded-md text-neutral-white`"
      max="100"
      :value="progressPercentage"
    >
      {{ progressText }}
    </progress>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = withDefaults(
  defineProps<{
    progress: number;
    progressBarType: "percentage" | "steps";
    totalAmountOfSteps?: number;
  }>(),
  {
    progress: 0,
    progressBarType: "percentage",
  },
);

const { t } = useI18n();
const progressPercentage = computed((): number => {
  if (props.progressBarType === "percentage") return props.progress;
  return Math.round((props.progress / props.totalAmountOfSteps) * 100);
});

const progressText = computed(() => {
  if (props.progressBarType === "percentage")
    return t("actions.progress-bar.percentage", [progressPercentage.value]);
  else
    return t("actions.progress-bar.steps", [
      props.progress,
      props.totalAmountOfSteps,
    ]);
});
</script>

<style scoped>
/* Commit teal fill on a sunken track (upload.md) — the mint is retired. */
.progress-track {
  background-color: var(--color-surface-sunken);
  border-radius: var(--radius-chip);
  overflow: hidden;
}

progress {
  -webkit-appearance: none;
  appearance: none;
  display: block;
}

progress::-webkit-progress-bar {
  background-color: transparent;
}

progress::-webkit-progress-value {
  background-color: var(--color-commit);
}

progress::-moz-progress-bar {
  background-color: var(--color-commit);
}
</style>
