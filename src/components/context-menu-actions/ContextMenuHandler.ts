import { ref } from "vue";
import useEditMode from "@/composables/useEdit";
const { setEditMode, disableEditMode } = useEditMode();

export type ContextMenu = {
  isVisible: boolean;
  position: {
    x: number;
    y: number;
  };
};

export class ContextMenuHandler {
  private contextMenu = ref<ContextMenu>();
  constructor() {
    this.contextMenu.value = {
      isVisible: false,
      position: { x: 0, y: 0 },
    };
  }

  public getContextMenu = (): ContextMenu => {
    return this.contextMenu.value;
  };
  public openContextMenu = (position: { x: number; y: number }): void => {
    this.contextMenu.value.isVisible = true;
    this.contextMenu.value.position = position;
    document.addEventListener("click", this.closeContextMenu);
    setEditMode();
  };
  private closeContextMenu = (): void => {
    document.removeEventListener("click", this.closeContextMenu);
    this.contextMenu.value.isVisible = false;
    this.contextMenu.value.position = { x: 0, y: 0 };
    disableEditMode();
  };
}
