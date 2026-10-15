import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { ModalStyle, TypeModals } from "@/generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";
import RelationPickerModal from "@/components/metadata/RelationPickerModal.vue";

const EntityPickerStub = {
  name: "EntityPickerComponent",
  props: [
    "entityUuid",
    "acceptedTypes",
    "computedFilters",
    "entityPickerMode",
    "selectionLimit",
    "context",
  ],
  emits: ["entitiesSelected"],
  template: "<div data-cy='entity-picker' />",
};

const mountModal = (props: Record<string, unknown> = {}) =>
  mount(RelationPickerModal, {
    props: {
      label: "Gezelschap",
      entityId: "PR-1",
      acceptedType: "company",
      filters: [{ type: "type", value: "company" }],
      single: false,
      ...props,
    },
    global: {
      stubs: {
        BaseModal: { template: "<div><slot /></div>" },
        EntityPickerComponent: EntityPickerStub,
        unicon: true,
      },
    },
  });

const picker = (wrapper: ReturnType<typeof mountModal>) =>
  wrapper.findComponent({ name: "EntityPickerComponent" });

describe("RelationPickerModal", () => {
  const { openModal, closeModal, getModalInfo } = useBaseModal();

  beforeEach(() => closeModal(TypeModals.RelationPicker));

  it("mounts the picker only while it is open", async () => {
    const wrapper = mountModal();
    expect(picker(wrapper).exists()).toBe(false);
    openModal(TypeModals.RelationPicker, ModalStyle.Center);
    await nextTick();
    expect(picker(wrapper).exists()).toBe(true);
  });

  it("asks the picker for the field's entities, returning them instead of saving", async () => {
    const wrapper = mountModal();
    openModal(TypeModals.RelationPicker, ModalStyle.Center);
    await nextTick();
    expect(picker(wrapper).props()).toMatchObject({
      entityUuid: "PR-1",
      acceptedTypes: ["company"],
      computedFilters: [{ type: "type", value: "company" }],
      entityPickerMode: "emit",
      selectionLimit: 0,
      context: BulkOperationsContextEnum.RelationPickerModal,
    });
    expect(wrapper.find("h3").text()).toBe("Gezelschap");
  });

  it("lets a single select pick one entity", async () => {
    const wrapper = mountModal({ single: true });
    openModal(TypeModals.RelationPicker, ModalStyle.Center);
    await nextTick();
    expect(picker(wrapper).props("selectionLimit")).toBe(1);
  });

  it("hands the picked entities back with their labels and closes", async () => {
    const wrapper = mountModal();
    openModal(TypeModals.RelationPicker, ModalStyle.Center);
    await nextTick();
    picker(wrapper).vm.$emit("entitiesSelected", [
      { id: "c-1", value: "Ghent Arts Centre" },
      { id: "c-2" },
    ]);
    expect(wrapper.emitted("picked")?.[0]).toEqual([
      [
        { label: "Ghent Arts Centre", value: "c-1" },
        { label: "c-2", value: "c-2" },
      ],
    ]);
    expect(getModalInfo(TypeModals.RelationPicker).open).toBe(false);
  });

  it("closes from a named close button", async () => {
    const wrapper = mountModal();
    openModal(TypeModals.RelationPicker, ModalStyle.Center);
    await nextTick();
    const close = wrapper.find('[data-cy="relation-picker-close"]');
    expect(close.element.tagName).toBe("BUTTON");
    expect(close.attributes("aria-label")).toBe("Close");
    await close.trigger("click");
    expect(getModalInfo(TypeModals.RelationPicker).open).toBe(false);
  });
});
