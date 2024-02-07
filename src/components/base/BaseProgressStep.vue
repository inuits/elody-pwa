<template>
  <div
    :class="[
      `rounded-full h-6 w-6 p-1 flex justify-center items-center ${stepType === 'complete' ? 'bg-green-light' : stepType === 'loading' ? 'bg-accent-accent' : stepType === 'failed' ? 'bg-red-dark' : 'bg-neutral-30'}`,
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
  </div>
</template>

<script setup lang="ts">
import { Unicons } from "@/types";

defineProps<{
  stepType: "complete" | "loading" | "empty" | "failed";
}>();
</script>

<style scoped></style>
