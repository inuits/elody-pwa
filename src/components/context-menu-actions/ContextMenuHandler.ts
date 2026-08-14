import { ref } from "vue";

export type ContextMenu = {
  isVisible: boolean;
  position: {
    x: number;
    y: number;
  };
};

const activeContextMenus = ref<ContextMenu[]>([]);

export class ContextMenuHandler {
  private contextMenu = ref<ContextMenu>({
    isVisible: false,
    position: { x: 0, y: 0 },
  });

  public addActiveContextMenu = (contextMenu: ContextMenu): void => {
    activeContextMenus.value.push(contextMenu);
  };
  public removeActiveContextMenu = (contextMenu: ContextMenu): void => {
    activeContextMenus.value = activeContextMenus.value.filter(
      (menu: ContextMenu) => menu.value !== contextMenu,
    );
  };
  public deactiveAllContextMenus = (): void => {
    activeContextMenus.value.map(
      (contextMenu: ContextMenu) => (contextMenu.value.isVisible = false),
    );
    activeContextMenus.value = [];
  };

  public getContextMenu = (): ContextMenu | undefined => {
    return this.contextMenu.value;
  };

  public openContextMenu = (position: { x: number; y: number }): void => {
    this.deactiveAllContextMenus();
    this.contextMenu.value.isVisible = true;
    this.contextMenu.value.position = position;
    this.addActiveContextMenu(this.contextMenu);
    document.addEventListener("click", this.closeContextMenu);
    document.addEventListener("wheel", this.closeContextMenu);
  };

  private closeContextMenu = (): void => {
    document.removeEventListener("click", this.closeContextMenu);
    document.removeEventListener("wheel", this.closeContextMenu);
    this.contextMenu.value.isVisible = false;
    this.contextMenu.value.position = { x: 0, y: 0 };
    this.removeActiveContextMenu(this.contextMenu.value);
  };
}
