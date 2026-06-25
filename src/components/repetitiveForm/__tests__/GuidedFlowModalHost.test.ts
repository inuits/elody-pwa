import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { reactive } from "vue";
import {
  enableAutoUnmount,
  flushPromises,
  shallowMount,
} from "@vue/test-utils";
import GuidedFlowModalHost from "@/components/repetitiveForm/GuidedFlowModalHost.vue";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  closeModal: vi.fn(),
  modalInfo: { open: false, formQuery: undefined } as {
    open: boolean;
    formQuery?: string;
  },
  loadDocument: vi.fn(),
  apolloQuery: vi.fn(),
}));

const modalInfo = reactive<{ open: boolean; formQuery?: string }>({
  open: false,
  formQuery: undefined,
});
// the hoisted mock factory below resolves modal info through this indirection
mocks.modalInfo = modalInfo;

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mocks.push }),
  useRoute: () => ({}),
}));
vi.mock("@/main", () => ({
  apolloClient: { query: (...args: any[]) => mocks.apolloQuery(...args) },
}));
vi.mock("@/composables/useImport", () => ({
  useImport: () => ({ loadDocument: mocks.loadDocument }),
}));
vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({
    getModalInfo: () => mocks.modalInfo,
    closeModal: mocks.closeModal,
  }),
}));
vi.mock("@/components/repetitiveForm/RepetitiveFlow.vue", () => ({
  default: {
    name: "RepetitiveFlow",
    props: ["open", "config"],
    emits: ["close", "finished"],
    template: "<div data-testid='flow-stub' />",
  },
}));

const flowDocument = { kind: "Document", definitions: [] };

// Shaped like the real self-describing query response: aliased step arrays.
const rawOmnibusResult = {
  __typename: "RepetitiveForm",
  repeatable: true,
  work: [
    {
      __typename: "RepetitiveStep",
      key: "work",
      entityType: "work",
      createForm: "GetWorkCreationForm",
    },
  ],
  finalize: {
    __typename: "RepetitiveFinalize",
    entityType: "manifestation",
    createForm: "GetManifestationCreationForm",
    relations: [],
  },
};

const getWrapper = () => shallowMount(GuidedFlowModalHost);
const flow = (w: ReturnType<typeof getWrapper>) =>
  w.findComponent({ name: "RepetitiveFlow" });

const openModal = async (formQuery = "GetRepetitiveFormForOmnibus") => {
  modalInfo.formQuery = formQuery;
  modalInfo.open = true;
  await flushPromises();
};

enableAutoUnmount(afterEach);

describe("GuidedFlowModalHost", () => {
  beforeEach(() => {
    mocks.push.mockReset();
    mocks.closeModal.mockReset();
    mocks.loadDocument.mockReset();
    mocks.apolloQuery.mockReset();
    modalInfo.open = false;
    modalInfo.formQuery = undefined;
    mocks.loadDocument.mockResolvedValue(flowDocument);
    mocks.apolloQuery.mockResolvedValue({
      data: { GetRepetitiveForm: rawOmnibusResult },
    });
  });

  it("loads the query named by the modal's formQuery and executes it on open", async () => {
    getWrapper();
    expect(mocks.loadDocument).not.toHaveBeenCalled();
    await openModal();
    expect(mocks.loadDocument).toHaveBeenCalledWith(
      "GetRepetitiveFormForOmnibus",
    );
    expect(mocks.apolloQuery).toHaveBeenCalledWith(
      expect.objectContaining({ query: flowDocument }),
    );
  });

  it("does not query when the modal has no formQuery", async () => {
    getWrapper();
    await openModal("");
    modalInfo.formQuery = undefined;
    await flushPromises();
    expect(mocks.loadDocument).not.toHaveBeenCalled();
    expect(mocks.apolloQuery).not.toHaveBeenCalled();
  });

  it("keeps the flow closed with a safe empty config until the config has loaded", async () => {
    let resolveQuery: (value: any) => void = () => {};
    mocks.apolloQuery.mockReturnValue(
      new Promise((resolve) => (resolveQuery = resolve)),
    );
    const wrapper = getWrapper();
    await openModal();
    expect(flow(wrapper).props("open")).toBe(false);
    expect(flow(wrapper).props("config")).toEqual({
      repeatable: false,
      steps: [],
    });
    resolveQuery({ data: { GetRepetitiveForm: rawOmnibusResult } });
    await flushPromises();
    expect(flow(wrapper).props("open")).toBe(true);
  });

  it("clears the config when the modal closes so the next open starts clean", async () => {
    const wrapper = getWrapper();
    await openModal();
    expect(flow(wrapper).props("config").steps.length).toBeGreaterThan(0);
    // close the modal
    modalInfo.open = false;
    await flushPromises();
    expect(flow(wrapper).props("open")).toBe(false);
    expect(flow(wrapper).props("config")).toEqual({
      repeatable: false,
      steps: [],
    });
  });

  it("maps the aliased query result into a flow config without __typename fields", async () => {
    const wrapper = getWrapper();
    await openModal();
    expect(flow(wrapper).props("config")).toEqual({
      repeatable: true,
      linear: false,
      steps: [
        { key: "work", entityType: "work", createForm: "GetWorkCreationForm" },
      ],
      finalize: {
        entityType: "manifestation",
        createForm: "GetManifestationCreationForm",
        relations: [],
      },
    });
  });

  it("refetches the config each time the modal opens", async () => {
    getWrapper();
    await openModal();
    modalInfo.open = false;
    await flushPromises();
    await openModal();
    expect(mocks.apolloQuery).toHaveBeenCalledTimes(2);
  });

  it("closes the modal and routes to the created entity on finished", async () => {
    const wrapper = getWrapper();
    await openModal();
    flow(wrapper).vm.$emit("finished", {
      id: "manif-1",
      type: "manifestation_word",
    });
    await wrapper.vm.$nextTick();
    expect(mocks.closeModal).toHaveBeenCalled();
    expect(mocks.push).toHaveBeenCalledWith({
      name: "SingleEntity",
      params: { id: "manif-1", type: "manifestation_word" },
    });
  });

  it("falls back to the finalize entityType when the created entity has no type", async () => {
    const wrapper = getWrapper();
    await openModal();
    flow(wrapper).vm.$emit("finished", { uuid: "manif-2" });
    await wrapper.vm.$nextTick();
    expect(mocks.push).toHaveBeenCalledWith({
      name: "SingleEntity",
      params: { id: "manif-2", type: "manifestation" },
    });
  });
});
