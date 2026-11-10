import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount, flushPromises } from "@vue/test-utils";
import { reactive, nextTick } from "vue";
import IiifOperationsModal from "@/components/modals/IiifOperationsModal.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";

const mocks = vi.hoisted(() => ({
  modalInfo: {} as Record<string, any>,
  closeModal: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({
    getModalInfo: () => mocks.modalInfo,
    closeModal: mocks.closeModal,
  }),
}));

vi.mock("@/composables/useBaseNotification", () => ({
  useBaseNotification: () => ({
    displaySuccessNotification: mocks.success,
    displayErrorNotification: mocks.error,
  }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${Object.values(params).join(",")}` : key,
  }),
}));

const getWrapper = () =>
  shallowMount(IiifOperationsModal, {
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        BaseModal: { template: "<div><slot /></div>" },
        BaseButtonNew: {
          props: ["label", "buttonStyle", "loading", "disabled"],
          template:
            '<button :disabled="loading || disabled" @click="$emit(\'click\')">{{ label }}</button>',
        },
      },
    },
  });

const openWith = (info: Record<string, unknown> = {}) => {
  mocks.modalInfo = reactive({
    open: true,
    fileName: "display-test.jpg",
    originalFilename: "original-test.jpg",
    dimensions: { width: 1200, height: 800 },
    ...info,
  });
};

const button = (wrapper: ReturnType<typeof getWrapper>, label: string) =>
  wrapper
    .findAllComponents(BaseButtonNew)
    .find((candidate) => candidate.props("label") === label)!;

const setInput = async (
  wrapper: ReturnType<typeof getWrapper>,
  side: "width" | "height",
  value: string,
) => {
  wrapper
    .findComponent(`[data-cy="iiif-${side}"]`)
    .vm.$emit("update:modelValue", value === "" ? "" : Number(value));
  await nextTick();
};

describe("IiifOperationsModal - data comes from the modal store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

describe("IiifOperationsModal - compact layout (design 2a)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    openWith();
  });

  it("sizes the dialog to its content instead of half the screen", () => {
    expect(getWrapper().classes()).toEqual(
      expect.arrayContaining(["md:!min-w-0", "md:!w-[30rem]"]),
    );
  });

  it("shows the file and its original size under the title", () => {
    expect(getWrapper().find('[data-cy="iiif-original"]').text()).toBe(
      "iiif-operations-modal.original:original-test.jpg,1200,800",
    );
  });

  it("leaves the original size out when it is unknown", () => {
    openWith({ dimensions: undefined });
    expect(getWrapper().find('[data-cy="iiif-original"]').exists()).toBe(
      false,
    );
  });

  it("offers the scales and Custom as one segmented control", async () => {
    const wrapper = getWrapper();
    const scales = wrapper.findAll('[data-cy="iiif-scale"]');

    expect(scales.map((scale) => scale.text())).toEqual([
      "25%",
      "50%",
      "100%",
      "iiif-operations-modal.custom",
    ]);
    expect(scales[2].attributes("aria-pressed")).toBe("true");

    await scales[1].trigger("click");
    expect(wrapper.vm.scaledWidth).toBe(600);
    expect(wrapper.vm.scaledHeight).toBe(400);
    expect(scales[1].attributes("aria-pressed")).toBe("true");
  });

  it("keeps the aspect ratio by default and switches to Custom", async () => {
    const wrapper = getWrapper();
    expect(
      wrapper.find('[data-cy="iiif-lock"]').attributes("aria-pressed"),
    ).toBe("true");

    await setInput(wrapper, "width", "300");

    expect(wrapper.vm.scaledHeight).toBe(200);
    expect(
      wrapper.findAll('[data-cy="iiif-scale"]')[3].attributes("aria-pressed"),
    ).toBe("true");

    await setInput(wrapper, "height", "100");
    expect(wrapper.vm.scaledWidth).toBe(150);
  });

  it("lets width and height change apart once unlocked", async () => {
    const wrapper = getWrapper();
    await wrapper.find('[data-cy="iiif-lock"]').trigger("click");

    await setInput(wrapper, "width", "300");

    expect(wrapper.vm.scaledHeight).toBe(800);
  });

  it("relinks the height to the width when locked again", async () => {
    const wrapper = getWrapper();
    const lock = wrapper.find('[data-cy="iiif-lock"]');
    await lock.trigger("click");
    await setInput(wrapper, "width", "300");

    await lock.trigger("click");

    expect(wrapper.vm.scaledHeight).toBe(200);
  });

  it("says which size an empty side will get", async () => {
    const wrapper = getWrapper();
    await wrapper.find('[data-cy="iiif-lock"]').trigger("click");
    await setInput(wrapper, "height", "");

    expect(wrapper.find('[data-cy="iiif-size-message"]').text()).toBe(
      "iiif-operations-modal.calculated:1200,800",
    );
  });

  it("blocks the download without a width or a height", async () => {
    const wrapper = getWrapper();
    await setInput(wrapper, "width", "");
    await setInput(wrapper, "height", "");

    expect(wrapper.find('[data-cy="iiif-size-message"]').text()).toBe(
      "iiif-operations-modal.missing-dimensions-description",
    );
    expect(
      button(wrapper, "iiif-operations-modal.download").props("disabled"),
    ).toBe(true);
  });

  it("warns when the output is larger than the original", async () => {
    const wrapper = getWrapper();
    await setInput(wrapper, "width", "2400");

    expect(wrapper.find('[data-cy="iiif-size-message"]').text()).toBe(
      "iiif-operations-modal.upscaled",
    );
  });

  it("gives each format a one-line hint", async () => {
    const wrapper = getWrapper();
    const formats = wrapper.findAll('[data-cy="iiif-format"]');

    expect(formats.map((format) => format.text())).toEqual([
      "JPG",
      "PNG",
      "TIF",
    ]);
    expect(wrapper.find('[data-cy="iiif-format-hint"]').text()).toBe(
      "iiif-operations-modal.format-hint-jpg",
    );

    await formats[2].trigger("click");
    expect(wrapper.find('[data-cy="iiif-format-hint"]').text()).toBe(
      "iiif-operations-modal.format-hint-tif",
    );
  });

  it("previews the output filename in the footer", async () => {
    const wrapper = getWrapper();
    await wrapper.findAll('[data-cy="iiif-scale"]')[1].trigger("click");

    expect(wrapper.find('[data-cy="iiif-output-name"]').text()).toBe(
      "original-test_600x400.jpg",
    );
  });

  it("closes from Cancel in the footer", async () => {
    const wrapper = getWrapper();
    await button(wrapper, "iiif-operations-modal.cancel").trigger("click");

    expect(mocks.closeModal).toHaveBeenCalled();
  });
});

describe("IiifOperationsModal - download", () => {
  let resolveFetch: (value: any) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    openWith({ dimensions: { width: 100, height: 50 } });
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

    const download = button(wrapper, "iiif-operations-modal.download");
    expect(download.props("loading")).toBe(false);

    const downloadPromise = wrapper.vm.downLoadImage();
    await nextTick();
    expect(download.props("loading")).toBe(true);

    resolveFetch({ ok: true, blob: () => Promise.resolve(new Blob(["data"])) });
    await downloadPromise;
    await flushPromises();

    expect(download.props("loading")).toBe(false);
  });

  it("confirms the download with the file's name", async () => {
    const wrapper = getWrapper();
    const downloadPromise = wrapper.vm.downLoadImage();
    resolveFetch({ ok: true, blob: () => Promise.resolve(new Blob(["data"])) });
    await downloadPromise;

    expect(mocks.success).toHaveBeenCalledWith(
      "iiif-operations-modal.downloaded:original-test_100x50.jpg",
      "",
    );
  });
});
