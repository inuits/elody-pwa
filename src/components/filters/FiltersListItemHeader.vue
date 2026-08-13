<template>
  <div
    data-cy="filters-list-item"
    class="flex relative items-center justify-between px-4 py-2.5 border-t border-neutral-30 cursor-pointer select-none hover:bg-accent-light/40"
    @click="$emit('toggle')"
  >
    <span
      data-cy="filters-list-item-label"
      class="flex items-center gap-2 text-sm"
      :class="{ 'font-bold': isActive }"
    >
      <!-- active dot: the filter carries a value -->
      <span
        v-if="isActive"
        data-cy="filter-active-dot"
        class="h-2 w-2 shrink-0 rounded-full bg-accent-accent"
        aria-hidden="true"
      ></span>
      {{ label }}
    </span>
    <div class="flex gap-x-2">
      <BaseTooltip v-if="tooltip" position="top-end" :tooltip-offset="8">
        <template #activator="{ on }">
          <div v-on="on">
            <Unicon :name="Unicons.QuestionCircle.name" height="20" />
          </div>
        </template>
        <span class="text-sm text-text-placeholder">
          {{ tooltipText }}
        </span>
      </BaseTooltip>
      <Unicon :name="icon" height="20" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { Unicons } from "@/types";

defineProps({
  isActive: { type: Boolean, required: true },
  label: { type: String, required: true },
  tooltip: { type: [String, Boolean], default: undefined },
  tooltipText: { type: String, default: "" },
  icon: { type: String, required: true },
});

defineEmits(["toggle"]);
</script>
