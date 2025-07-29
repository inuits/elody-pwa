<template>
  <div
    data-cy="filters-list-item"
    class="flex relative items-center justify-between px-6 py-4 border-t-2 border-accent-highlight cursor-pointer select-none"
    :class="{ 'bg-accent-normal text-neutral-white': isActive }"
    @click="$emit('toggle')"
  >
    <span data-cy="filters-list-item-label" class="text-lg">
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
  tooltip: { type: String, default: undefined },
  tooltipText: { type: String, default: "" },
  icon: { type: String, required: true },
});

defineEmits(["toggle"]);
</script>
