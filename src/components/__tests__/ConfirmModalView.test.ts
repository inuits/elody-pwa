import { describe, it, expect, beforeEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import ConfirmModalView from "@/components/ConfirmModalView.vue";
import { useConfirmModal } from "@/composables/useConfirmModal";

const mountView = () =>
  mount(ConfirmModalView, {
    global: { stubs: { BaseButtonNew: { props: ["label", "buttonStyle"], template: "<button :data-style='buttonStyle'>{{ label }}</button>" } } },
  });

// modal.md + pickers card: the title lives in the modal's header band; the
// body says what is lost; the footer holds Cancel next to the commit, right
describe("ConfirmModalView", () => {
  beforeEach(() => useConfirmModal().resolveConfirm("cancel"));

  it("leaves the title to the modal header and shows the message as the body", () => {
    useConfirmModal().confirm({ title: "Delete permanently?", message: "Gone for good.", confirmLabel: "Delete permanently", cancelLabel: "Cancel" });
    const wrapper = mountView();
    expect(wrapper.text()).not.toContain("Delete permanently?");
    expect(wrapper.find('[data-testid="confirm-message"]').text()).toBe("Gone for good.");
  });

  it("puts Cancel (ghost, focused first) before the commit in a footer on the right", () => {
    useConfirmModal().confirm({ title: "t", confirmLabel: "Delete permanently", cancelLabel: "Cancel", secondaryLabel: "Also media" });
    const footer = mountView().find('[data-testid="confirm-footer"]');
    expect(footer.classes()).toEqual(expect.arrayContaining(["justify-end", "border-t", "border-border-subtle"]));
    const buttons = footer.findAll("button");
    expect(buttons.map((b) => b.text())).toEqual(["Cancel", "Also media", "Delete permanently"]);
    expect(buttons[0].attributes("data-style")).toBe("ghost");
    expect(buttons[0].attributes("autofocus")).toBeDefined();
    expect(buttons[2].attributes("data-style")).toBe("danger");
  });

  it("moves focus to Cancel once the confirm renders", async () => {
    const wrapper = mount(ConfirmModalView, { attachTo: document.body });
    useConfirmModal().confirm({ title: "t", confirmLabel: "Delete", cancelLabel: "Cancel" });
    await flushPromises();
    expect(document.activeElement?.textContent?.trim()).toBe("Cancel");
    wrapper.unmount();
  });
});
