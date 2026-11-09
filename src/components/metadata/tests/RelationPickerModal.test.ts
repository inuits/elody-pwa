import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { ModalStyle, TypeModals } from "@/generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    te: (key: string) => key === "entity-translations.person",
    t: (key: string, args?: unknown) =>
      key === "entity-translations.person"
        ? "Person-label"
        : Array.isArray(args)
          ? `${key}:${args.join(",")}`
          : key,
  }),
}));

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
    "searchByTypeRoute",
  ],
  emits: ["entitiesSelected"],
  template: "<div data-cy='entity-picker' />",
};

const mountModal = (props: Record<string, unknown> = {}) =>
  mount(RelationPickerModal, {
    props: {
      entityId: "PR-1",
      acceptedType: "company",
      filters: [{ type: "type", value: "company" }],
      single: false,
      ...props,
    },
    global: {
      mocks: {},
      stubs: {
        BaseModal: {
          name: "BaseModal",
          props: ["title", "cancelButtonAvailabe"],
          emits: ["hideModal"],
          template: "<div><slot /></div>",
        },
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
      searchByTypeRoute: true,
    });
  });

  it("leaves out the field's match-all text filters so the picker's search applies", async () => {
    const wrapper = mountModal({
      filters: [
        { type: "text", key: ["name"], value: "*", match_exact: false },
        { type: "text", key: ["code"], value: "PR", match_exact: false },
        { type: "type", value: "company" },
      ],
    });
    openModal(TypeModals.RelationPicker, ModalStyle.Center);
    await nextTick();
    expect(picker(wrapper).props("computedFilters")).toEqual([
      { type: "text", key: ["code"], value: "PR", match_exact: false },
      { type: "type", value: "company" },
    ]);
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

  // entity-picker.md: panel-shell header "Kies {type}" with the close cross,
  // the title naming the dialog (BaseModal)
  it("titles the modal header after the entity type, with its close cross", async () => {
    const wrapper = mountModal();
    openModal(TypeModals.RelationPicker, ModalStyle.Center);
    await nextTick();
    const modal = wrapper.findComponent({ name: "BaseModal" });
    expect(modal.props("title")).toBe("inline-edit.browse-title:company");
    expect(modal.props("cancelButtonAvailabe")).toBeFalsy();
    expect(wrapper.find("h3").exists()).toBe(false);
    modal.vm.$emit("hideModal");
    expect(getModalInfo(TypeModals.RelationPicker).open).toBe(false);
  });

  it("names the type in words when it has a translation", async () => {
    const wrapper = mountModal({ acceptedType: "person" });
    openModal(TypeModals.RelationPicker, ModalStyle.Center);
    await nextTick();
    expect(wrapper.findComponent({ name: "BaseModal" }).props("title")).toBe(
      "inline-edit.browse-title:person-label",
    );
  });
});
