<template>
  <div class="flex items-center gap-2">
    <button
      type="button"
      data-cy="filters-toggle"
      :aria-expanded="expanded ? 'true' : 'false'"
      :aria-controls="controls"
      :aria-label="
        activeCount > 0
          ? `${$t('filters.filter')}, ${activeCount} ${$t('filters.active')}`
          : $t('filters.filter')
      "
      class="flex items-center gap-(--button-gap) min-h-(--control-height) p-(--button-md-padding) rounded-button border text-(length:--text-button-md) font-bold cursor-pointer"
      :class="
        expanded
          ? 'bg-surface text-text-accent-strong border-accent'
          : 'bg-surface text-text-body border-border-default hover:bg-surface-row-hover'
      "
      @click="emit('toggle')"
    >
      <unicon :name="Unicons.Filter.name" height="16" aria-hidden="true" />
      <span>{{ $t("filters.filter") }}</span>
      <span
        v-if="activeCount > 0"
        data-cy="filters-toggle-count"
        aria-hidden="true"
        class="p-(--chip-padding) rounded-pill bg-accent-light text-accent-ink text-hint font-bold leading-none"
        >{{ activeCount }}</span
      >
    </button>
    <!-- saved-searches.md: the applied saved search as a removable chip; in
         the rail header while the rail is open -->
    <button
      v-if="!expanded && savedSearchTitle"
      type="button"
      data-cy="filters-saved-search"
      class="inline-flex items-center gap-1 min-w-0 p-(--chip-padding) rounded-chip bg-surface text-text-body text-hint font-bold cursor-pointer"
      :aria-label="$t('saved-searches.remove-applied', { name: savedSearchTitle })"
      @click="emit('clearSavedSearch')"
    >
      <span class="truncate">{{ savedSearchTitle }}</span>
      <span
        v-if="savedSearchModified"
        data-cy="filters-saved-search-modified"
        :title="$t('saved-searches.modified')"
        aria-hidden="true"
        >•</span
      >
      <unicon :name="Unicons.Cross.name" height="12" aria-hidden="true" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { Unicons } from "@/types";

defineProps<{
  activeCount: number;
  expanded: boolean;
  // id of the filter rail this button opens
  controls: string;
  savedSearchTitle?: string;
  savedSearchModified?: boolean;
}>();

const emit = defineEmits<{
  (event: "toggle"): void;
  (event: "clearSavedSearch"): void;
}>();
</script>
