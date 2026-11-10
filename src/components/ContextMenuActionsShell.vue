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
      <!-- small screen: no room for the label; the ⋮ opens a bottom sheet
           and keeps the name. A list row's ⋮ sits under its "Actions"
           column header. -->
      <BaseButtonNew
        v-if="hasEllipsisTrigger"
        data-cy="overflow-menu-trigger"
        :data-preview-for="hasCompactMenu ? rowSheet?.id : undefined"
        class="overflow-menu-trigger"
        button-style="ghost"
        :aria-label="
          contextLabel
            ? t('contextMenu.actions-for', { title: contextLabel })
            : (triggerLabel ?? t('contextMenu.actions'))
        "
        aria-haspopup="menu"
        :aria-expanded="isOpen"
        @click.stop.prevent="toggleContextMenu"
      >
        <unicon :name="Unicons.EllipsisV.name" height="22" />
      </BaseButtonNew>
      <!-- Outside a list row, never a bare ⋮: the label is how the actions
           are found at all. -->
      <BaseButtonNew
        v-else-if="hasOverflowActions"
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
      v-if="hasOverflowActions || hasCompactMenu"
      :context-menu="contextMenuHandler.getContextMenu()"
    >
      <template v-if="hasCompactMenu && rowSheet">
        <div
          data-cy="row-sheet-header"
          class="flex items-center gap-3 p-(--menu-item-padding) pb-3 mb-1 border-b border-border-subtle"
        >
          <div
            class="flex items-center justify-center shrink-0 size-(--sheet-thumb-size) rounded-sm overflow-hidden bg-surface-muted text-text-subtle"
          >
            <ImageViewer
              v-if="rowSheet.thumbnailUrl"
              height-class="h-full"
              width-class="w-full object-cover"
              :url="rowSheet.thumbnailUrl"
              :media-is-link="rowSheet.thumbnailIsLink"
            />
            <unicon v-else :name="Unicons.Image.name" height="22" />
          </div>
          <span class="min-w-0 truncate font-bold">{{ rowSheet.title }}</span>
        </div>
        <BaseContextMenuItem
          v-if="rowSheet.preview"
          :icon="Unicons.Eye.name"
          :label="t('preview-component.open')"
          @clicked="rowSheet.preview()"
        />
      </template>
      <slot name="overflow" />
    </base-context-menu>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ContextMenuHandler } from "@/components/context-menu-actions/ContextMenuHandler";
import BaseContextMenu from "@/components/base/BaseContextMenu.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { Unicons } from "@/types";
import { isCompact } from "@/composables/useNavMenu";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import ImageViewer from "@/components/base/ImageViewer.vue";
import { rowSheetKey } from "@/components/context-menu-actions/rowSheet";

const props = defineProps<{
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

// Set by a list row; only the small-screen sheet shows it.
const rowSheet = inject(rowSheetKey, undefined);
const hasCompactMenu = computed<boolean>(
  () =>
    isCompact.value &&
    (props.hasOverflowActions || !!rowSheet?.value.preview),
);
const hasEllipsisTrigger = computed<boolean>(
  () => hasCompactMenu.value || (!!rowSheet && props.hasOverflowActions),
);

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
