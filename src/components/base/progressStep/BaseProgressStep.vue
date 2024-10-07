<template>
  <div
    :class="[
      `rounded-full h-6 flex justify-center items-center ${bgColor} cursor-default`,
      { 'w-6 p-1': !showLabel },
      { 'w-min px-4': showLabel },
    ]"
    :title="translatedLabel"
  >
    <unicon
      v-if="status === ProgressStepStatus.Empty"
      :name="Unicons.Circle.name"
      class="fill-neutral-black"
      height="16"
    />
    <unicon
      v-if="status === ProgressStepStatus.Failed"
      :name="Unicons.Ban.name"
      class="fill-neutral-white"
      height="16"
    />
    <unicon
      v-if="status === ProgressStepStatus.Complete"
      :name="Unicons.CheckCircle.name"
      class="fill-green-default"
      height="16"
      loading
    />
    <unicon
      v-if="status === ProgressStepStatus.Loading"
      class="animate-spin fill-neutral-white"
      :name="Unicons.Process.name"
      height="16"
    />
    <p v-if="showLabel" :class="`${labelColor}`">{{ translatedLabel }}</p>
  </div>
</template>

<script setup lang="ts">
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import { ProgressStepStatus } from "@/generated-types/queries";

const props = withDefaults(
  defineProps<{
    label?: string;
    showLabel: boolean;
    status: ProgressStepStatus;
  }>(),
  {
    showLabel: true,
  }
);

const { t } = useI18n();

const translatedLabel = computed(() => (props.label ? t(props.label) : ""));

const labelColor = computed(() => {
  if (props.status === ProgressStepStatus.Loading) return "text-neutral-white";
  if (props.status === ProgressStepStatus.Complete) return "text-green-default";
  if (props.status === ProgressStepStatus.Failed) return "text-neutral-white";
  return "bg-neutral-30";
});
const bgColor = computed(() => {
  if (props.status === ProgressStepStatus.Loading) return "bg-accent-accent";
  if (props.status === ProgressStepStatus.Complete) return "bg-green-light";
  if (props.status === ProgressStepStatus.Failed) return "bg-red-default";
  return "bg-neutral-30";
});
</script>

<style scoped></style>
