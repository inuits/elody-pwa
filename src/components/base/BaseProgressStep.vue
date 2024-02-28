<template>
  <div
    :class="[
      `rounded-full h-6 flex justify-center items-center ${bgColor}`,
      { 'w-6 p-1': !label },
      { 'w-min px-4': label },
    ]"
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
    <p v-if="label" :class="`${labelColor}`">{{ t(label) }}</p>
  </div>
</template>

<script setup lang="ts">
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import { ProgressStepStatus } from "@/generated-types/queries";

const props = defineProps<{
  label?: string;
  status: ProgressStepStatus;
}>();

const { t } = useI18n();
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
