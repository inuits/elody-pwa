<template>
  <!-- page-shaped loading state: mirrors the detail anatomy (panel cards
       with accent-light header bands, field grid, list panels right) so
       nothing jumps when the real content arrives -->
  <div class="flex items-start gap-3 p-4" aria-hidden="true">
    <div class="flex min-w-0 flex-[3] flex-col gap-3">
      <div
        v-for="panel in 3"
        :key="`skeleton-panel-${panel}`"
        class="overflow-hidden rounded-lg border border-accent-light bg-neutral-white"
      >
        <div class="h-9 animate-pulse border-b border-accent-light bg-accent-light"></div>
        <div class="grid grid-cols-2 gap-x-8 gap-y-3 p-4">
          <div
            v-for="field in panel === 1 ? 8 : 4"
            :key="`skeleton-field-${panel}-${field}`"
          >
            <div
              class="mb-1.5 h-[9px] animate-pulse rounded bg-accent-light"
              :class="field % 3 === 0 ? 'w-16' : 'w-24'"
            ></div>
            <div
              class="h-[12px] animate-pulse rounded bg-neutral-30"
              :class="field % 2 === 0 ? 'w-3/4' : 'w-1/2'"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex min-w-0 flex-[2] flex-col gap-3">
      <div
        v-for="panel in 2"
        :key="`skeleton-list-${panel}`"
        class="overflow-hidden rounded-lg border border-accent-light bg-neutral-white"
      >
        <div class="h-9 animate-pulse border-b border-accent-light bg-accent-light"></div>
        <div class="flex flex-col gap-2 p-3">
          <div class="h-6 w-24 animate-pulse rounded bg-accent-light"></div>
          <div
            v-for="row in 2"
            :key="`skeleton-list-row-${panel}-${row}`"
            class="flex items-center gap-3 rounded border border-neutral-20 p-1.5"
          >
            <div class="h-6 w-8 shrink-0 animate-pulse rounded bg-accent-light"></div>
            <div
              class="h-[12px] w-full animate-pulse rounded bg-neutral-30"
              :class="row % 2 === 0 ? 'max-w-[60%]' : 'max-w-[75%]'"
            ></div>
            <div
              class="h-7 w-20 shrink-0 animate-pulse rounded-md border border-neutral-30 bg-neutral-10"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

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

@media (prefers-reduced-motion: reduce) {
  .animate-pulse {
    animation: none;
  }
}
</style>
