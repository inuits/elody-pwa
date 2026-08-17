<template>
  <!-- Option-shaped rows rather than one spinner: the rail keeps its height
       and the shape tells you what is coming (filter-panel.md §Round 2). -->
  <div class="filter-options-skeleton" aria-hidden="true">
    <div v-for="index in rows" :key="index" class="filter-options-skeleton__row">
      <span class="filter-options-skeleton__box" />
      <span
        class="filter-options-skeleton__label"
        :style="{ width: labelWidths[index - 1] }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const { rows = 3 } = defineProps<{ rows?: number }>();

/** Uneven widths so the placeholder reads as a list, not as a table. */
const labelWidths = ["72%", "54%", "63%", "48%", "68%"];
</script>

<style scoped>
.filter-options-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-ds-6);
}

.filter-options-skeleton__row {
  display: flex;
  align-items: center;
  gap: var(--spacing-ds-5);
}

.filter-options-skeleton__box,
.filter-options-skeleton__label {
  background-color: var(--color-surface-sunken);
  border-radius: var(--radius-chip);
  animation: filter-options-pulse 1.6s var(--ease-ui) infinite;
}

.filter-options-skeleton__box {
  flex: none;
  width: 14px;
  height: 14px;
}

.filter-options-skeleton__label {
  height: 10px;
}

@keyframes filter-options-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
