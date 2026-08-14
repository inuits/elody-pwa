import { ref } from "vue";

export type ContextMenu = {
  isVisible: boolean;
  position: {
    x: number;
    y: number;
  };
  close?: () => void;
};

const activeContextMenus = ref<ContextMenu[]>([]);

export class ContextMenuHandler {
  private contextMenu = ref<ContextMenu>({
    isVisible: false,
    position: { x: 0, y: 0 },
    close: () => this.closeContextMenu(),
  });
  private triggerElement: HTMLElement | undefined = undefined;

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

  // The menu opens below its trigger when one is given (so keyboard
  // activation positions correctly); bare coordinates remain supported for
  // genuine right-click menus.
  public openContextMenu = (
    position: { x: number; y: number },
    trigger?: HTMLElement | EventTarget | null,
  ): void => {
    this.deactiveAllContextMenus();
    this.triggerElement =
      trigger instanceof HTMLElement
        ? (trigger.closest("button, [role='button']") as HTMLElement) ?? trigger
        : undefined;
    if (this.triggerElement) {
      const rect = this.triggerElement.getBoundingClientRect();
      position = { x: rect.right, y: rect.bottom + 2 };
      this.triggerElement.setAttribute("aria-expanded", "true");
    }
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
    if (this.triggerElement) {
      this.triggerElement.setAttribute("aria-expanded", "false");
      this.triggerElement.focus();
      this.triggerElement = undefined;
    }
  };
}
