import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import ConfirmModal from "@/components/base/ConfirmModal.vue";
import { useConfirmModal } from "@/composables/useConfirmModal";

// modal.md: panel-shell header with the title and a close cross; the title
// names the dialog
describe("ConfirmModal", () => {
  it("gives BaseModal the confirm's title and its header with the close cross", () => {
    useConfirmModal().confirm({ title: "Delete permanently?", confirmLabel: "x", cancelLabel: "y" });
    const modal = shallowMount(ConfirmModal).findComponent({ name: "BaseModal" });
    expect(modal.props("title")).toBe("Delete permanently?");
    expect(modal.props("cancelButtonAvailabe")).toBe(false);
    useConfirmModal().resolveConfirm("cancel");
  });
});
