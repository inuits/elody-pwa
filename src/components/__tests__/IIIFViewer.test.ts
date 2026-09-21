import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import IIIFViewer from "@/components/IIIFViewer.vue";
import ViewerToolbarMock from "@/components/ViewerToolbar.vue";

const mocks = vi.hoisted(() => {
  const openSeadragonInstance = {
    selectionHandler: {
      frontCanvas: {
        drawer: { setDrawerShape: vi.fn() },
        getCoordsFromMouseEvent: vi.fn(),
      },
      clear: vi.fn(),
    },
    addOverlay: vi.fn(),
    removeOverlay: vi.fn(),
    selection: vi.fn(),
    initSelection: vi.fn(),
    destroy: vi.fn(),
    element: document.createElement("div"),
    viewport: {
      viewerElementToImageCoordinates: vi.fn(),
    },
  };
  const openSeadragonFactory = vi.fn(() => openSeadragonInstance);
  return { openSeadragonInstance, openSeadragonFactory };
});

vi.mock("openseadragon", () => ({
  default: Object.assign(mocks.openSeadragonFactory, {
    Point: class {
      constructor(
        public x: number,
        public y: number,
      ) {}
    },
  }),
}));

vi.mock("openseadragon-select-plugin", () => ({
  ShapeNames: { RectShape: "rect" },
}));

vi.mock("@/components/ViewerToolbar.vue", () => ({
  default: {
    props: [
      "enableSelection",
      "hasCropData",
      "showingCropped",
      "canRecrop",
      "isRecropModal",
    ],
    emits: [
      "toggle-selection",
      "cancel-selection",
      "toggle-crop-view",
      "open-recrop-modal",
    ],
    template:
      "<div>" +
      '<button data-testid="toggle-selection-button" @click="$emit(\'toggle-selection\')" />' +
      '<button data-testid="toggle-crop-view-button" @click="$emit(\'toggle-crop-view\')" />' +
      '<button data-testid="open-recrop-modal-button" @click="$emit(\'open-recrop-modal\')" />' +
      "</div>",
  },
}));

const cropSizes = { x: 10, y: 20, w: 100, h: 200 };

const getWrapper = (props = {}) =>
  mount(IIIFViewer, {
    props: {
      imageFilename: "test-image.jpg",
      mediafileId: "mediafile-1",
      ...props,
    },
  });

describe("IIIFViewer - crop vs original tile source", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the plain info.json tile source when no cropSizes are provided", () => {
    getWrapper();

    const options = mocks.openSeadragonFactory.mock.calls[0][0];
    expect(options.tileSources).toBe("/api/iiif/3/test-image.jpg/info.json");
  });

  it("uses the cropped region tile source whenever cropSizes is present", () => {
    getWrapper({ cropSizes });

    const options = mocks.openSeadragonFactory.mock.calls[0][0];
    expect(options.tileSources).toEqual({
      type: "image",
      url: "/api/iiif/3/test-image.jpg/10,20,100,200/100,200/0/default.jpg",
    });
  });

  it("uses the plain info.json tile source when cropSizes is present but showCropped is false", () => {
    getWrapper({ cropSizes, showCropped: false });

    const options = mocks.openSeadragonFactory.mock.calls[0][0];
    expect(options.tileSources).toBe("/api/iiif/3/test-image.jpg/info.json");
  });

  it("destroys the previous OpenSeadragon instance before creating a new one, so no stale instance keeps rendering in the background", async () => {
    const wrapper = getWrapper({});
    expect(mocks.openSeadragonInstance.destroy).not.toHaveBeenCalled();

    await wrapper.setProps({ cropSizes });

    expect(mocks.openSeadragonInstance.destroy).toHaveBeenCalledOnce();
    // destroy must run before the replacement instance is constructed
    const destroyOrder =
      mocks.openSeadragonInstance.destroy.mock.invocationCallOrder[0];
    const secondCreateOrder =
      mocks.openSeadragonFactory.mock.invocationCallOrder[1];
    expect(destroyOrder).toBeLessThan(secondCreateOrder);
  });

  it("re-initializes the viewer when cropSizes changes at runtime", async () => {
    const wrapper = getWrapper({});
    expect(mocks.openSeadragonFactory).toHaveBeenCalledTimes(1);

    await wrapper.setProps({ cropSizes });

    expect(mocks.openSeadragonFactory).toHaveBeenCalledTimes(2);
    const secondCallOptions = mocks.openSeadragonFactory.mock.calls[1][0];
    expect(secondCallOptions.tileSources).toEqual({
      type: "image",
      url: "/api/iiif/3/test-image.jpg/10,20,100,200/100,200/0/default.jpg",
    });

    await wrapper.setProps({ cropSizes: undefined });

    expect(mocks.openSeadragonFactory).toHaveBeenCalledTimes(3);
    const thirdCallOptions = mocks.openSeadragonFactory.mock.calls[2][0];
    expect(thirdCallOptions.tileSources).toBe(
      "/api/iiif/3/test-image.jpg/info.json",
    );
  });

  it("re-initializes the viewer when showCropped is toggled at runtime", async () => {
    const wrapper = getWrapper({ cropSizes, showCropped: true });
    expect(mocks.openSeadragonFactory).toHaveBeenCalledTimes(1);

    await wrapper.setProps({ showCropped: false });

    expect(mocks.openSeadragonFactory).toHaveBeenCalledTimes(2);
    const secondCallOptions = mocks.openSeadragonFactory.mock.calls[1][0];
    expect(secondCallOptions.tileSources).toBe(
      "/api/iiif/3/test-image.jpg/info.json",
    );

    await wrapper.setProps({ showCropped: true });

    expect(mocks.openSeadragonFactory).toHaveBeenCalledTimes(3);
    const thirdCallOptions = mocks.openSeadragonFactory.mock.calls[2][0];
    expect(thirdCallOptions.tileSources).toEqual({
      type: "image",
      url: "/api/iiif/3/test-image.jpg/10,20,100,200/100,200/0/default.jpg",
    });
  });
});

describe("IIIFViewer - forwarding crop/recrop state to ViewerToolbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("derives hasCropData from cropSizes and forwards showingCropped/canRecrop/isRecropModal as given", () => {
    const wrapper = getWrapper({
      cropSizes,
      canRecrop: true,
      isRecropModal: true,
    });

    const toolbar = wrapper.findComponent(ViewerToolbarMock);
    expect(toolbar.props("hasCropData")).toBe(true);
    expect(toolbar.props("showingCropped")).toBe(true);
    expect(toolbar.props("canRecrop")).toBe(true);
    expect(toolbar.props("isRecropModal")).toBe(true);
  });

  it("hasCropData is false when there are no cropSizes", () => {
    const wrapper = getWrapper({});
    const toolbar = wrapper.findComponent(ViewerToolbarMock);
    expect(toolbar.props("hasCropData")).toBe(false);
  });

  it("showingCropped is false when cropSizes is present but showCropped is false", () => {
    const wrapper = getWrapper({ cropSizes, showCropped: false });
    const toolbar = wrapper.findComponent(ViewerToolbarMock);
    expect(toolbar.props("showingCropped")).toBe(false);
  });

  it("forwards toggle-crop-view and open-recrop-modal events emitted by the toolbar", async () => {
    const wrapper = getWrapper({ cropSizes, canRecrop: true });

    await wrapper
      .find('[data-testid="toggle-crop-view-button"]')
      .trigger("click");
    await wrapper
      .find('[data-testid="open-recrop-modal-button"]')
      .trigger("click");

    expect(wrapper.emitted("toggle-crop-view")).toHaveLength(1);
    expect(wrapper.emitted("open-recrop-modal")).toHaveLength(1);
  });
});

describe("IIIFViewer - selection emit shape", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.openSeadragonInstance.selection.mockReturnValue({
      enable: vi.fn(),
      disable: vi.fn(),
      isEnabled: false,
    });
  });

  it("emits selectArea with rounded coordinates and mediafileId regardless of what triggered selection mode", async () => {
    const wrapper = getWrapper({ enableSelection: true });

    await wrapper
      .find('[data-testid="toggle-selection-button"]')
      .trigger("click");

    const onSelection =
      mocks.openSeadragonInstance.selection.mock.calls[0][0].onSelection;
    onSelection({ x: 1.4, y: 2.6, width: 100.2, height: 200.9 }, "rect");

    expect(wrapper.emitted("selectArea")?.[0]).toEqual([
      { x: 1, y: 3, w: 100, h: 201 },
      "mediafile-1",
    ]);
  });

  it("does not emit selectArea for a click without drag (zero-area rectangle)", async () => {
    const wrapper = getWrapper({ enableSelection: true });

    await wrapper
      .find('[data-testid="toggle-selection-button"]')
      .trigger("click");

    const onSelection =
      mocks.openSeadragonInstance.selection.mock.calls[0][0].onSelection;
    onSelection({ x: 3, y: 4, width: 0, height: 0 }, "rect");

    expect(wrapper.emitted("selectArea")).toBeUndefined();
  });

  it("does not emit selectArea when only width or only height collapses to zero", async () => {
    const wrapper = getWrapper({ enableSelection: true });

    await wrapper
      .find('[data-testid="toggle-selection-button"]')
      .trigger("click");

    const onSelection =
      mocks.openSeadragonInstance.selection.mock.calls[0][0].onSelection;
    onSelection({ x: 3, y: 4, width: 50, height: 0 }, "rect");
    onSelection({ x: 3, y: 4, width: 0, height: 50 }, "rect");

    expect(wrapper.emitted("selectArea")).toBeUndefined();
  });

  it("does not add a persisted overlay for a zero-area selection", async () => {
    const wrapper = getWrapper({ enableSelection: true });

    await wrapper
      .find('[data-testid="toggle-selection-button"]')
      .trigger("click");

    const onSelection =
      mocks.openSeadragonInstance.selection.mock.calls[0][0].onSelection;
    onSelection({ x: 3, y: 4, width: 0, height: 0 }, "rect");

    expect(mocks.openSeadragonInstance.addOverlay).not.toHaveBeenCalled();
  });
});

describe("IIIFViewer - selection coordinates in a modal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.openSeadragonInstance.selection.mockReturnValue({
      enable: vi.fn(),
      disable: vi.fn(),
      isEnabled: false,
    });
  });

  it("uses client coordinates and remeasures the viewer after layout changes", async () => {
    const wrapper = getWrapper({ enableSelection: true });
    const instance = mocks.openSeadragonInstance;
    // A top-layer dialog has no offsetParent in Chrome. Its rendered
    // position still needs subtracting from the pointer coordinates.
    expect(instance.element.offsetParent).toBeNull();
    const bounds = vi.spyOn(instance.element, "getBoundingClientRect");
    bounds.mockReturnValue({ left: 80.5, top: 120.25 } as DOMRect);
    const imagePoint = { x: 400, y: 600 };
    instance.viewport.viewerElementToImageCoordinates.mockReturnValue(
      imagePoint,
    );

    await wrapper
      .find('[data-testid="toggle-selection-button"]')
      .trigger("click");

    const getCoords =
      instance.selectionHandler.frontCanvas.getCoordsFromMouseEvent;
    // Page coordinates deliberately include a scroll offset; they must not
    // be mixed with the client-relative bounding rectangle.
    const event = {
      clientX: 180.5,
      clientY: 270.25,
      pageX: 380.5,
      pageY: 770.25,
    };
    expect(getCoords(event as MouseEvent)).toBe(imagePoint);
    expect(
      instance.viewport.viewerElementToImageCoordinates,
    ).toHaveBeenLastCalledWith(expect.objectContaining({ x: 100, y: 150 }));

    bounds.mockReturnValue({ left: 100.5, top: 140.25 } as DOMRect);
    getCoords(event as MouseEvent);
    expect(
      instance.viewport.viewerElementToImageCoordinates,
    ).toHaveBeenLastCalledWith(expect.objectContaining({ x: 80, y: 130 }));
    bounds.mockRestore();
    wrapper.unmount();
  });
});

describe("IIIFViewer - clear-selection emit on undo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.openSeadragonInstance.selection.mockReturnValue({
      enable: vi.fn(),
      disable: vi.fn(),
      isEnabled: false,
    });
  });

  it("emits clear-selection when the current selection is undone via the toolbar", async () => {
    const wrapper = getWrapper({ enableSelection: true });

    await wrapper
      .find('[data-testid="toggle-selection-button"]')
      .trigger("click");
    const onSelection =
      mocks.openSeadragonInstance.selection.mock.calls[0][0].onSelection;
    onSelection({ x: 1, y: 2, width: 10, height: 20 }, "rect");

    const toolbar = wrapper.findComponent(ViewerToolbarMock);
    toolbar.vm.$emit("cancel-selection");
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("clear-selection")).toHaveLength(1);
  });

  it("does not emit clear-selection when there is nothing to undo", async () => {
    const wrapper = getWrapper({ enableSelection: true });

    const toolbar = wrapper.findComponent(ViewerToolbarMock);
    toolbar.vm.$emit("cancel-selection");
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("clear-selection")).toBeUndefined();
  });
});
