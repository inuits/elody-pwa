import { ref } from "vue";

type ContextMenu = {
  isVisible: boolean;
  position: {
    x: number;
    y: number;
  };
};

const contextMenu = ref<ContextMenu>({
  isVisible: false,
  position: { x: 0, y: 0 },
});

const useBaseContextMenu = () => {
  const openContextMenu = (position: { x: number; y: number }): void => {
    contextMenu.value.isVisible = true;
    contextMenu.value.position = position;
    document.addEventListener("click", closeContextMenu);
  };

  const closeContextMenu = (): void => {
    document.removeEventListener("click", closeContextMenu);
    contextMenu.value.isVisible = false;
    contextMenu.value.position = { x: 0, y: 0 };
  };

  return { openContextMenu, closeContextMenu, contextMenu };
};

export { useBaseContextMenu };
