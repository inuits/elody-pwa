import { describe, it, expect, vi, beforeEach } from "vitest";
import { defineComponent, h } from "vue";
import { mount, flushPromises } from "@vue/test-utils";
import { TypeModals, ModalStyle } from "@/generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";
import BulkOperationsModal from "../BulkOperationsModal.vue";

const state = vi.hoisted(() => ({
  confirmChoice: "confirm",
  confirmCalls: 0,
}));

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock("@/composables/useConfirmModal", () => ({
  useConfirmModal: () => ({
    confirm: async () => {
      state.confirmCalls++;
      return state.confirmChoice;
    },
  }),
}));

const BaseModalStub = defineComponent({
  name: "BaseModal",
  emits: ["hideModal"],
  setup: (_, { slots }) => () => h("div", slots.default?.()),
});

const mountModal = () =>
  mount(BulkOperationsModal, {
    global: {
      stubs: {
        BaseModal: BaseModalStub,
        BulkOperationsExportCsv: true,
        BulkOperationsDeleteEntities: true,
        BulkOperationsDeleteRelations: true,
        BulkOperationsEditModal: true,
        BulkOperationsMergeModal: true,
      },
    },
  });

describe("BulkOperationsModal closing", () => {
  const modal = useBaseModal();

  beforeEach(() => {
    modal.closeAllModals();
    state.confirmChoice = "confirm";
    state.confirmCalls = 0;
    modal.openModal(TypeModals.BulkOperationsEdit, ModalStyle.Center);
  });

  it("closes bulk edit straight away when nothing was changed", async () => {
    const wrapper = mountModal();
    wrapper.findComponent(BaseModalStub).vm.$emit("hideModal");
    await flushPromises();

    expect(state.confirmCalls).toBe(0);
    expect(modal.getModalInfo(TypeModals.BulkOperationsEdit).open).toBe(false);
  });

  it("keeps bulk edit open when discarding unsaved changes is cancelled", async () => {
    modal.changeCloseConfirmation(TypeModals.BulkOperationsEdit, true);
    state.confirmChoice = "cancel";
    const wrapper = mountModal();
    wrapper.findComponent(BaseModalStub).vm.$emit("hideModal");
    await flushPromises();

    expect(state.confirmCalls).toBe(1);
    expect(modal.getModalInfo(TypeModals.BulkOperationsEdit).open).toBe(true);
  });

  it("closes bulk edit once discarding unsaved changes is confirmed", async () => {
    modal.changeCloseConfirmation(TypeModals.BulkOperationsEdit, true);
    const wrapper = mountModal();
    wrapper.findComponent(BaseModalStub).vm.$emit("hideModal");
    await flushPromises();

    expect(state.confirmCalls).toBe(1);
    expect(modal.getModalInfo(TypeModals.BulkOperationsEdit).open).toBe(false);
    expect(
      modal.getModalInfo(TypeModals.BulkOperationsEdit).closeConfirmation,
    ).toBe(false);
  });
});
