import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ViewerToolbar from "@/components/ViewerToolbar.vue";
import { ModalStyle, TypeModals } from "@/generated-types/queries";

const mocks = vi.hoisted(() => ({
  openModal: vi.fn(),
  isSelectable: vi.fn(() => false),
  downloadMediafile: vi.fn(),
  downloadLoading: { value: false },
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ openModal: mocks.openModal }),
}));

vi.mock("@/composables/useMediafileCrop", () => ({
  useMediafileCrop: () => ({ isSelectable: mocks.isSelectable }),
}));

vi.mock("@/composables/useMediafileDownload", () => ({
  useMediafileDownload: () => ({
    downloadMediafile: mocks.downloadMediafile,
    downloadLoading: mocks.downloadLoading,
  }),
}));

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
        unicon: { template: "<span />", props: ["name", "height"] },
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
    expect(firstControl?.attributes("data-testid")).toBe(
      "viewer-toolbar-logo",
    );
  });
});

describe("ViewerToolbar - one toolbar, pdf mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is a named toolbar", () => {
    const wrapper = getWrapper();
    const toolbar = wrapper.find('[role="toolbar"]');
    expect(toolbar.exists()).toBe(true);
    expect(toolbar.attributes("aria-label")).toBe("viewer.toolbar-label");
  });

  it("shows the page position and hides the image-only actions in pdf mode", () => {
    const wrapper = getWrapper({
      ...getDefaultProps(),
      mode: "pdf",
      pageNum: 3,
      pageCount: 12,
    });

    expect(wrapper.find('[data-testid="viewer-page-nav"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("12");
    expect(
      wrapper.find('[data-testid="open-iiif-operations-modal"]').exists(),
    ).toBe(false);
  });

  it("emits a clamped page change", async () => {
    const wrapper = getWrapper({
      ...getDefaultProps(),
      mode: "pdf",
      pageNum: 12,
      pageCount: 12,
    });

    await wrapper.find('[data-testid="viewer-next-page"]').trigger("click");
    // Already on the last page: no event rather than page 13.
    expect(wrapper.emitted("changePage")).toBeUndefined();

    await wrapper.find('[data-testid="viewer-previous-page"]').trigger("click");
    expect(wrapper.emitted("changePage")?.[0]).toEqual([{ num: 11 }]);
  });

  it("emits zoom clicks so viewers without OpenSeadragon can listen", async () => {
    const wrapper = getWrapper({ ...getDefaultProps(), mode: "pdf" });

    await wrapper.find('[data-testid="viewer-zoom-in"]').trigger("click");
    await wrapper.find('[data-testid="viewer-zoom-out"]').trigger("click");

    expect(wrapper.emitted("zoomIn")).toHaveLength(1);
    expect(wrapper.emitted("zoomOut")).toHaveLength(1);
  });

  it("names every icon button", () => {
    const wrapper = getWrapper({
      ...getDefaultProps(),
      mode: "pdf",
      pageNum: 1,
      pageCount: 2,
    });

    const unnamed = wrapper
      .findAll("button")
      .filter(
        (button) =>
          !button.attributes("aria-label") && !button.text().trim().length,
      );
    expect(unnamed).toHaveLength(0);
  });
});
