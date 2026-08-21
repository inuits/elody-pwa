<template>
  <div
    v-if="isLocked"
    data-testid="locked-field-indicator"
    :class="[
      'absolute right-1 z-10 pointer-events-auto',
      position === 'middle-right' ? 'top-1/2 -translate-y-1/2' : 'top-1',
    ]"
  >
    <base-tooltip position="top-right" :tooltip-offset="8">
      <template #activator="{ on }">
        <div v-on="on" class="text-text-light">
          <unicon :name="Unicons.Lock.name" height="18" />
        </div>
      </template>
      <template #default>
        <span class="text-sm text-text-placeholder">
          {{ t(tooltip || "metadata.tooltips.locked-field") }}
        </span>
      </template>
    </base-tooltip>
  </div>
</template>

<script setup lang="ts">
import { Unicons } from "@/types";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { useI18n } from "vue-i18n";

withDefaults(
  defineProps<{
    isLocked?: boolean;
    tooltip?: string | null;
    position?: "top-right" | "middle-right";
  }>(),
  {
    isLocked: false,
    tooltip: null,
    position: "top-right",
  },
);

const { t } = useI18n();
</script>
