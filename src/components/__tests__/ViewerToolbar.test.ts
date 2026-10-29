import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ViewerToolbar from "@/components/ViewerToolbar.vue";
import MediafileNavigationArrows from "@/components/base/MediafileNavigationArrows.vue";
import { ModalStyle, TypeModals } from "@/generated-types/queries";

const mocks = vi.hoisted(() => ({
  openModal: vi.fn(),
  isSelectable: vi.fn(() => false),
  downloadMediafile: vi.fn(),
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ openModal: mocks.openModal }),
}));

vi.mock("@/composables/useMediafileCrop", () => ({
  useMediafileCrop: () => ({ isSelectable: mocks.isSelectable }),
}));

vi.mock("@/composables/useMediafileDownload", async () => {
  const { ref } = await vi.importActual<typeof import("vue")>("vue");
  return {
    useMediafileDownload: () => ({
      downloadMediafile: mocks.downloadMediafile,
      downloadLoading: ref(false),
    }),
  };
});

vi.mock("@/types", () => ({
  Unicons: new Proxy({}, { get: (_t, name) => ({ name: String(name) }) }),
}));

const getDefaultProps = () => ({
  originalFilename: "original-test.jpg",
  mediafileId: "mediafile-1",
  imageFilename: "display-test.jpg",
  dimensions: { width: 1200, height: 800 },
  enableSelection: false,
});

const getWrapper = (props = getDefaultProps()) =>
  mount(ViewerToolbar, {
    props,
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        BaseTooltip: {
          template: '<div><slot name="activator" :on="{}" /></div>',
        },
        SpinnerLoader: { template: "<div />" },
        unicon: {
          template: '<span :data-icon-name="name" />',
          props: ["name", "height"],
        },
      },
    },
  });

describe("ViewerToolbar - open IIIF operations modal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens the global IIIF operations modal and passes the viewer's data through the store", async () => {
    const wrapper = getWrapper();

    await wrapper
      .find('[data-testid="open-iiif-operations-modal"]')
      .trigger("click");

    expect(mocks.openModal).toHaveBeenCalledTimes(1);
    const call = mocks.openModal.mock.calls[0];
    expect(call[0]).toBe(TypeModals.IiifOperationsModal);
    expect(call[1]).toBe(ModalStyle.Center);
    // the viewer-specific data must be carried in the modal-type-specific info
    const modalTypeSpecificInfo = call[call.length - 1];
    expect(modalTypeSpecificInfo).toMatchObject({
      fileName: "display-test.jpg",
      originalFilename: "original-test.jpg",
      dimensions: { width: 1200, height: 800 },
    });
  });
});

describe("ViewerToolbar - logo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const logo = {
    src: "/a-logo.svg",
    href: "https://dams.antwerpen.be/assets/813ef4f8",
    alt: "Stad Antwerpen",
  };

  it("does not render a logo link when no logo is provided", () => {
    const wrapper = getWrapper();
    expect(wrapper.find('[data-testid="viewer-toolbar-logo"]').exists()).toBe(
      false,
    );
  });

  it("renders the logo image and link when a logo is provided", () => {
    const wrapper = getWrapper({ ...getDefaultProps(), logo });

    const link = wrapper.find('[data-testid="viewer-toolbar-logo"]');
    expect(link.exists()).toBe(true);
    expect(link.attributes("href")).toBe(logo.href);
    expect(link.find("img").attributes("src")).toBe(logo.src);
    expect(link.find("img").attributes("alt")).toBe(logo.alt);
  });

  it("opens the logo link in a new tab safely", () => {
    const wrapper = getWrapper({ ...getDefaultProps(), logo });

    const link = wrapper.find('[data-testid="viewer-toolbar-logo"]');
    expect(link.attributes("target")).toBe("_blank");
    expect(link.attributes("rel")).toBe("noopener noreferrer");
  });

  it("renders the logo as the first button in the left toolbar group", () => {
    const wrapper = getWrapper({ ...getDefaultProps(), logo });

    const firstControl = wrapper
      .findAll("button, a[data-testid='viewer-toolbar-logo']")
      .at(0);
    expect(firstControl?.attributes("data-testid")).toBe("viewer-toolbar-logo");
  });
});

describe("ViewerToolbar - toggle original/cropped view button", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render the toggle button when hasCropData is false", () => {
    const wrapper = getWrapper({ ...getDefaultProps(), hasCropData: false });
    expect(wrapper.find('[data-testid="toggle-crop-view"]').exists()).toBe(
      false,
    );
  });

  it("renders the toggle button when hasCropData is true", () => {
    const wrapper = getWrapper({ ...getDefaultProps(), hasCropData: true });
    expect(wrapper.find('[data-testid="toggle-crop-view"]').exists()).toBe(
      true,
    );
  });

  it("emits toggle-crop-view when clicked", async () => {
    const wrapper = getWrapper({ ...getDefaultProps(), hasCropData: true });
    await wrapper.find('[data-testid="toggle-crop-view"]').trigger("click");
    expect(wrapper.emitted("toggle-crop-view")).toHaveLength(1);
  });

  it("renders as a text button showing show-original when currently showing the crop", () => {
    const wrapper = getWrapper({
      ...getDefaultProps(),
      hasCropData: true,
      showingCropped: true,
    });
    expect(wrapper.find('[data-testid="toggle-crop-view"]').text()).toBe(
      "tooltip.media-viewer.show-original",
    );
  });

  it("renders as a text button showing show-cropped when currently showing the original", () => {
    const wrapper = getWrapper({
      ...getDefaultProps(),
      hasCropData: true,
      showingCropped: false,
    });
    expect(wrapper.find('[data-testid="toggle-crop-view"]').text()).toBe(
      "tooltip.media-viewer.show-cropped",
    );
  });
});

describe("ViewerToolbar - open recrop modal button", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render the recrop button when canRecrop is false", () => {
    const wrapper = getWrapper({ ...getDefaultProps(), canRecrop: false });
    expect(wrapper.find('[data-testid="open-recrop-modal"]').exists()).toBe(
      false,
    );
  });

  it("renders the recrop button when canRecrop is true", () => {
    const wrapper = getWrapper({ ...getDefaultProps(), canRecrop: true });
    expect(wrapper.find('[data-testid="open-recrop-modal"]').exists()).toBe(
      true,
    );
  });

  it("emits open-recrop-modal when clicked", async () => {
    const wrapper = getWrapper({ ...getDefaultProps(), canRecrop: true });
    await wrapper.find('[data-testid="open-recrop-modal"]').trigger("click");
    expect(wrapper.emitted("open-recrop-modal")).toHaveLength(1);
  });

  it("uses the same crop icon as the draw-crop-selection button", () => {
    const wrapper = getWrapper({
      ...getDefaultProps(),
      canRecrop: true,
      enableSelection: true,
    });
    const drawIcon = wrapper.find(
      '[data-testid="draw-crop-selection"] [data-icon-name]',
    );
    const recropIcon = wrapper.find(
      '[data-testid="open-recrop-modal"] [data-icon-name]',
    );
    expect(recropIcon.attributes("data-icon-name")).toBe("Crop");
    expect(recropIcon.attributes("data-icon-name")).toBe(
      drawIcon.attributes("data-icon-name"),
    );
  });
});

describe("ViewerToolbar - existing crop/cancel buttons, and the isRecropModal bypass", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("still gates the existing crop/cancel buttons on enableSelection only", () => {
    const wrapper = getWrapper({
      ...getDefaultProps(),
      enableSelection: true,
      hasCropData: true,
      canRecrop: true,
    });
    expect(wrapper.find('[data-testid="draw-crop-selection"]').exists()).toBe(
      true,
    );
    expect(wrapper.find('[data-testid="cancel-crop-selection"]').exists()).toBe(
      true,
    );
  });

  it("enables the draw/cancel crop buttons when isRecropModal is true, even when the mediafile isn't enqueued in the add-flow picker", () => {
    mocks.isSelectable.mockReturnValue(false);

    const wrapper = getWrapper({
      ...getDefaultProps(),
      enableSelection: true,
      isRecropModal: true,
    });

    expect(
      wrapper
        .find('[data-testid="draw-crop-selection"]')
        .attributes("disabled"),
    ).toBeUndefined();
    expect(
      wrapper
        .find('[data-testid="cancel-crop-selection"]')
        .attributes("disabled"),
    ).toBeUndefined();
  });

  it("still disables the draw/cancel crop buttons outside of the recrop modal when the mediafile isn't enqueued (add-flow behavior unchanged)", () => {
    mocks.isSelectable.mockReturnValue(false);

    const wrapper = getWrapper({
      ...getDefaultProps(),
      enableSelection: true,
      isRecropModal: false,
    });

    expect(
      wrapper
        .find('[data-testid="draw-crop-selection"]')
        .attributes("disabled"),
    ).toBeDefined();
  });
});

describe("ViewerToolbar - shared toolbar shell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const allControlsProps = () => ({
    ...getDefaultProps(),
    enableSelection: true,
    canRecrop: true,
    hasCropData: true,
  });

  it("is a named toolbar", () => {
    const wrapper = getWrapper();
    const toolbar = wrapper.find('[role="toolbar"]');
    expect(toolbar.exists()).toBe(true);
    expect(toolbar.attributes("aria-label")).toBe("media-viewer.toolbar");
  });

  it("gives every button an accessible name", () => {
    const wrapper = getWrapper(allControlsProps());
    const unnamed = wrapper
      .findAll("button")
      .filter((b) => !b.attributes("aria-label") && !b.text().trim());
    expect(unnamed).toHaveLength(0);
  });

  it("names the download button", () => {
    const wrapper = getWrapper();
    expect(
      wrapper.find('[data-testid="viewer-download"]').attributes("aria-label"),
    ).toBe("media-viewer.download");
  });

  it("renders a rotate button and hands its element to the viewer", () => {
    const wrapper = getWrapper();
    const rotate = wrapper.find('[data-testid="viewer-rotate"]');
    expect(rotate.attributes("aria-label")).toBe("media-viewer.rotate");
    expect(wrapper.emitted("update:rotate")?.[0][0]).toBe(rotate.element);
  });

  it("names the navigation slot's file arrows", () => {
    const wrapper = mount(ViewerToolbar, {
      props: getDefaultProps(),
      slots: {
        navigation: "<MediafileNavigationArrows />",
      },
      global: {
        mocks: { $t: (key: string) => key },
        components: { MediafileNavigationArrows },
        stubs: {
          BaseTooltip: true,
          SpinnerLoader: true,
          unicon: true,
        },
      },
    });
    expect(
      wrapper
        .find('[data-testid="nav-prev-mediafile"]')
        .attributes("aria-label"),
    ).toBe("media-viewer.previous-file");
    expect(
      wrapper
        .find('[data-testid="nav-next-mediafile"]')
        .attributes("aria-label"),
    ).toBe("media-viewer.next-file");
  });
});

describe("ViewerToolbar - pdf mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const pdfProps = (page = 3, pageCount = 12) => ({
    mode: "pdf" as const,
    mediafileId: "mediafile-1",
    originalFilename: "doc.pdf",
    page,
    pageCount,
  });
  const byLabel = (wrapper: ReturnType<typeof getWrapper>, label: string) =>
    wrapper.find(`[aria-label="${label}"]`);

  it("shows zoom, fullscreen, download and page navigation, and no image-only controls", () => {
    const wrapper = getWrapper(pdfProps() as any);
    const names = wrapper
      .findAll("button, input")
      .map((el) => el.attributes("aria-label") || el.text().trim());
    expect(names).toEqual([
      "media-viewer.fullscreen",
      "media-viewer.zoom-in",
      "media-viewer.zoom-out",
      "media-viewer.download",
      "media-viewer.previous-page",
      "pagination.page-number",
      "media-viewer.next-page",
    ]);
  });

  it("emits zoom and fullscreen requests", async () => {
    const wrapper = getWrapper(pdfProps() as any);
    await byLabel(wrapper, "media-viewer.zoom-in").trigger("click");
    await byLabel(wrapper, "media-viewer.zoom-out").trigger("click");
    await byLabel(wrapper, "media-viewer.fullscreen").trigger("click");
    expect(wrapper.emitted("zoom-in")).toHaveLength(1);
    expect(wrapper.emitted("zoom-out")).toHaveLength(1);
    expect(wrapper.emitted("fullscreen")).toHaveLength(1);
  });

  it("shows the current page and the page count", () => {
    const wrapper = getWrapper(pdfProps() as any);
    const input = byLabel(wrapper, "pagination.page-number");
    expect((input.element as HTMLInputElement).value).toBe("3");
    expect(wrapper.text()).toContain("/ 12");
  });

  it("steps to the previous and next page", async () => {
    const wrapper = getWrapper(pdfProps() as any);
    await byLabel(wrapper, "media-viewer.previous-page").trigger("click");
    await byLabel(wrapper, "media-viewer.next-page").trigger("click");
    expect(wrapper.emitted("change-page")).toEqual([[2], [4]]);
  });

  it("disables the arrows at the first and last page", () => {
    const first = getWrapper(pdfProps(1, 2) as any);
    expect(
      byLabel(first, "media-viewer.previous-page").attributes("disabled"),
    ).toBeDefined();
    const last = getWrapper(pdfProps(2, 2) as any);
    expect(
      byLabel(last, "media-viewer.next-page").attributes("disabled"),
    ).toBeDefined();
  });

  it("clamps a typed page into range", async () => {
    const wrapper = getWrapper(pdfProps() as any);
    const input = byLabel(wrapper, "pagination.page-number");
    await input.setValue("99");
    expect(wrapper.emitted("change-page")).toEqual([[12]]);
    expect((input.element as HTMLInputElement).value).toBe("12");
  });
});

describe("ViewerToolbar - text mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows only zoom and download", () => {
    const wrapper = getWrapper({
      mode: "text",
      mediafileId: "mediafile-1",
      originalFilename: "notes.txt",
    } as any);
    const names = wrapper
      .findAll("button, input")
      .map((el) => el.attributes("aria-label") || el.text().trim());
    expect(names).toEqual([
      "media-viewer.zoom-in",
      "media-viewer.zoom-out",
      "media-viewer.download",
    ]);
  });
});

describe("ViewerToolbar - av mode", () => {
  it("shows only download (the native controls carry transport and fullscreen)", () => {
    const wrapper = getWrapper({
      mode: "av",
      mediafileId: "mediafile-1",
      originalFilename: "clip.mp4",
    } as any);
    const names = wrapper
      .findAll("button, input")
      .map((el) => el.attributes("aria-label") || el.text().trim());
    expect(names).toEqual(["media-viewer.download"]);
  });
});
