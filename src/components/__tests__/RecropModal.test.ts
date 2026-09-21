import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import RecropModal from "@/components/RecropModal.vue";

const mocks = vi.hoisted(() => ({
  registerOpenDialog: vi.fn(),
  unregisterOpenDialog: vi.fn(),
  IIIFViewer: {
    props: [
      "imageFilename",
      "originalFilename",
      "mediafileId",
      "dimensions",
      "enableSelection",
      "isRecropModal",
    ],
    emits: ["selectArea", "clear-selection"],
    template: '<div class="iiif-viewer"></div>',
  },
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({
    registerOpenDialog: mocks.registerOpenDialog,
    unregisterOpenDialog: mocks.unregisterOpenDialog,
  }),
}));

vi.mock("@/components/IIIFViewer.vue", () => ({ default: mocks.IIIFViewer }));

beforeEach(() => {
  vi.clearAllMocks();
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

const getWrapper = (props = {}) =>
  mount(RecropModal, {
    props: {
      open: true,
      imageFilename: "display-test.jpg",
      originalFilename: "original-test.jpg",
      mediafileId: "mediafile-1",
      ...props,
    },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: { unicon: true, BlockingOverlay: true },
    },
  });

describe("RecropModal", () => {
  it("does not render the viewer when closed", () => {
    const wrapper = getWrapper({ open: false });
    expect(wrapper.findComponent(mocks.IIIFViewer).exists()).toBe(false);
  });

  it("renders the viewer, always without a crop, with selection enabled and isRecropModal set, when open", () => {
    const wrapper = getWrapper();

    const viewer = wrapper.findComponent(mocks.IIIFViewer);
    expect(viewer.exists()).toBe(true);
    expect(viewer.props("imageFilename")).toBe("display-test.jpg");
    expect(viewer.props("mediafileId")).toBe("mediafile-1");
    expect(viewer.props("enableSelection")).toBe(true);
    expect(viewer.props("isRecropModal")).toBe(true);
    expect(viewer.props("cropSizes")).toBeUndefined();
  });

  it("disables the save button until a selection has been drawn", async () => {
    const wrapper = getWrapper();

    expect(
      wrapper.find('[data-testid="recrop-modal-save"]').attributes("disabled"),
    ).toBeDefined();

    await wrapper
      .findComponent(mocks.IIIFViewer)
      .vm.$emit("selectArea", { x: 1, y: 2, w: 3, h: 4 }, "mediafile-1");

    expect(
      wrapper.find('[data-testid="recrop-modal-save"]').attributes("disabled"),
    ).toBeUndefined();
  });

  it("re-disables the save button when the viewer reports the selection was cleared (undo)", async () => {
    const wrapper = getWrapper();
    const viewer = wrapper.findComponent(mocks.IIIFViewer);

    await viewer.vm.$emit(
      "selectArea",
      { x: 1, y: 2, w: 3, h: 4 },
      "mediafile-1",
    );
    expect(
      wrapper.find('[data-testid="recrop-modal-save"]').attributes("disabled"),
    ).toBeUndefined();

    await viewer.vm.$emit("clear-selection");

    expect(
      wrapper.find('[data-testid="recrop-modal-save"]').attributes("disabled"),
    ).toBeDefined();
  });

  it("emits save with the drawn coordinates and the mediafileId when clicked", async () => {
    const wrapper = getWrapper();
    const coordinates = { x: 1, y: 2, w: 3, h: 4 };

    await wrapper
      .findComponent(mocks.IIIFViewer)
      .vm.$emit("selectArea", coordinates, "mediafile-1");
    await wrapper.find('[data-testid="recrop-modal-save"]').trigger("click");

    expect(wrapper.emitted("save")).toEqual([[coordinates, "mediafile-1"]]);
  });

  it("emits close when the header close button is clicked", async () => {
    const wrapper = getWrapper();
    await wrapper.find('[data-testid="recrop-modal-close"]').trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("disables the save button while saving is true", () => {
    const wrapper = getWrapper({ saving: true });
    expect(
      wrapper.find('[data-testid="recrop-modal-save"]').attributes("disabled"),
    ).toBeDefined();
  });

  it("resets the pending selection state when reopened", async () => {
    const wrapper = getWrapper();
    await wrapper
      .findComponent(mocks.IIIFViewer)
      .vm.$emit("selectArea", { x: 1, y: 2, w: 3, h: 4 }, "mediafile-1");
    expect(
      wrapper.find('[data-testid="recrop-modal-save"]').attributes("disabled"),
    ).toBeUndefined();

    await wrapper.setProps({ open: false });
    await wrapper.setProps({ open: true });

    expect(
      wrapper.find('[data-testid="recrop-modal-save"]').attributes("disabled"),
    ).toBeDefined();
  });

  it("calls showModal when open becomes true and registers the dialog", async () => {
    const wrapper = getWrapper({ open: false });
    await wrapper.setProps({ open: true });
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    expect(mocks.registerOpenDialog).toHaveBeenCalled();
  });
});

describe("RecropModal - page scroll lock", () => {
  afterEach(() => {
    document.body.classList.remove("overflow-hidden");
  });

  it("locks page scroll (adds overflow-hidden on body) once open, on mount", () => {
    getWrapper({ open: true });
    expect(document.body.classList.contains("overflow-hidden")).toBe(true);
  });

  it("locks page scroll when open transitions from false to true", async () => {
    const wrapper = getWrapper({ open: false });
    expect(document.body.classList.contains("overflow-hidden")).toBe(false);

    await wrapper.setProps({ open: true });

    expect(document.body.classList.contains("overflow-hidden")).toBe(true);
  });

  it("releases the scroll lock when closed", async () => {
    const wrapper = getWrapper({ open: true });
    expect(document.body.classList.contains("overflow-hidden")).toBe(true);

    await wrapper.setProps({ open: false });

    expect(document.body.classList.contains("overflow-hidden")).toBe(false);
  });

  it("releases the scroll lock when unmounted while open", () => {
    const wrapper = getWrapper({ open: true });
    expect(document.body.classList.contains("overflow-hidden")).toBe(true);

    wrapper.unmount();

    expect(document.body.classList.contains("overflow-hidden")).toBe(false);
  });
});
