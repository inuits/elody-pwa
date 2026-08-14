<template>
  <Teleport :to="someModalIsOpened ? '.base-modal--opened' : 'body'">
    <Transition class="base-context-menu-container">
      <div
        @click.prevent
        v-if="contextMenu.isVisible"
        ref="menuEl"
        class="context-menu"
        role="menu"
        :style="getStyles()"
        @keydown="handleKeydown"
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

const menuEl = ref<HTMLElement | null>(null);

const getFocusableItems = (): HTMLElement[] =>
  Array.from(
    menuEl.value?.querySelectorAll<HTMLElement>(
      '[role="menuitem"], button, a, [tabindex]',
    ) ?? [],
  ).filter((el) => !el.hasAttribute("disabled"));

// Menu keyboard contract: arrows cycle, Home/End jump, Escape closes and
// returns focus to the trigger (the handler restores it).
const handleKeydown = (event: KeyboardEvent) => {
  const items = getFocusableItems();
  if (!items.length) return;
  const currentIndex = items.indexOf(document.activeElement as HTMLElement);
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    const delta = event.key === "ArrowDown" ? 1 : -1;
    const next = (currentIndex + delta + items.length) % items.length;
    items[next].focus();
  } else if (event.key === "Home") {
    event.preventDefault();
    items[0].focus();
  } else if (event.key === "End") {
    event.preventDefault();
    items[items.length - 1].focus();
  } else if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    props.contextMenu.close?.();
  }
};

watch(
  () => props.contextMenu.isVisible,
  async (visible) => {
    if (!visible) return;
    await nextTick();
    getFocusableItems()[0]?.focus();
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
.context-menu {
  position: fixed;
  z-index: var(--z-context-menu);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-overlay);
  min-width: 170px;
  padding: 4px;
}

.modal-enter-from .base-context-menu-container,
.modal-leave-to .base-context-menu-container {
  -webkit-transform: scale(0.5);
  transform: scale(0.5);
}

.context-menu div {
  padding: 6px 10px;
  border-radius: var(--radius-button);
  font-size: 12.5px;
  cursor: pointer;
}

.context-menu div:hover {
  background-color: var(--color-accent-wash);
}
</style>
