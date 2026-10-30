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

  it("names its icon-only close button", () => {
    expect(
      getWrapper(true)
        .find("[data-testid='repetitive-step-modal-close']")
        .attributes("aria-label"),
    ).toBe("actions.labels.close");
  });

  it("is a dialog named by its title", () => {
    const wrapper = getWrapper(true, "Create web theme frames");
    const dialog = wrapper.find("dialog");
    const titleId = wrapper
      .find("[data-testid='repetitive-step-modal-title']")
      .attributes("id");
    expect(titleId).toBeTruthy();
    expect(dialog.attributes("aria-labelledby")).toBe(titleId);
  });
});

// modal.md, as BaseModal (V23): every modal shares scrim, shadow and header band
describe("RepetitiveStepModal handoff chrome", () => {
  it("draws the scrim and the modal shadow", () => {
    const dialog = getWrapper(true, "Omnibus").find("dialog");
    expect(dialog.classes()).toEqual(
      expect.arrayContaining(["shadow-modal", "backdrop:bg-scrim", "bg-surface"]),
    );
  });

  it("titles the dialog in the panel header band, as the other modals", () => {
    const wrapper = getWrapper(true, "Omnibus");
    const title = wrapper.find("[data-testid='repetitive-step-modal-title']");
    expect(title.element.tagName).toBe("H2");
    expect(title.classes()).toEqual(
      expect.arrayContaining([
        "text-(length:--text-panel-title)",
        "text-text-panel-header",
      ]),
    );
    expect(title.element.parentElement!.classList).toContain(
      "bg-surface-panel-header",
    );
  });

  it("uses the modal close button look", () => {
    const close = getWrapper(true, "Omnibus").find(
      "[data-testid='repetitive-step-modal-close']",
    );
    expect(close.classes()).toEqual(
      expect.arrayContaining(["rounded-button", "hover:bg-surface-muted"]),
    );
    expect(close.find("unicon-stub").attributes("height")).toBe("18");
  });
});
