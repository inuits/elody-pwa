<template>
  <div
    v-if="contextMenu.isVisible"
    class="context-menu"
    :style="{
      top: `${contextMenu.position.y}px`,
      left: `${contextMenu.position.x}px`,
    }"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { ContextMenu } from "src/components/context-menu-actions/ContextMenuHandler";

const props = defineProps<{
  contextMenu: ContextMenu;
}>();
</script>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 1000;
  background-color: #fff;
  border: 1px solid #ccc;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  min-width: 120px;
}

.context-menu div {
  padding: 8px 12px;
  cursor: pointer;
}

.context-menu div:hover {
  background-color: #f0f0f0;
}
</style>
