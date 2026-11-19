import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount, flushPromises } from "@vue/test-utils";
import { reactive, ref, computed, onMounted, nextTick } from "vue";
import useEntitySingle from "@/composables/useEntitySingle";
import EntityDetailModal from "@/components/modals/EntityDetailModal.vue";
import { useScopedEntityNavigation } from "@/composables/useScopedEntityNavigation";

const mocks = vi.hoisted(() => ({
  modalInfo: {} as Record<string, any>,
  closeModal: vi.fn(),
  refetch: vi.fn(),
  push: vi.fn(),
  navigate: undefined as undefined | ((location: any) => void),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: mocks.push,
    resolve: (location: any) => ({ params: location.params ?? {} }),
  }),
}));

vi.mock("@/helpers", () => ({
  getEntityTitle: (entity: any) => entity?.intialValues?.name ?? "",
  mapUrlToEntityType: () => undefined,
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({
    getModalInfo: () => mocks.modalInfo,
    closeModal: mocks.closeModal,
    updateModal: (_type: string, info: Record<string, any>) =>
      Object.assign(mocks.modalInfo, info),
  }),
}));

vi.mock("@vue/apollo-composable", () => ({
  useQuery: () => ({
    result: computed(() =>
      mocks.modalInfo.entityId
        ? {
            Entity: {
              id: mocks.modalInfo.entityId,
              intialValues: { name: "Jan Janssens" },
            },
          }
        : null,
    ),
    refetch: mocks.refetch,
    loading: ref(false),
  }),
}));

// mirrors the real EntitySingle: it claims the module-scoped single-entity
// state for whatever entity it renders, modal or page
vi.mock("@/views/EntitySingle.vue", () => ({
  default: {
    name: "EntitySingle",
    props: ["entityId", "entityType", "viewOnly"],
    template: "<div data-testid='entity-single' />",
    setup(props: { entityId: string; entityType: string }) {
      const { setEntityUuid, setEntityType, setRefetch } = useEntitySingle();
      mocks.navigate = useScopedEntityNavigation().navigate;
      setRefetch(() => undefined);
      onMounted(() => {
        setEntityUuid(props.entityId);
        setEntityType(props.entityType);
      });
    },
  },
}));

const getWrapper = () =>
  shallowMount(EntityDetailModal, {
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        BaseModal: { template: "<div><slot /></div>" },
        EntitySingle: false,
        ListItemSkeleton: true,
        unicon: true,
      },
    },
  });

const pageRefetch = () => undefined;

const openWithAuthor = () =>
  Object.assign(mocks.modalInfo, {
    open: true,
    entityId: "PERS-1",
    entityType: "person",
  });

describe("EntityDetailModal — single-entity state of the page behind it", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.modalInfo = reactive({
      open: false,
      entityId: "",
      entityType: "",
    });
    const { setEntityUuid, setEntityType, setRefetch } = useEntitySingle();
    setEntityUuid("W-HOST");
    setEntityType("work");
    setRefetch(pageRefetch);
  });

  it("gives the page its own entity identity back when the modal closes", async () => {
    const wrapper = getWrapper();
    await flushPromises();

    openWithAuthor();
    await flushPromises();
    expect(useEntitySingle().getEntityUuid()).toBe("PERS-1");

    mocks.modalInfo.open = false;
    await nextTick();

    expect(useEntitySingle().getEntityUuid()).toBe("W-HOST");
    expect(useEntitySingle().getEntityType()).toBe("work");
    expect(useEntitySingle().getRefetch()).toBe(pageRefetch);
    wrapper.unmount();
  });

  it("restores the identity again after a second peek", async () => {
    const wrapper = getWrapper();
    await flushPromises();

    openWithAuthor();
    await flushPromises();
    mocks.modalInfo.open = false;
    await nextTick();
    openWithAuthor();
    await flushPromises();
    mocks.modalInfo.open = false;
    await nextTick();

    expect(useEntitySingle().getEntityUuid()).toBe("W-HOST");
    wrapper.unmount();
  });

  it("keeps the entity of the modal while it is open", async () => {
    const wrapper = getWrapper();
    await flushPromises();

    openWithAuthor();
    await flushPromises();

    expect(useEntitySingle().getEntityUuid()).toBe("PERS-1");
    expect(useEntitySingle().getEntityType()).toBe("person");
    wrapper.unmount();
  });
});

describe("EntityDetailModal — navigating to a relation", () => {
  const goTo = (type: string, id: string) =>
    mocks.navigate!({ name: "SingleEntity", params: { type, id } });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.modalInfo = reactive({
      open: false,
      entityId: "",
      entityType: "",
    });
  });

  it("shows the relation inside the modal instead of the page", async () => {
    const wrapper = getWrapper();
    openWithAuthor();
    await flushPromises();

    goTo("work", "W-2");
    await flushPromises();

    expect(mocks.push).not.toHaveBeenCalled();
    expect(mocks.modalInfo.entityId).toBe("W-2");
    expect(mocks.modalInfo.entityType).toBe("work");
    expect(mocks.modalInfo.open).toBe(true);
    wrapper.unmount();
  });

  it("offers no back button on the entity the modal opened with", async () => {
    const wrapper = getWrapper();
    openWithAuthor();
    await flushPromises();

    expect(
      wrapper.find("[data-cy='entity-detail-modal-back']").exists(),
    ).toBe(false);
    wrapper.unmount();
  });

  it("goes back to the previous entity", async () => {
    const wrapper = getWrapper();
    openWithAuthor();
    await flushPromises();
    goTo("work", "W-2");
    goTo("expression", "E-3");
    await flushPromises();

    await wrapper.find("[data-cy='entity-detail-modal-back']").trigger("click");
    expect(mocks.modalInfo.entityId).toBe("W-2");
    expect(mocks.modalInfo.entityType).toBe("work");

    await wrapper.find("[data-cy='entity-detail-modal-back']").trigger("click");
    expect(mocks.modalInfo.entityId).toBe("PERS-1");
    expect(mocks.modalInfo.entityType).toBe("person");
    expect(
      wrapper.find("[data-cy='entity-detail-modal-back']").exists(),
    ).toBe(false);
    wrapper.unmount();
  });

  it("forgets the trail when the modal closes", async () => {
    const wrapper = getWrapper();
    openWithAuthor();
    await flushPromises();
    goTo("work", "W-2");
    await flushPromises();

    mocks.modalInfo.open = false;
    await nextTick();
    openWithAuthor();
    await flushPromises();

    expect(
      wrapper.find("[data-cy='entity-detail-modal-back']").exists(),
    ).toBe(false);
    wrapper.unmount();
  });

  it("ignores a link to the entity that is already shown", async () => {
    const wrapper = getWrapper();
    openWithAuthor();
    await flushPromises();

    goTo("person", "PERS-1");
    await flushPromises();

    expect(
      wrapper.find("[data-cy='entity-detail-modal-back']").exists(),
    ).toBe(false);
    wrapper.unmount();
  });
});
