<template>
  <div class="filter-section">
    <!-- A real disclosure button: this was a clickable div, so the keyboard
         could not open a filter section at all (filter-panel.md). -->
    <button
      type="button"
      data-cy="filters-list-item"
      class="filter-section__toggle"
      :aria-expanded="isOpen"
      @click="$emit('toggle')"
    >
      <span data-cy="filters-list-item-label" class="filter-section__label">
        {{ label }}
      </span>
      <!-- Part of the button's accessible name, so an active filter is still
           announced when the section is collapsed. -->
      <span v-if="isActive" class="filter-section__active">
        {{ t("filters.section-active") }}
      </span>
      <unicon
        class="filter-section__chevron"
        :name="isOpen ? Unicons.AngleUp.name : Unicons.AngleDown.name"
        height="16"
      />
    </button>

    <BaseTooltip v-if="tooltip" position="top-end" :tooltip-offset="8">
      <template #activator="{ on }">
        <div v-on="on" class="filter-section__hint">
          <Unicon :name="Unicons.QuestionCircle.name" height="18" />
        </div>
      </template>
      <span>{{ tooltipText }}</span>
    </BaseTooltip>
  </div>
</template>

<script lang="ts" setup>
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";

defineProps({
  isActive: { type: Boolean, required: true },
  isOpen: { type: Boolean, required: true },
  label: { type: String, required: true },
  tooltip: { type: [String, Boolean], default: undefined },
  tooltipText: { type: String, default: "" },
});

defineEmits(["toggle"]);

const { t } = useI18n();
</script>

<style scoped>
.filter-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-ds-3);
  padding: var(--spacing-ds-6) var(--spacing-ds-9);
  border-top: 1px solid var(--color-border-subtle);
}

.filter-section__toggle {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-ds-5);
  border-radius: var(--radius-input);
  text-align: left;
  user-select: none;
}

.filter-section__toggle:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}

.filter-section__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: var(--text-label);
  font-weight: 700;
  color: var(--color-text-body);
}

/* An active section is marked by a chip, not by inverting the whole header:
   the header stays readable and the state stays legible when collapsed. */
.filter-section__active {
  flex: none;
  padding: 0 var(--spacing-ds-3);
  border-radius: var(--radius-chip);
  background-color: var(--color-accent);
  color: var(--color-text-on-accent);
  font-size: var(--text-micro);
  font-weight: 700;
}

.filter-section__chevron {
  flex: none;
  color: var(--color-text-secondary);
}

.filter-section__hint {
  display: inline-flex;
  color: var(--color-text-subtle);
}
</style>
