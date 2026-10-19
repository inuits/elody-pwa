<template>
  <div
    data-cy="filters-header"
    role="button"
    tabindex="0"
    :aria-expanded="expanded ? 'true' : 'false'"
    class="flex items-center gap-2 p-(--panel-header-pad) bg-surface-panel-header border border-border-panel cursor-pointer select-none"
    :class="expanded ? 'rounded-t-card' : 'rounded-card'"
    @click="emit('toggle')"
    @keydown.enter.stop.prevent="emit('toggle')"
    @keydown.space.prevent="emit('toggle')"
  >
    <!-- ui_kits/clients: accent-light band, "Filters" + white count chip;
         saved-searches.md: the applied saved search as a removable chip. -->
    <h2 class="m-0 text-table font-black text-text-panel-header">
      {{ $t("filters.filter") }}
    </h2>
    <span
      v-if="simpleSearchActive"
      data-cy="filters-disabled-label"
      class="flex items-center gap-1.5 text-hint text-text-panel-header"
    >
      <unicon :name="Unicons[DamsIcons.SearchGlass].name" height="14" />
      {{ $t("filters.disabled-simple-search") }}
    </span>
    <template v-else>
      <span
        data-cy="filters-active-count"
        role="status"
        class="p-(--chip-padding) rounded-pill bg-surface text-text-accent-strong text-hint font-bold whitespace-nowrap"
        >{{ activeCount }} {{ $t("filters.active") }}</span
      >
      <button
        v-if="savedSearchTitle"
        type="button"
        data-cy="filters-saved-search"
        class="inline-flex items-center gap-1 min-w-0 p-(--chip-padding) rounded-chip bg-surface text-text-body text-hint font-bold cursor-pointer"
        :aria-label="$t('saved-searches.remove-applied', { name: savedSearchTitle })"
        @click.stop="emit('clearSavedSearch')"
        @keydown.enter.stop
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
    </template>
    <span class="ml-auto flex shrink-0 text-text-panel-header" aria-hidden="true">
      <unicon
        :name="expanded ? Unicons.AngleUp.name : Unicons.AngleDown.name"
        height="18"
      />
    </span>
  </div>
</template>

<script lang="ts" setup>
import { DamsIcons } from "@/generated-types/queries";
import { Unicons } from "@/types";

defineProps<{
  activeCount: number;
  expanded: boolean;
  simpleSearchActive?: boolean;
  // The applied saved search, if any.
  savedSearchTitle?: string;
  savedSearchModified?: boolean;
}>();

const emit = defineEmits<{
  (event: "toggle"): void;
  (event: "clearSavedSearch"): void;
}>();
</script>
