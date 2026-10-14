import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import BaseContextMenu from "../BaseContextMenu.vue";

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ someModalIsOpened: true }),
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
});
