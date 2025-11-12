import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { computed, nextTick, ref } from "vue";
import MediaViewerNew from "@/components/base/MediaViewerNew.vue";
import type { Entity, MediaFileEntity } from "@/generated-types/queries";

// Hoisted mocks
const mocks = vi.hoisted(() => {
  return {
    useMediafileCrop: vi.fn(),
    useEntityMediafileSelector: vi.fn(),
    IIIFViewer: {
      default: {},
      template: '<div class="iiif-viewer"></div>',
      props: [
        "enableSelection",
        "cropSizes",
        "imageFilename",
        "originalFilename",
        "mediafileId",
        "dimensions",
      ],
      emits: ["selectArea", "toggle-preview-component:entity-id"],
    },
    VideoPlayer: {
      default: {},
      template: '<div class="video-player"></div>',
    },
    AudioPlayer: {
      default: {},
      template: '<div class="audio-player"></div>',
    },
    PDFViewer: {
      default: {},
      template: '<div class="pdf-viewer"></div>',
    },
    TextViewer: {
      default: {},
      template: '<div class="text-viewer"></div>',
    },
    SpinnerLoader: {
      default: {},
      template: '<div class="spinner-loader"></div>',
    },
    Unicons: {
      DesktopSlash: { name: "desktop-slash" },
    },
  };
});

vi.mock("@/composables/useMediafileCrop", () => ({
  useMediafileCrop: mocks.useMediafileCrop,
}));

vi.mock("@/composables/useEntityMediafileSelector", () => ({
  useEntityMediafileSelector: mocks.useEntityMediafileSelector,
}));

vi.mock("@/components/IIIFViewer.vue", () => mocks.IIIFViewer);
vi.mock("@/components/base/AudioAndVideoPlayer.vue", () => mocks.VideoPlayer);
vi.mock("@/components/base/AudioAndVideoPlayer.vue", () => mocks.AudioPlayer);
vi.mock("@/components/base/TextViewer.vue", () => mocks.TextViewer);
vi.mock("@/components/SpinnerLoader.vue", () => mocks.SpinnerLoader);
vi.mock("@/types", () => ({
  Unicons: mocks.Unicons,
}));

vi.mock("@/components/base/PDFViewer.vue", () => mocks.PDFViewer);

vi.mock("openseadragon", () => ({}));
vi.mock("openseadragon-select-plugin", () => ({}));

describe("MediaViewerNew.vue - Cropping Functionality", () => {
  const mockAddMediafileCropCoordinates = vi.fn();
  const mockGetValueOfMediafile = vi.fn();
  const mockMediafileSelectionState = ref({
    default: {
      selectedMediafile: null as Entity | null,
      mediafiles: [] as MediaFileEntity[],
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    mocks.useMediafileCrop.mockReturnValue({
      cropSizes: computed(() => undefined),
      addMediafileCropCoordinates: mockAddMediafileCropCoordinates,
      isCropModeEnabled: computed(() => true),
    });

    mocks.useEntityMediafileSelector.mockReturnValue({
      mediafileSelectionState: mockMediafileSelectionState,
      getValueOfMediafile: mockGetValueOfMediafile,
    });

    mockGetValueOfMediafile.mockImplementation((context, field) => {
      if (field === "mimetype") return "image/jpeg";
      if (field === "height") return 800;
      if (field === "width") return 1200;
      if (field === "id") return "test-mediafile-123";
      if (field === "filename") return "test-image.jpg";
      if (field === "display_filename") return "test-image-transcoded.jpg";
      if (field === "original_filename") return "original-test-image.jpg";
      return null;
    });

    // Set up default mediafile state
    mockMediafileSelectionState.value.default.selectedMediafile = {
      id: "test-mediafile-123",
      mimetype: "image/jpeg",
      height: 800,
      width: 1200,
      filename: "test-image.jpg",
    } as Entity;
  });

  const createWrapper = (props = {}) => {
    return mount(MediaViewerNew, {
      props: {
        cropMediafileCoordinatesKey: "test-crop-key",
        currentMediafile: { id: "test-mediafile-123" } as Entity,
        loading: false,
        ...props,
      },
      global: {
        provide: {
          mediafileViewerContext: "default",
        },
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          IIIFViewer: mocks.IIIFViewer,
          VideoPlayer: mocks.VideoPlayer,
          AudioPlayer: mocks.AudioPlayer,
          PDFViewer: mocks.PDFViewer,
          TextViewer: mocks.TextViewer,
          SpinnerLoader: mocks.SpinnerLoader,
          unicon: {
            template: '<span class="unicon"></span>',
            props: ["name", "height", "width"],
          },
        },
      },
    });
  };

  describe("Cropping Functionality", () => {
    it("should initialize useMediafileCrop with correct parameters", () => {
      const currentMediafile = {
        id: "test-mediafile-123",
        mimetype: "image/jpeg",
      };
      createWrapper({ currentMediafile });

      expect(mocks.useMediafileCrop).toHaveBeenCalledWith({
        currentMediafile,
        cropMediafileCoordinatesKey: "test-crop-key",
      });
    });

    it("should pass cropSizes to IIIFViewer when available", async () => {
      const cropSizes = { x: 100, y: 200, w: 300, h: 400 };

      mocks.useMediafileCrop.mockReturnValue({
        cropSizes: computed(() => cropSizes),
        addMediafileCropCoordinates: mockAddMediafileCropCoordinates,
        isCropModeEnabled: computed(() => true),
      });

      const wrapper = createWrapper();
      await nextTick();

      const iiifViewer = wrapper.findComponent(mocks.IIIFViewer);
      expect(iiifViewer.props("cropSizes")).toEqual(cropSizes);
    });

    it("should enable selection in IIIFViewer when crop mode is enabled", async () => {
      mocks.useMediafileCrop.mockReturnValue({
        cropSizes: computed(() => undefined),
        addMediafileCropCoordinates: mockAddMediafileCropCoordinates,
        isCropModeEnabled: computed(() => true),
      });

      const wrapper = createWrapper();
      await nextTick();

      const iiifViewer = wrapper.findComponent(mocks.IIIFViewer);
      expect(iiifViewer.props("enableSelection")).toBe(true);
    });

    it("should disable selection in IIIFViewer when crop mode is disabled", async () => {
      mocks.useMediafileCrop.mockReturnValue({
        cropSizes: computed(() => undefined),
        addMediafileCropCoordinates: mockAddMediafileCropCoordinates,
        isCropModeEnabled: computed(() => false),
      });

      const wrapper = createWrapper();
      await nextTick();

      const iiifViewer = wrapper.findComponent(mocks.IIIFViewer);
      expect(iiifViewer.props("enableSelection")).toBe(false);
    });

    it("should handle crop area selection event from IIIFViewer", async () => {
      const wrapper = createWrapper();
      await nextTick();

      const coordinates = { x: 50, y: 60, w: 200, h: 150 };
      const mediafileId = "test-mediafile-123";

      const iiifViewer = wrapper.findComponent(mocks.IIIFViewer);
      iiifViewer.vm.$emit("selectArea", coordinates, mediafileId);

      expect(mockAddMediafileCropCoordinates).toHaveBeenCalledWith(
        coordinates,
        mediafileId,
      );
    });

    it("should not show IIIFViewer for non-image mimetypes", async () => {
      mockGetValueOfMediafile.mockImplementation((context, field) => {
        if (field === "mimetype") return "video/mp4";
        return null;
      });

      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.findComponent(mocks.IIIFViewer).exists()).toBe(false);
      expect(wrapper.findComponent(mocks.VideoPlayer).exists()).toBe(true);
    });

    it("should pass correct props to IIIFViewer for cropping", async () => {
      const wrapper = createWrapper();
      await nextTick();

      const iiifViewer = wrapper.findComponent(mocks.IIIFViewer);

      expect(iiifViewer.props("imageFilename")).toBe(
        "test-image-transcoded.jpg",
      );
      expect(iiifViewer.props("originalFilename")).toBe(
        "original-test-image.jpg",
      );
      expect(iiifViewer.props("mediafileId")).toBe("test-mediafile-123");
      expect(iiifViewer.props("dimensions")).toEqual({
        width: 1200,
        height: 800,
      });
    });

    it("should handle undefined cropSizes gracefully", async () => {
      mocks.useMediafileCrop.mockReturnValue({
        cropSizes: computed(() => undefined),
        addMediafileCropCoordinates: mockAddMediafileCropCoordinates,
        isCropModeEnabled: computed(() => true),
      });

      const wrapper = createWrapper();
      await nextTick();

      const iiifViewer = wrapper.findComponent(mocks.IIIFViewer);
      expect(iiifViewer.props("cropSizes")).toBeUndefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle loading state", async () => {
      const wrapper = createWrapper({ loading: true });
      await nextTick();

      expect(wrapper.findComponent(mocks.SpinnerLoader).exists()).toBe(true);
      expect(wrapper.findComponent(mocks.IIIFViewer).exists()).toBe(false);
    });

    it("should handle no selected mediafile", async () => {
      mockMediafileSelectionState.value.default.selectedMediafile = null;

      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.findComponent(mocks.IIIFViewer).exists()).toBe(false);
    });

    it("should handle unsupported mimetype", async () => {
      mockGetValueOfMediafile.mockImplementation((context, field) => {
        if (field === "mimetype") return "application/octet-stream";
        return null;
      });

      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.findComponent(mocks.IIIFViewer).exists()).toBe(false);
      expect(wrapper.find(".unicon").exists()).toBe(true);
    });

    it("should handle undefined dimensions", async () => {
      mockGetValueOfMediafile.mockImplementation((context, field) => {
        if (field === "mimetype") return "image/jpeg";
        if (field === "height" || field === "width") return null;
        return "test-value";
      });

      const wrapper = createWrapper();
      await nextTick();

      const iiifViewer = wrapper.findComponent(mocks.IIIFViewer);
      expect(iiifViewer.props("dimensions")).toBeUndefined();
    });
  });

  describe("Mediafile Selection", () => {
    it("should update mediafile selection when props change", async () => {
      const mediafiles = [
        { id: "media1", mimetype: "image/jpeg" },
        { id: "media2", mimetype: "image/png" },
      ] as MediaFileEntity[];

      const wrapper = createWrapper({
        mediafiles: [],
        currentMediafile: undefined,
      });

      await wrapper.setProps({
        mediafiles,
        loading: false,
      });

      await flushPromises();

      expect(mockMediafileSelectionState.value.default.mediafiles).toEqual(
        mediafiles,
      );
      expect(
        mockMediafileSelectionState.value.default.selectedMediafile,
      ).toEqual(mediafiles[0]);
    });

    it("should use currentMediafile when provided", async () => {
      const currentMediafile = {
        id: "specific-media",
        mimetype: "image/jpeg",
      } as Entity;
      const mediafiles = [
        { id: "media1", mimetype: "image/jpeg" },
        { id: "media2", mimetype: "image/png" },
      ] as MediaFileEntity[];

      createWrapper({ currentMediafile, mediafiles });
      await nextTick();

      expect(
        mockMediafileSelectionState.value.default.selectedMediafile,
      ).toEqual(currentMediafile);
    });
  });
});
