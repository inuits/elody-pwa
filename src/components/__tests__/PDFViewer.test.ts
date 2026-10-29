import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import PDFViewer from "@/components/base/PDFViewer.vue";

vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: {},
  getDocument: vi.fn(),
}));

vi.mock("@/composables/useGetMediafile", () => ({
  CacheStrategy: { noCache: "noCache" },
  useGetMediafile: () => ({ getMediafile: vi.fn() }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const ViewerToolbarStub = {
  name: "ViewerToolbar",
  props: ["mode", "page", "pageCount", "mediafileId", "originalFilename"],
  emits: ["fullscreen"],
  template:
    '<button data-testid="fullscreen" @click="$emit(\'fullscreen\')" />',
};

const getWrapper = () =>
  mount(PDFViewer, {
    props: { source: null },
    global: {
      stubs: { ViewerToolbar: ViewerToolbarStub, SpinnerLoader: true },
    },
  });

describe("PDFViewer - toolbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the shared viewer toolbar in pdf mode", async () => {
    const wrapper = getWrapper();
    await flushPromises();
    const toolbar = wrapper.findComponent(ViewerToolbarStub);
    expect(toolbar.props("mode")).toBe("pdf");
  });

  it("puts the viewer in fullscreen when the toolbar asks", async () => {
    const wrapper = getWrapper();
    await flushPromises();
    const requestFullscreen = vi.fn(() => Promise.resolve());
    (wrapper.element as HTMLElement).requestFullscreen = requestFullscreen;
    await wrapper.find('[data-testid="fullscreen"]').trigger("click");
    expect(requestFullscreen).toHaveBeenCalledOnce();
  });

  it("announces fullscreen in a status region", async () => {
    const wrapper = getWrapper();
    await flushPromises();
    Object.defineProperty(document, "fullscreenElement", {
      configurable: true,
      get: () => wrapper.element,
    });
    document.dispatchEvent(new Event("fullscreenchange"));
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[role="status"]').text()).toBe(
      "media-viewer.fullscreen-on",
    );
    Object.defineProperty(document, "fullscreenElement", {
      configurable: true,
      get: () => null,
    });
  });
});

describe("PDFViewer - download name", () => {
  it("passes the mediafile's original filename to the toolbar", async () => {
    const wrapper = mount(PDFViewer, {
      props: {
        source: {
          id: "mediafile-1",
          intialValues: { original_filename: "doc.pdf" },
        },
      },
      global: {
        stubs: { ViewerToolbar: ViewerToolbarStub, SpinnerLoader: true },
      },
    });
    await flushPromises();
    expect(
      wrapper.findComponent(ViewerToolbarStub).props("originalFilename"),
    ).toBe("doc.pdf");
  });
});
