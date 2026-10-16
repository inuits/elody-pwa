<template>
  <Teleport defer :to="someModalIsOpened ? modalTeleportTarget() : 'body'">
    <Transition class="base-context-menu-container">
      <div
        ref="menu"
        role="menu"
        @click.prevent
        @keydown="onKeydown"
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
import { modalTeleportTarget } from "@/composables/useModalTeleportTarget";
import { nextTick, ref, watch } from "vue";

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

const menu = ref<HTMLElement>();

const getItems = (): HTMLElement[] =>
  Array.from(
    menu.value?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
  );

watch(
  () => props.contextMenu.isVisible,
  async (isVisible) => {
    if (!isVisible) return;
    await nextTick();
    getItems()[0]?.focus();
  },
);

const close = (returnFocus: boolean) => {
  props.contextMenu.close?.();
  if (returnFocus) props.contextMenu.anchor?.focus();
};

const onKeydown = (event: KeyboardEvent) => {
  const items = getItems();
  const current = items.indexOf(document.activeElement as HTMLElement);
  const focusAt = (index: number) =>
    items[(index + items.length) % items.length]?.focus();

  switch (event.key) {
    case "ArrowDown":
      focusAt(current + 1);
      break;
    case "ArrowUp":
      focusAt(current < 0 ? -1 : current - 1);
      break;
    case "Home":
      focusAt(0);
      break;
    case "End":
      focusAt(-1);
      break;
    case "Escape":
      close(true);
      break;
    case "Tab":
      // Focus goes back to the trigger first, so Tab continues from there.
      close(true);
      return;
    default:
      return;
  }
  event.preventDefault();
};

const getAnchoredStyles = (anchor: HTMLElement) => {
  const rect = anchor.getBoundingClientRect();
  const { clientWidth, clientHeight } = document.body;
  const styles: { [key: string]: string } = {};

  if (
    clientWidth - rect.left < 250 ||
    props.direction === ContextMenuDirection.Left
  ) {
    styles["right"] = `${clientWidth - rect.right}px`;
  } else {
    styles["left"] = `${rect.left}px`;
  }

  if (clientHeight - rect.bottom < 250) {
    styles["bottom"] = `${clientHeight - rect.top}px`;
  } else {
    styles["top"] = `${rect.bottom}px`;
  }

  return styles;
};

const getStyles = () => {
  if (props.contextMenu.anchor)
    return getAnchoredStyles(props.contextMenu.anchor);

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
.context-menu {
  position: fixed;
  z-index: var(--z-context-menu);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-overlay);
  font-size: var(--text-table);
  padding: var(--menu-padding);
  min-width: var(--menu-min-width);
}

.modal-enter-from .base-context-menu-container,
.modal-leave-to .base-context-menu-container {
  -webkit-transform: scale(0.5);
  transform: scale(0.5);
}
</style>
