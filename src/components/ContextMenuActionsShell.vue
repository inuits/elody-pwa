<template>
  <div class="flex items-center justify-center pl-2 gap-2">
    <div
      v-if="hasPromotedActions"
      class="flex items-center gap-1 pr-2"
      @click.stop
    >
      <slot name="promoted" />
    </div>
    <div
      v-if="primaryLabel || hasOverflowActions"
      class="flex items-stretch"
      @click.stop
    >
      <button
        v-if="primaryLabel"
        type="button"
        data-cy="split-button-primary"
        class="rounded-l-md border border-neutral-40 bg-neutral-white px-3 py-0.5 text-sm font-bold text-text-body whitespace-nowrap cursor-pointer hover:bg-accent-light hover:border-accent-accent focus-visible:outline-2 focus-visible:outline-accent-accent disabled:opacity-45 disabled:cursor-not-allowed"
        :class="{ 'rounded-r-md': !hasOverflowActions }"
        :disabled="primaryDisabled"
        @click.stop.prevent="emit('primary')"
      >
        {{ primaryLabel }}
      </button>
      <template v-if="hasOverflowActions">
        <button
          v-if="primaryLabel || menuLabel"
          type="button"
          data-cy="split-button-caret"
          aria-haspopup="menu"
          :aria-label="menuLabel || t('context-menu.more-actions')"
          class="flex items-center rounded-r-md border border-neutral-40 bg-neutral-white px-1 py-0.5 text-sm font-bold text-text-body whitespace-nowrap cursor-pointer hover:bg-accent-light hover:border-accent-accent focus-visible:outline-2 focus-visible:outline-accent-accent"
          :class="{ 'rounded-l-md px-3': !primaryLabel, '-ml-px': primaryLabel }"
          @click.stop.prevent="openContextMenu"
        >
          <span v-if="!primaryLabel">{{ menuLabel }}</span>
          <unicon :name="Unicons.AngleDown.name" height="16" />
        </button>
        <div
          v-else
          @click.stop.prevent="openContextMenu"
          class="cursor-pointer rounded-md p-1 hover:bg-accent-highlight"
        >
          <unicon :name="Unicons.EllipsisVThinline.name" />
        </div>
        <base-context-menu :context-menu="contextMenuHandler.getContextMenu()">
          <slot name="overflow" />
        </base-context-menu>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { ContextMenuHandler } from "@/components/context-menu-actions/ContextMenuHandler";
import BaseContextMenu from "@/components/base/BaseContextMenu.vue";
import { Unicons } from "@/types";

withDefaults(
  defineProps<{
    hasPromotedActions: boolean;
    hasOverflowActions: boolean;
    // Split-button anatomy: a labeled, always-visible primary action with
    // the overflow menu behind a caret. When neither primaryLabel nor
    // menuLabel is given the shell falls back to the legacy bare ⋮ trigger.
    primaryLabel?: string;
    primaryDisabled?: boolean;
    menuLabel?: string;
  }>(),
  {
    primaryLabel: undefined,
    primaryDisabled: false,
    menuLabel: undefined,
  },
);

const emit = defineEmits<{
  (event: "primary"): void;
}>();

const { t } = useI18n();

const contextMenuHandler = ref<ContextMenuHandler>(new ContextMenuHandler());

const openContextMenu = (event: Event) => {
  contextMenuHandler.value.openContextMenu({
    x: (event as MouseEvent)?.clientX,
    y: (event as MouseEvent)?.clientY,
  });
};
</script>
