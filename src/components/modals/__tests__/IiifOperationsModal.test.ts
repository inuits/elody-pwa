import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount, flushPromises } from "@vue/test-utils";
import { reactive, nextTick } from "vue";
import IiifOperationsModal from "@/components/modals/IiifOperationsModal.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";

const mocks = vi.hoisted(() => ({
  modalInfo: {} as Record<string, any>,
  closeModal: vi.fn(),
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({
    getModalInfo: () => mocks.modalInfo,
    closeModal: mocks.closeModal,
  }),
}));

const getWrapper = () =>
  shallowMount(IiifOperationsModal, {
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        BaseModal: { template: "<div><slot /></div>" },
        BaseInputTextNumberDatetime: true,
        BaseButtonNew: {
          props: ["label", "buttonStyle", "loading", "disabled"],
          template: '<button :disabled="loading" @click="$emit(\'click\')" />',
        },
      },
    },
  });

describe("IiifOperationsModal - data comes from the modal store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // fresh reactive store info per test
    mocks.modalInfo = reactive({
      open: false,
      fileName: "",
      originalFilename: "",
      dimensions: undefined,
    });
  });

  it("uses the dimensions provided through the store when the modal opens", async () => {
    const wrapper = getWrapper();
    await flushPromises();

    Object.assign(mocks.modalInfo, {
      open: true,
      fileName: "display-test.jpg",
      originalFilename: "original-test.jpg",
      dimensions: { width: 1200, height: 800 },
    });
    await nextTick();

    expect(wrapper.vm.scaledWidth).toBe(1200);
    expect(wrapper.vm.scaledHeight).toBe(800);
  });

  it("falls back to default dimensions when the store has none", async () => {
    const wrapper = getWrapper();
    await flushPromises();

    Object.assign(mocks.modalInfo, { open: true, dimensions: undefined });
    await nextTick();

    expect(wrapper.vm.scaledWidth).toBe(1920);
    expect(wrapper.vm.scaledHeight).toBe(1080);
  });
});

describe("IiifOperationsModal - download loading state", () => {
  let resolveFetch: (value: any) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.modalInfo = reactive({
      open: true,
      fileName: "display-test.jpg",
      originalFilename: "original-test.jpg",
      dimensions: { width: 100, height: 50 },
    });
    (globalThis as any).fetch = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );
    (globalThis as any).URL.createObjectURL = vi.fn(() => "blob:test");
    (globalThis as any).URL.revokeObjectURL = vi.fn();
  });

  it("puts the download button in a loading state while generating, then clears it", async () => {
    const wrapper = getWrapper();
    await flushPromises();

    const button = wrapper.findComponent(BaseButtonNew);
    expect(button.props("loading")).toBe(false);

    const downloadPromise = wrapper.vm.downLoadImage();
    await nextTick();
    expect(button.props("loading")).toBe(true);

    resolveFetch({ ok: true, blob: () => Promise.resolve(new Blob(["data"])) });
    await downloadPromise;
    await flushPromises();

    expect(button.props("loading")).toBe(false);
  });
});
