<template>
  <div
    v-show="open"
    data-cy="filters-pane"
    :class="
      isCompact
        ? 'fixed inset-0 z-context-menu flex flex-col justify-end bg-scrim'
        : 'flex flex-col w-(--filter-pane-width) shrink-0 min-h-0 border-r border-border-panel'
    "
    @click.self="emit('close')"
  >
    <!-- below md: a bottom sheet over a scrim instead of a column -->
    <div
      data-cy="filters-pane-sheet"
      :class="
        isCompact
          ? 'flex flex-col max-h-[85dvh] bg-surface rounded-t-(--sheet-radius) overflow-hidden shadow-(--shadow-overlay)'
          : 'contents'
      "
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
  </div>
</template>

<script lang="ts" setup>
import { isCompact } from "@/composables/useNavMenu";

defineProps<{ open: boolean; paneId: string }>();
const emit = defineEmits<{ (event: "close"): void }>();
</script>
