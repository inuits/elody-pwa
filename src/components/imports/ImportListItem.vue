<template>
  <!-- A pick row is a real button; selection shows as the accent wash like
       every selected row (import-browser.md). -->
  <button
    v-if="item"
    type="button"
    data-test="li-tree"
    class="import-item"
    :class="{ 'import-item--selected': selectedItem && selectedItem === item }"
    :aria-pressed="!!(selectedItem && selectedItem === item)"
    @click="emit('updateSelectedItem', item)"
  >
    <span class="import-item__dot" aria-hidden="true" />
    <span class="import-item__title">{{ item }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  item: any;
  selectedItem: any;
}>();

const emit = defineEmits<{
  (event: "updateSelectedItem", selectedItem: any): void;
}>();
</script>

<style scoped>
.import-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-ds-6);
  width: 100%;
  padding: var(--spacing-ds-6) var(--spacing-ds-8);
  text-align: left;
  font-size: var(--text-table);
  font-weight: 700;
  color: var(--color-text-body);
  cursor: pointer;
  transition: background-color var(--transition-duration-ui) var(--ease-ui);
}

.import-item:hover {
  background-color: var(--color-surface-row-hover);
}

.import-item--selected {
  background-color: var(--color-surface-editable-hover);
}

.import-item:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: -2px;
}

.import-item__dot {
  flex: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--color-text-secondary);
}

.import-item__title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
