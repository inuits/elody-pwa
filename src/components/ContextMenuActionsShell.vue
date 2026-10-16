<template>
  <div class="flex items-center justify-center pl-2 gap-2">
    <div v-if="hasPromotedActions" class="flex items-center gap-1 pr-2" @click.stop>
      <slot name="promoted" />
    </div>
    <div v-if="hasOverflowActions">
      <!-- Never a bare ⋮: the label is how the actions are found at all. -->
      <BaseButtonNew
        data-cy="overflow-menu-trigger"
        button-style="ghost"
        button-size="sm"
        :label="t('contextMenu.actions')"
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
      <base-context-menu :context-menu="contextMenuHandler.getContextMenu()">
        <slot name="overflow" />
      </base-context-menu>
    </div>
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
  // What the actions act on, for the trigger's accessible name.
  contextLabel?: string;
}>();

const { t } = useI18n();
const contextMenuHandler = ref<ContextMenuHandler>(new ContextMenuHandler());

const isOpen = computed<boolean>(
  () => contextMenuHandler.value.getContextMenu()?.isVisible ?? false,
);

const openContextMenu = (event: Event) => {
  contextMenuHandler.value.openContextMenu(
    { x: 0, y: 0 },
    event.currentTarget as HTMLElement,
  );
};

const toggleContextMenu = (event: Event) => {
  if (isOpen.value) contextMenuHandler.value.closeContextMenu();
  else openContextMenu(event);
};
</script>
