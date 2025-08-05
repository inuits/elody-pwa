<template>
  <div class="w-full bg-background-light rounded-md">
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
import { computed, watch } from "vue";
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
progress {
  -webkit-appearance: none;
  appearance: none;
}

progress::-webkit-progress-value {
  background-color: var(--color-accent-normal);
}

progress::-moz-progress-bar {
  background-color: var(--color-accent-normal);
}
</style>
