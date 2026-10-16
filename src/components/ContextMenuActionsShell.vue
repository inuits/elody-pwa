<template>
  <div class="flex items-center justify-center pl-2 gap-2">
    <div
      v-if="split && hasPromotedActions && hasOverflowActions"
      role="group"
      class="split-button"
      @click.stop
    >
      <span class="split-button__primary"><slot name="promoted" /></span>
      <BaseButtonNew
        data-cy="split-button-chevron"
        class="split-button__chevron"
        button-style="primary"
        button-size="sm"
        :aria-label="
          contextLabel
            ? t('contextMenu.more-actions-for', { title: contextLabel })
            : t('contextMenu.more-actions')
        "
        aria-haspopup="menu"
        :aria-expanded="isOpen"
        @click.stop.prevent="toggleContextMenu"
        @keydown.down.prevent="openContextMenu"
      >
        <unicon
          :name="isOpen ? Unicons.AngleUp.name : Unicons.AngleDown.name"
          height="14"
        />
      </BaseButtonNew>
    </div>
    <template v-else>
      <div
        v-if="hasPromotedActions"
        class="flex items-center gap-1 pr-2"
        @click.stop
      >
        <slot name="promoted" />
      </div>
      <!-- Never a bare ⋮: the label is how the actions are found at all. -->
      <BaseButtonNew
        v-if="hasOverflowActions"
        data-cy="overflow-menu-trigger"
        class="overflow-menu-trigger"
        button-style="secondary"
        button-size="sm"
        :label="triggerLabel ?? t('contextMenu.actions')"
        :aria-label="
          contextLabel
            ? t('contextMenu.actions-for', { title: contextLabel })
            : undefined
        "
        :force-show-label="true"
        aria-haspopup="menu"
        :aria-expanded="isOpen"
        @click.stop.prevent="toggleContextMenu"
        @keydown.down.prevent="openContextMenu"
      >
        <unicon
          :name="isOpen ? Unicons.AngleUp.name : Unicons.AngleDown.name"
          height="14"
        />
      </BaseButtonNew>
    </template>
    <base-context-menu
      v-if="hasOverflowActions"
      :context-menu="contextMenuHandler.getContextMenu()"
    >
      <slot name="overflow" />
    </base-context-menu>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ContextMenuHandler } from "@/components/context-menu-actions/ContextMenuHandler";
import BaseContextMenu from "@/components/base/BaseContextMenu.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { Unicons } from "@/types";

defineProps<{
  hasPromotedActions: boolean;
  hasOverflowActions: boolean;
  // One promoted action plus overflow: join them in a split button.
  split?: boolean;
  // What the actions act on, for the trigger's accessible name.
  contextLabel?: string;
  // A more specific trigger label than "Actions" ("Saved searches").
  triggerLabel?: string;
}>();

const emit = defineEmits<{ (event: "open"): void }>();

const { t } = useI18n();
const contextMenuHandler = ref<ContextMenuHandler>(new ContextMenuHandler());

const isOpen = computed<boolean>(
  () => contextMenuHandler.value.getContextMenu()?.isVisible ?? false,
);

const openFrom = (anchor: HTMLElement) => {
  contextMenuHandler.value.openContextMenu({ x: 0, y: 0 }, anchor);
};

const openContextMenu = (event: Event) => {
  emit("open");
  openFrom(event.currentTarget as HTMLElement);
};

// For a parent action that opens this menu itself (a bulk "open dropdown").
defineExpose({ openFrom });

const toggleContextMenu = (event: Event) => {
  if (isOpen.value) contextMenuHandler.value.closeContextMenu();
  else openContextMenu(event);
};
</script>

<style scoped>
/* Two segments sharing one capsule (split-button.md). */
.split-button {
  display: inline-flex;
}

.split-button__primary :deep(button) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.overflow-menu-trigger {
  width: auto;
}

.split-button__chevron {
  width: auto;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-left: 1px solid var(--split-button-divider);
  padding-inline: var(--split-button-chevron-padding-x);
}

.split-button__chevron[aria-expanded="true"] {
  background-color: var(--color-accent-hover);
}
</style>
