<template>
  <div
    v-show="open"
    data-cy="filters-pane"
    class="flex flex-col w-(--filter-pane-width) shrink-0 min-h-0 border-r border-border-panel"
  >
    <!-- the open pane's top row, level with the list band: the Filters
         button teleports here -->
    <div
      :data-filters-pane-head="paneId"
      class="flex items-center gap-2 p-(--list-band-pad) bg-surface-panel-header border-b border-border-panel rounded-tl-card"
    />
    <!-- FiltersBase teleports here -->
    <div
      :data-filters-pane-body="paneId"
      class="flex-1 min-h-0 overflow-y-auto"
    />
  </div>
</template>

<script lang="ts" setup>
defineProps<{ open: boolean; paneId: string }>();
</script>
