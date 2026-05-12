<template>
  <div class="flex items-center justify-center pl-2 gap-2">
    <div v-if="hasPromotedActions" class="flex items-center gap-1 pr-2" @click.stop>
      <slot name="promoted" />
    </div>
    <div v-if="hasOverflowActions">
      <div @click.stop.prevent="openContextMenu" class="cursor-pointer">
        <unicon :name="Unicons.EllipsisVThinline.name" />
      </div>
      <base-context-menu :context-menu="contextMenuHandler.getContextMenu()">
        <slot name="overflow" />
      </base-context-menu>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { ContextMenuHandler } from "@/components/context-menu-actions/ContextMenuHandler";
import BaseContextMenu from "@/components/base/BaseContextMenu.vue";
import { Unicons } from "@/types";

defineProps<{
  hasPromotedActions: boolean;
  hasOverflowActions: boolean;
}>();

const contextMenuHandler = ref<ContextMenuHandler>(new ContextMenuHandler());

const openContextMenu = (event: Event) => {
  contextMenuHandler.value.openContextMenu({
    x: (event as MouseEvent)?.clientX,
    y: (event as MouseEvent)?.clientY,
  });
};
</script>
