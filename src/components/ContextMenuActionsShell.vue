<template>
  <div class="flex items-center justify-center pl-2 gap-2">
    <div
      v-if="hasPromotedActions"
      class="flex items-center gap-1 pr-2"
      @click.stop
    >
      <slot name="promoted" />
    </div>
    <div v-if="hasOverflowActions">
      <!--
        Labelled, never a bare ⋮: the label is how the actions are discovered
        at all (split-button.md, overflow-menu.md).
      -->
      <button
        type="button"
        data-cy="overflow-menu-trigger"
        class="overflow-menu-trigger"
        aria-haspopup="menu"
        :aria-expanded="isOpen"
        @click.stop.prevent="openContextMenu"
      >
        <span>{{ t("context-menu.actions") }}</span>
        <unicon
          :name="isOpen ? Unicons.AngleUp.name : Unicons.AngleDown.name"
          height="14"
        />
      </button>
      <base-context-menu :context-menu="contextMenuHandler.getContextMenu()">
        <slot name="overflow" />
      </base-context-menu>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { ContextMenuHandler } from "@/components/context-menu-actions/ContextMenuHandler";
import BaseContextMenu from "@/components/base/BaseContextMenu.vue";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";

defineProps<{
  hasPromotedActions: boolean;
  hasOverflowActions: boolean;
}>();

const { t } = useI18n();
const contextMenuHandler = ref<ContextMenuHandler>(new ContextMenuHandler());

const isOpen = computed<boolean>(
  () => contextMenuHandler.value.getContextMenu()?.isVisible ?? false,
);

const openContextMenu = (event: Event) => {
  contextMenuHandler.value.openContextMenu({
    x: (event as MouseEvent)?.clientX,
    y: (event as MouseEvent)?.clientY,
  });
};
</script>

<style scoped>
/* Ghost rect trigger: label plus the ⌄/⌃ pair, which replaces the
   right-pointing chevron the design system retired. */
.overflow-menu-trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-ds-2);
  padding: var(--spacing-ds-2) var(--spacing-ds-5);
  border-radius: var(--radius-button);
  font-size: var(--text-ui);
  color: var(--color-text-body);
  white-space: nowrap;
  transition: background-color var(--transition-duration-ui) var(--ease-ui);
}

.overflow-menu-trigger:hover {
  background-color: var(--color-surface-editable-hover);
}

.overflow-menu-trigger:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}
</style>
