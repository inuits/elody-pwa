<template>
  <div class="max-h-[80vh] overflow-y-auto">
    <div
      v-for="index in amount"
      :key="`skeleton-${index}`"
      class="border rounded cursor-pointer list-none z-[-1] flex items-center gap-2 p-1.5 mb-2 bg-background-light border-accent-highlight"
    >
      <div class="w-10 h-10 flex justify-center items-center">
        <div class="w-4 h-4 bg-gray-300 animate-pulse"></div>
      </div>

      <div class="w-10 h-10 bg-gray-300 animate-pulse rounded flex-shrink-0"></div>

      <div class="w-full flex flex-col">
        <div class="h-[16px] bg-gray-300 animate-pulse rounded w-1/2 mb-[2px]"></div>
        <div class="h-[16px] bg-gray-300 animate-pulse rounded w-3/4 mt-[2px]"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';

interface Props {
  amount?: number;
}

withDefaults(defineProps<Props>(), {
  amount: 20,
});

const logWithTime = (message: string, ...args: any[]) => {
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
  console.log(`[${time}] [${now.getTime()}]`, message, ...args);
};

onMounted(() => {
  logWithTime('[ListItemSkeleton] Mounted (skeleton shown)');
});

onUnmounted(() => {
  logWithTime('[ListItemSkeleton] Unmounted (skeleton hidden)');
});
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
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