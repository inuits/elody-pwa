<template>
  <!-- Mirrors BasePagination's shape — size select left, pager right — so the
       footer does not jump when the real pager replaces it. -->
  <div class="pagination-skeleton" aria-hidden="true">
    <div class="pagination-skeleton__size" />
    <div class="pagination-skeleton__pager">
      <div v-for="index in 5" :key="index" class="pagination-skeleton__page" />
    </div>
  </div>
</template>

<style scoped>
.pagination-skeleton {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-ds-8);
  user-select: none;
}

.pagination-skeleton__size,
.pagination-skeleton__page {
  border-radius: var(--radius-input);
  background-color: var(--color-surface-sunken);
  animation: pulse 1.6s var(--ease-ui) infinite;
}

.pagination-skeleton__size {
  width: 108px;
  height: 26px;
}

.pagination-skeleton__pager {
  display: flex;
  align-items: center;
  gap: var(--spacing-ds-2);
}

.pagination-skeleton__page {
  width: 26px;
  height: 26px;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
