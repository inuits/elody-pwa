<template>
  <div
    :class="[
      `rounded-full h-6 flex justify-center items-center ${bgColor}`,
      { 'w-6 p-1': !label },
      { 'w-min px-4': label },
    ]"
  >
    <unicon
      v-if="stepType === 'failed'"
      :name="Unicons.Ban.name"
      fill="text-text-white"
      height="16"
    />
    <unicon
      v-if="stepType === 'complete'"
      :name="Unicons.CheckCircle.name"
      fill="text-green-default"
      height="16"
    />
    <unicon
      v-if="stepType === 'loading'"
      class="animate-spin"
      :name="Unicons.Process.name"
      fill="text-text-white"
      height="16"
    />
    <p v-if="label" :class="`${labelColor}`">{{ t(label) }}</p>
  </div>
</template>

<script setup lang="ts">
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import { computed } from "vue";

const props = defineProps<{
  label?: string;
  stepType: "complete" | "loading" | "empty" | "failed";
}>();

const { t } = useI18n();
const labelColor = computed(() => {
  if (props.stepType === "loading") return "text-neutral-white";
  if (props.stepType === "complete") return "bg-green-default";
  if (props.stepType === "failed") return "bg-red-default";
  return "bg-neutral-30";
});
const bgColor = computed(() => {
  if (props.stepType === "loading") return "bg-accent-accent";
  if (props.stepType === "complete") return "bg-green-light";
  if (props.stepType === "failed") return "bg-red-dark";
  return "bg-neutral-30";
});
</script>

<style scoped></style>
