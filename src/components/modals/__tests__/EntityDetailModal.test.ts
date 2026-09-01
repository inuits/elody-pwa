import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount, flushPromises } from "@vue/test-utils";
import { reactive, ref, computed, onMounted, nextTick } from "vue";
import useEntitySingle from "@/composables/useEntitySingle";
import EntityDetailModal from "@/components/modals/EntityDetailModal.vue";

const mocks = vi.hoisted(() => ({
  modalInfo: {} as Record<string, any>,
  closeModal: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({
    getModalInfo: () => mocks.modalInfo,
    closeModal: mocks.closeModal,
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
