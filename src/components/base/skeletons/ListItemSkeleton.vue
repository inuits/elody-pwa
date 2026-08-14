<template>
  <div class="max-h-[80vh] overflow-y-auto">
    <!-- placeholder for the column-header row -->
    <div class="flex items-center gap-2 px-1.5 pb-1">
      <div class="flex w-full items-center gap-4">
        <div
          v-for="index in 4"
          :key="`skeleton-header-${index}`"
          class="h-[10px] w-full max-w-24 animate-pulse rounded bg-neutral-30"
        ></div>
      </div>
      <div class="h-[10px] w-16 shrink-0 animate-pulse rounded bg-neutral-30"></div>
    </div>
    <div
      v-for="index in amountRef"
      :key="`skeleton-${index}`"
      class="mb-2 flex list-none items-center gap-2 rounded border border-neutral-20 bg-background-light p-1.5"
    >
      <div class="flex w-full items-center gap-4">
        <div class="h-6 w-8 shrink-0 animate-pulse rounded bg-accent-light"></div>
        <div class="h-6 w-10 shrink-0 animate-pulse rounded bg-accent-light"></div>
        <div
          class="h-[12px] w-full animate-pulse rounded bg-neutral-30"
          :class="index % 3 === 0 ? 'max-w-[55%]' : 'max-w-[70%]'"
        ></div>
        <div class="h-[12px] w-full max-w-[40%] animate-pulse rounded bg-neutral-30"></div>
      </div>
      <div
        class="h-7 w-24 shrink-0 animate-pulse rounded-md border border-neutral-30 bg-neutral-10"
      ></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

interface Props {
  amount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  amount: 20,
});

const amountRef = ref(props.amount || 20);
</script>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
