<template>
  <div v-if="contextMenu.isVisible" class="context-menu" :style="getStyles()">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { ContextMenu } from "@/components/context-menu-actions/ContextMenuHandler";

// TODO (action menu group): specify the direction in prop
const props = defineProps<{
  contextMenu: ContextMenu;
  direction?: string;
}>();

const getStyles = () => {
  const styles: { [key: string]: string } = {
    top: `${props.contextMenu.position.y}px`,
  };

  if (props.direction === "left") {
    styles["right"] = `${window.innerWidth - props.contextMenu.position.x}px`;
  } else {
    styles["left"] = `${props.contextMenu.position.x}px`;
  }

  return styles;
};
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
