<template>
  <!-- Section headers are buttons: focusable, aria-expanded, Enter/Space. -->
  <button
    type="button"
    data-cy="filters-list-item"
    class="flex relative w-full items-center justify-between px-4 py-2.5 border-t border-neutral-30 bg-transparent cursor-pointer select-none hover:bg-accent-light/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-accent"
    :aria-expanded="expanded"
    @click="$emit('toggle')"
  >
    <span
      data-cy="filters-list-item-label"
      class="flex items-center gap-2 text-label text-left"
      :class="isActive ? 'font-bold' : 'font-bold text-text-body'"
    >
      <!-- active count chip: the filter carries a value -->
      <span
        v-if="isActive"
        data-cy="filter-active-dot"
        role="status"
        class="flex h-4 min-w-4 shrink-0 items-center justify-center rounded bg-accent-accent px-1 text-micro font-bold text-neutral-white"
      >
        {{ activeCount || 1 }}
      </span>
      {{ label }}
    </span>
    <span class="flex items-center gap-x-1.5 text-neutral-200">
      <BaseTooltip v-if="tooltip" position="top-end" :tooltip-offset="8">
        <template #activator="{ on }">
          <span v-on="on">
            <Unicon :name="Unicons.QuestionCircle.name" height="14" />
          </span>
        </template>
        <span class="text-sm text-text-placeholder">
          {{ tooltipText }}
        </span>
      </BaseTooltip>
      <Unicon :name="icon" height="16" />
    </span>
  </button>
</template>

<script lang="ts" setup>
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { Unicons } from "@/types";

defineProps({
  isActive: { type: Boolean, required: true },
  expanded: { type: Boolean, default: false },
  activeCount: { type: Number, default: 0 },
  label: { type: String, required: true },
  tooltip: { type: [String, Boolean], default: undefined },
  tooltipText: { type: String, default: "" },
  icon: { type: String, required: true },
});

defineEmits(["toggle"]);
</script>
