import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import RepetitiveStepModal from "@/components/repetitiveForm/RepetitiveStepModal.vue";

// jsdom does not implement <dialog>.showModal/close — provide no-op stubs.
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

const getWrapper = (open = false, title = "") =>
  mount(RepetitiveStepModal, {
    props: { open, title },
    slots: { default: "<p data-testid='slot-content'>hi</p>" },
    global: { stubs: { unicon: true } },
  });

describe("RepetitiveStepModal", () => {
  it("renders slot content when open", () => {
    const wrapper = getWrapper(true);
    expect(wrapper.find("[data-testid='slot-content']").exists()).toBe(true);
  });

  it("renders the title in the modal header", () => {
    const wrapper = getWrapper(true, "Compose omnibus");
    expect(
      wrapper.find("[data-testid='repetitive-step-modal-title']").text(),
    ).toBe("Compose omnibus");
  });

  it("does not render slot content when closed", () => {
    const wrapper = getWrapper(false);
    expect(wrapper.find("[data-testid='slot-content']").exists()).toBe(false);
  });

  it("calls showModal when open becomes true", async () => {
    const wrapper = getWrapper(false);
    await wrapper.setProps({ open: true });
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it("emits close when the close button is clicked", async () => {
    const wrapper = getWrapper(true);
    await wrapper.find("[data-testid='repetitive-step-modal-close']").trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("calls showModal on mount when open starts true", () => {
    getWrapper(true);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });
});
