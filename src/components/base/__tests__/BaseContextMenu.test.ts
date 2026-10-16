import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { defineComponent, h, nextTick, reactive, ref } from "vue";
import BaseContextMenu from "../BaseContextMenu.vue";
import type { ContextMenu } from "@/components/context-menu-actions/ContextMenuHandler";

const mocks = vi.hoisted(() => ({ someModalIsOpened: true }));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ someModalIsOpened: mocks.someModalIsOpened }),
}));

describe("BaseContextMenu", () => {
  it("survives mounting in the same render that opens its modal", async () => {
    const isModalOpen = ref(false);
    const ModalHost = defineComponent({
      setup: () => () =>
        h("dialog", { class: { "base-modal--opened": isModalOpen.value } }, [
          isModalOpen.value
            ? h(BaseContextMenu, {
                contextMenu: { isVisible: false, position: { x: 0, y: 0 } },
              })
            : null,
        ]),
    });
    const errors: unknown[] = [];
    const wrapper = mount(ModalHost, {
      attachTo: document.body,
      global: { config: { errorHandler: (error) => errors.push(error) } },
    });

    isModalOpen.value = true;
    await nextTick();
    isModalOpen.value = false;
    await nextTick();

    expect(errors).toEqual([]);
    wrapper.unmount();
  });

  describe("as a menu", () => {
    let anchor: HTMLButtonElement;
    let contextMenu: ContextMenu;

    const items = ["Open", "Dupliceer", "Verwijder"];
    const getMenu = () =>
      document.body.querySelector<HTMLElement>('[role="menu"]');
    const getItems = () =>
      Array.from(
        document.body.querySelectorAll<HTMLElement>('[role="menuitem"]'),
      );
    const press = (key: string) =>
      getMenu()!.dispatchEvent(
        new KeyboardEvent("keydown", { key, bubbles: true }),
      );

    const mountMenu = async () => {
      const wrapper = mount(BaseContextMenu, {
        props: { contextMenu },
        slots: {
          default: items
            .map((label) => `<a role="menuitem" tabindex="-1">${label}</a>`)
            .join(""),
        },
        attachTo: document.body,
      });
      contextMenu.isVisible = true;
      await nextTick();
      await nextTick();
      return wrapper;
    };

    beforeEach(() => {
      mocks.someModalIsOpened = false;
      Object.defineProperty(document.body, "clientWidth", {
        value: 1000,
        configurable: true,
      });
      Object.defineProperty(document.body, "clientHeight", {
        value: 800,
        configurable: true,
      });
      anchor = document.createElement("button");
      anchor.getBoundingClientRect = () =>
        ({ left: 100, right: 180, top: 20, bottom: 40 }) as DOMRect;
      document.body.appendChild(anchor);
      contextMenu = reactive({
        isVisible: false,
        position: { x: 0, y: 0 },
        anchor,
        close: vi.fn(() => (contextMenu.isVisible = false)),
      });
    });

    afterEach(() => {
      document.body.innerHTML = "";
      mocks.someModalIsOpened = true;
    });

    it("exposes menu semantics", async () => {
      await mountMenu();

      expect(getMenu()).not.toBeNull();
    });

    it("opens under its trigger rather than at the pointer", async () => {
      await mountMenu();

      expect(getMenu()!.style.top).toBe("40px");
      expect(getMenu()!.style.left).toBe("100px");
    });

    it("aligns to the trigger's right edge near the viewport edge", async () => {
      anchor.getBoundingClientRect = () =>
        ({ left: 900, right: 980, top: 20, bottom: 40 }) as DOMRect;
      await mountMenu();

      expect(getMenu()!.style.right).toBe("20px");
    });

    it("moves focus to the first item when it opens", async () => {
      await mountMenu();

      expect(document.activeElement).toBe(getItems()[0]);
    });

    it("cycles through the items with the arrow keys", async () => {
      await mountMenu();

      press("ArrowDown");
      expect(document.activeElement).toBe(getItems()[1]);
      press("ArrowUp");
      press("ArrowUp");
      expect(document.activeElement).toBe(getItems()[2]);
      press("Home");
      expect(document.activeElement).toBe(getItems()[0]);
      press("End");
      expect(document.activeElement).toBe(getItems()[2]);
    });

    it("closes on Escape and returns focus to its trigger", async () => {
      await mountMenu();

      press("Escape");

      expect(contextMenu.close).toHaveBeenCalled();
      expect(document.activeElement).toBe(anchor);
    });

    it("closes on Tab", async () => {
      await mountMenu();

      press("Tab");

      expect(contextMenu.close).toHaveBeenCalled();
    });
  });
});
