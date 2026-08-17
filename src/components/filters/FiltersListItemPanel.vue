<template>
  <div
    data-cy="filters-list-item-panel"
    class="flex flex-col gap-4 p-6 bg-accent-highlight"
  >
    <div class="flex w-full justify-start gap-4">
      <AdvancedDropdown
        data-cy="filter-matcher-dropdown"
        class="max-h-9"
        :model-value="selectedMatcher"
        :options="matchers"
        :label="defaultLabel"
        :clearable="false"
        :show-menu-header="false"
        label-position="inline"
        @update:model-value="$emit('update:selected-matcher', $event)"
      />
      <div class="grow"></div>
      <!-- Clearing one filter is consequence-light, so it is a link that acts
           at once rather than a commit-coloured button — commit teal is the
           colour of writing something (filter-panel.md §Round 2). -->
      <button
        type="button"
        data-cy="filter-clear"
        class="filter-clear"
        :disabled="!selectedMatcher"
        @click="$emit('reset')"
      >
        {{ t("filters.clear-filter") }}
      </button>
    </div>
    <slot v-if="selectedMatcher" />
  </div>
</template>

<script lang="ts" setup>
import type { DropdownOption } from "@/generated-types/queries";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";
import { useI18n } from "vue-i18n";

defineProps({
  matchers: {
    type: Array as () => DropdownOption[],
    required: true,
  },
  selectedMatcher: {
    type: String,
    default: undefined,
  },
  defaultLabel: {
    type: String,
    required: true,
  },
});

defineEmits(["update:selected-matcher", "reset"]);

const { t } = useI18n();
</script>

<style scoped>
.filter-clear {
  flex: none;
  align-self: center;
  font-size: var(--text-label);
  color: var(--color-text-link);
  text-decoration: underline;
  border-radius: var(--radius-input);
  padding: 0 var(--spacing-ds-3);
}

.filter-clear:hover:not(:disabled) {
  color: var(--color-text-link-hover);
}

.filter-clear:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}

.filter-clear:disabled {
  color: var(--color-text-subtle);
  text-decoration: none;
  cursor: default;
}
</style>
