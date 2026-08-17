<template>
  <Teleport :to="someModalIsOpened ? '.base-modal--opened' : 'body'">
    <Transition class="base-context-menu-container">
      <div
        @click.prevent
        v-if="contextMenu.isVisible"
        class="context-menu"
        :style="getStyles()"
      >
        <slot></slot>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { type ContextMenu } from "@/components/context-menu-actions/ContextMenuHandler";
import { ContextMenuDirection } from "@/generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";

const { someModalIsOpened } = useBaseModal();

const props = withDefaults(
  defineProps<{
    contextMenu: ContextMenu;
    direction?: ContextMenuDirection;
  }>(),
  {
    direction: ContextMenuDirection.Right,
  },
);

const getStyles = () => {
  const styles: { [key: string]: string } = { };

  if (
    document.body.clientWidth - props.contextMenu.position.x < 250 ||
    props.direction === ContextMenuDirection.Left
  ) {
    styles["right"] = `${
      document.body.clientWidth - props.contextMenu.position.x
    }px`;
  } else {
    styles["left"] = `${props.contextMenu.position.x}px`;
  }

  if (document.body.clientHeight - props.contextMenu.position.y < 250) {
    styles["bottom"] = `${
      document.body.clientHeight - props.contextMenu.position.y
    }px`;
  } else {
    styles["top"] = `${props.contextMenu.position.y}px`
  }

  return styles;
};
</script>

<style scoped>
/* The menu anatomy is the split button's: 8px radius, overlay shadow,
   12.5px items (split-button.md). */
.context-menu {
  position: fixed;
  z-index: var(--z-context-menu);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-overlay);
  font-size: var(--text-table);
  min-width: 120px;
}

.modal-enter-from .base-context-menu-container,
.modal-leave-to .base-context-menu-container {
  -webkit-transform: scale(0.5);
  transform: scale(0.5);
}

.context-menu div {
  padding: 8px 12px;
  cursor: pointer;
}

.context-menu div:hover {
  background-color: var(--color-surface-editable-hover);
}
</style>
