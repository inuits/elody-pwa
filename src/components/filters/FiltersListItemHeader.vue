<template>
  <div
    data-cy="filters-list-item"
    role="button"
    tabindex="0"
    :aria-expanded="open ? 'true' : 'false'"
    class="flex relative items-center justify-between px-3 py-2 border-b border-border-faint cursor-pointer select-none"
    :class="{ 'bg-accent-light text-accent-ink': isActive }"
    @click="$emit('toggle')"
    @keydown.enter.stop.prevent="$emit('toggle')"
    @keydown.space.prevent="$emit('toggle')"
  >
    <span data-cy="filters-list-item-label" class="text-label font-bold">
      {{ label }}
    </span>
    <div class="flex gap-x-2">
      <BaseTooltip v-if="tooltip" position="top-end" :tooltip-offset="8">
        <template #activator="{ on, describedBy }">
          <div v-on="on" :aria-describedby="describedBy">
            <Unicon :name="Unicons.QuestionCircle.name" height="16" />
          </div>
        </template>
        <span>
          {{ tooltipText }}
        </span>
      </BaseTooltip>
      <!-- filter-panel.md: ⌄ closed · ⌃ open -->
      <Unicon
        :name="open ? Unicons.AngleUp.name : Unicons.AngleDown.name"
        height="16"
      />
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
  open: { type: Boolean, default: false },
});

defineEmits(["toggle"]);
</script>
