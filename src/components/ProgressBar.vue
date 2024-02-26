<template>
  <div v-if="progress" class="w-full bg-neutral-0 rounded-md">
    <div class="top-0 w-full"></div>

    <div
      :class="`font-bold flex bg-accent-normal progress_bar h-full rounded-md text-neutral-white justify-center items-center p-2`"
    >
      <p v-if="progressBarType === 'percentage'">
        {{ t("actions.progress-bar.percentage", [progressPercentage]) }}
      </p>
      <p class="" v-else>
        {{ t("actions.progress-bar.steps", [progress, totalAmountOfSteps]) }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { setCssVariable } from "@/helpers";
import { watch, computed } from "vue";
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
  return (props.progress / props.totalAmountOfSteps) * 100;
});

watch(
  () => progressPercentage.value,
  () => {
    setCssVariable(
      "--progress-bar-width-percentage",
      progressPercentage.value.toString() + "%",
    );
  },
  { immediate: true },
);
</script>

<style scoped>
.progress_bar {
  width: var(--progress-bar-width-percentage);
}
</style>
