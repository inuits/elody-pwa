<template>
  <div v-if="progress" class="w-full h-[25px] mb-4 bg-neutral-0 rounded-md">
    <div class="relative flex w-full justify-center">
      <p>{{ `Progress: ${Math.round(progress)}%` }}</p>
    </div>

    <div :class="`bg-accent-normal upload_bar h-full rounded-md`"></div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  progress: number;
}>();
</script>

<style scoped></style>
