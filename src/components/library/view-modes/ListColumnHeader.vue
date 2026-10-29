<template>
  <div
    data-cy="list-column-header"
    class="sticky top-0 z-1 h-(--list-header-height) bg-surface border-b border-border-subtle text-label font-bold text-text-field-label"
  >
    <!-- ui_kits/clients: the list's column-header row — select-all, the field
         labels over the measured cells of the first row, and "Actions". -->
    <BaseInputCheckbox
      v-if="selectable"
      class="absolute top-1/2 -translate-y-1/2 left-2"
      :style="checkboxStyle"
      size="compact"
      :model-value="allSelected"
      :item="{ id: 'select-page' }"
      :bulk-operations-context="undefined"
      :ignore-bulk-operations="true"
      :aria-label="$t('bulk-operations.select-page')"
      @update:model-value="(value: boolean) => emit('togglePageSelection', value)"
    />
    <!-- The cells keep their own labels for screen readers. -->
    <span
      v-for="(label, idx) in labels"
      :key="idx"
      data-cy="list-column-label"
      aria-hidden="true"
      class="absolute top-1/2 -translate-y-1/2 truncate"
      :style="cellStyles[idx]"
      >{{ label ? $t(label) : "" }}</span
    >
    <span
      data-cy="list-column-actions"
      aria-hidden="true"
      class="absolute top-1/2 -translate-y-1/2 right-2"
      >{{ $t("contextMenu.actions") }}</span
    >
  </div>
</template>

<script lang="ts" setup>
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";

defineProps<{
  labels: string[];
  cellStyles: Record<string, string>[];
  // Measured from the first row; falls back to left-2.
  checkboxStyle?: Record<string, string>;
  selectable: boolean;
  allSelected: boolean;
}>();

const emit = defineEmits<{
  (event: "togglePageSelection", selected: boolean): void;
}>();
</script>
