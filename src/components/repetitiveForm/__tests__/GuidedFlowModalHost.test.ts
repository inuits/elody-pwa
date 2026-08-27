import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { reactive } from "vue";
import {
  enableAutoUnmount,
  flushPromises,
  shallowMount,
} from "@vue/test-utils";
import GuidedFlowModalHost from "@/components/repetitiveForm/GuidedFlowModalHost.vue";
import { useModalActions } from "@/composables/useModalActions";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  closeModal: vi.fn(),
  modalInfo: { open: false, formQuery: undefined } as {
    open: boolean;
    formQuery?: string;
    onEntitySelected?: (entity: any) => void;
  },
  loadDocument: vi.fn(),
  apolloQuery: vi.fn(),
  refetchQueries: vi.fn(),
}));

const modalInfo = reactive<{
  open: boolean;
  formQuery?: string;
  onEntitySelected?: (entity: any) => void;
}>({
  open: false,
  formQuery: undefined,
  onEntitySelected: undefined,
});
// the hoisted mock factory below resolves modal info through this indirection
mocks.modalInfo = modalInfo;

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mocks.push }),
  useRoute: () => ({}),
}));
vi.mock("@/main", () => ({
  apolloClient: {
    query: (...args: any[]) => mocks.apolloQuery(...args),
    refetchQueries: (...args: any[]) => mocks.refetchQueries(...args),
  },
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

// A repeatable, create-only flow (no finalize) that opts into refetch-on-finish.
const rawNoFinalizeResult = {
  __typename: "RepetitiveForm",
  repeatable: true,
  refetchOnFinish: true,
  frame: [
    {
      __typename: "RepetitiveStep",
      key: "frame",
      entityType: "web_story_frame",
      createForm: "GetFrameCreationForm",
    },
  ],
};

// A linear pick-only flow that hands its result back to the caller.
const rawReturnsSelectionResult = {
  __typename: "RepetitiveForm",
  repeatable: false,
  linear: true,
  returnsSelection: true,
  work: [
    {
      __typename: "RepetitiveStep",
      key: "work",
      entityType: "work",
      terminalActionLabel: "repetitiveForm.tag-this-work",
    },
  ],
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
    mocks.refetchQueries.mockReset();
    useModalActions().setCallbackFunctions(undefined);
    modalInfo.open = false;
    modalInfo.formQuery = undefined;
    modalInfo.onEntitySelected = undefined;
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
      startOnFirstStep: false,
      refetchOnFinish: false,
      returnsSelection: false,
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

  it("runs the registered refetch callbacks on finish when refetchOnFinish is set", async () => {
    mocks.apolloQuery.mockResolvedValue({
      data: { GetRepetitiveForm: rawNoFinalizeResult },
    });
    const refetchEntities = vi.fn();
    useModalActions().setCallbackFunctions([refetchEntities]);
    const wrapper = getWrapper();
    await openModal("GetWebStoryFrameGuidedFlow");
    // no-finalize flow finishes with an empty payload (no entity to route to)
    flow(wrapper).vm.$emit("finished", {});
    await wrapper.vm.$nextTick();
    expect(mocks.closeModal).toHaveBeenCalled();
    expect(refetchEntities).toHaveBeenCalledTimes(1);
    // the targeted callback is preferred over the broad active-query refetch
    expect(mocks.refetchQueries).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("falls back to refetching active queries when no callbacks are registered", async () => {
    mocks.apolloQuery.mockResolvedValue({
      data: { GetRepetitiveForm: rawNoFinalizeResult },
    });
    const wrapper = getWrapper();
    await openModal("GetWebStoryFrameGuidedFlow");
    flow(wrapper).vm.$emit("finished", {});
    await wrapper.vm.$nextTick();
    expect(mocks.refetchQueries).toHaveBeenCalledWith({ include: "active" });
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("hands the picked entity to the caller and does not route for a returnsSelection flow", async () => {
    const onEntitySelected = vi.fn();
    modalInfo.onEntitySelected = onEntitySelected;
    mocks.apolloQuery.mockResolvedValue({
      data: { GetRepetitiveForm: rawReturnsSelectionResult },
    });
    const wrapper = getWrapper();
    await openModal("GetTagWemFlow");
    const entity = { id: "work-1", type: "work" };
    flow(wrapper).vm.$emit("finished", entity);
    await flushPromises();

    expect(onEntitySelected).toHaveBeenCalledWith(entity);
    expect(mocks.closeModal).toHaveBeenCalled();
    // the caller is mid-edit: routing away or refetching would throw its work out
    expect(mocks.push).not.toHaveBeenCalled();
    expect(mocks.refetchQueries).not.toHaveBeenCalled();
  });

  it("still closes cleanly when a returnsSelection flow has no caller handler", async () => {
    mocks.apolloQuery.mockResolvedValue({
      data: { GetRepetitiveForm: rawReturnsSelectionResult },
    });
    const wrapper = getWrapper();
    await openModal("GetTagWemFlow");
    flow(wrapper).vm.$emit("finished", { id: "work-1" });
    await flushPromises();
    expect(mocks.closeModal).toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("keeps routing for a flow that does not return its selection", async () => {
    const onEntitySelected = vi.fn();
    modalInfo.onEntitySelected = onEntitySelected;
    const wrapper = getWrapper();
    await openModal();
    flow(wrapper).vm.$emit("finished", { id: "manif-1", type: "manifestation" });
    await flushPromises();
    expect(onEntitySelected).not.toHaveBeenCalled();
    expect(mocks.push).toHaveBeenCalled();
  });
});
