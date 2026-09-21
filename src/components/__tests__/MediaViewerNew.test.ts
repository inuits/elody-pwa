import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { computed, nextTick, ref } from "vue";
import MediaViewerNew from "@/components/base/MediaViewerNew.vue";
import type { Entity, MediaFileEntity } from "@/generated-types/queries";

// Hoisted mocks
const mocks = vi.hoisted(() => {
  return {
    useMediafileCrop: vi.fn(),
    useMediafileRecrop: vi.fn(),
    useEntityMediafileSelector: vi.fn(),
    IIIFViewer: {
      default: {},
      template: '<div class="iiif-viewer"></div>',
      props: [
        "enableSelection",
        "cropSizes",
        "showCropped",
        "canRecrop",
        "imageFilename",
        "originalFilename",
        "mediafileId",
        "dimensions",
      ],
      emits: [
        "selectArea",
        "toggle-preview-component:entity-id",
        "toggle-crop-view",
        "open-recrop-modal",
      ],
    },
    RecropModal: {
      default: {},
      template: '<div class="recrop-modal"></div>',
      props: [
        "open",
        "imageFilename",
        "originalFilename",
        "mediafileId",
        "dimensions",
        "saving",
      ],
      emits: ["close", "save"],
    },
    AudioAndVideoPlayer: {
      default: {},
      template: '<div class="audio-and-video-player"></div>',
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
      ArrowCircleLeft: { name: "arrow-circle-left" },
      ArrowCircleRight: { name: "arrow-circle-right" },
      Download: { name: "download" },
    },
  };
});

vi.mock("@/composables/useMediafileCrop", () => ({
  useMediafileCrop: mocks.useMediafileCrop,
}));

vi.mock("@/composables/useMediafileRecrop", () => ({
  useMediafileRecrop: mocks.useMediafileRecrop,
}));

vi.mock("@/composables/useEntityMediafileSelector", () => ({
  useEntityMediafileSelector: mocks.useEntityMediafileSelector,
}));

vi.mock("@/components/IIIFViewer.vue", () => mocks.IIIFViewer);
vi.mock("@/components/RecropModal.vue", () => mocks.RecropModal);
vi.mock(
  "@/components/base/AudioAndVideoPlayer.vue",
  () => mocks.AudioAndVideoPlayer,
);
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
  const mockOpenRecropModal = vi.fn();
  const mockCloseRecropModal = vi.fn();
  const mockSaveRecrop = vi.fn().mockResolvedValue(undefined);
  const mockGetValueOfMediafile = vi.fn();
  const mockSelectNextMediafile = vi.fn();
  const mockSelectPreviousMediafile = vi.fn();
  const mockMediafileSelectionState = ref({
    default: {
      selectedMediafile: null as Entity | null,
      mediafiles: [] as MediaFileEntity[],
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockSaveRecrop.mockResolvedValue(undefined);

    // Setup default mocks
    mocks.useMediafileCrop.mockReturnValue({
      cropSizes: computed(() => undefined),
      addMediafileCropCoordinates: mockAddMediafileCropCoordinates,
      isCropModeEnabled: computed(() => true),
    });

    mocks.useMediafileRecrop.mockReturnValue({
      isRecropModalOpen: computed(() => false),
      canRecrop: computed(() => false),
      openRecropModal: mockOpenRecropModal,
      closeRecropModal: mockCloseRecropModal,
      saveRecrop: mockSaveRecrop,
    });

    mocks.useEntityMediafileSelector.mockReturnValue({
      mediafileSelectionState: mockMediafileSelectionState,
      getValueOfMediafile: mockGetValueOfMediafile,
      selectNextMediafile: mockSelectNextMediafile,
      selectPreviousMediafile: mockSelectPreviousMediafile,
    });

    mockMediafileSelectionState.value.default.mediafiles = [];

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
          RecropModal: mocks.RecropModal,
          AudioAndVideoPlayer: mocks.AudioAndVideoPlayer,
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
      expect(wrapper.findComponent(mocks.AudioAndVideoPlayer).exists()).toBe(
        true,
      );
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

  describe("Navigation", () => {
    it("should not show navigation buttons when only one mediafile", async () => {
      mockMediafileSelectionState.value.default.mediafiles = [
        { id: "media1", mimetype: "image/jpeg" } as MediaFileEntity,
      ];
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find('[data-testid="nav-prev-mediafile"]').exists()).toBe(
        false,
      );
      expect(wrapper.find('[data-testid="nav-next-mediafile"]').exists()).toBe(
        false,
      );
    });

    it("should show navigation buttons when multiple mediafiles exist", async () => {
      mockMediafileSelectionState.value.default.mediafiles = [
        { id: "media1", mimetype: "image/jpeg" } as MediaFileEntity,
        { id: "media2", mimetype: "image/png" } as MediaFileEntity,
      ];
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find('[data-testid="nav-prev-mediafile"]').exists()).toBe(
        true,
      );
      expect(wrapper.find('[data-testid="nav-next-mediafile"]').exists()).toBe(
        true,
      );
    });

    it("should call selectNextMediafile and emit togglePreviewComponent when next clicked", async () => {
      mockSelectNextMediafile.mockReturnValue("media2");
      mockMediafileSelectionState.value.default.mediafiles = [
        { id: "media1", mimetype: "image/jpeg" } as MediaFileEntity,
        { id: "media2", mimetype: "image/png" } as MediaFileEntity,
      ];
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find('[data-testid="nav-next-mediafile"]').trigger("click");

      expect(mockSelectNextMediafile).toHaveBeenCalledWith("default");
      expect(wrapper.emitted("togglePreviewComponent")?.[0]).toEqual([
        "media2",
      ]);
    });

    it("should call selectPreviousMediafile and emit togglePreviewComponent when prev clicked", async () => {
      mockSelectPreviousMediafile.mockReturnValue("media1");
      mockMediafileSelectionState.value.default.mediafiles = [
        { id: "media1", mimetype: "image/jpeg" } as MediaFileEntity,
        { id: "media2", mimetype: "image/png" } as MediaFileEntity,
      ];
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find('[data-testid="nav-prev-mediafile"]').trigger("click");

      expect(mockSelectPreviousMediafile).toHaveBeenCalledWith("default");
      expect(wrapper.emitted("togglePreviewComponent")?.[0]).toEqual([
        "media1",
      ]);
    });

    it("should not emit togglePreviewComponent when selectNextMediafile returns undefined", async () => {
      mockSelectNextMediafile.mockReturnValue(undefined);
      mockMediafileSelectionState.value.default.mediafiles = [
        { id: "media1" } as MediaFileEntity,
        { id: "media2" } as MediaFileEntity,
      ];
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find('[data-testid="nav-next-mediafile"]').trigger("click");

      expect(wrapper.emitted("togglePreviewComponent")).toBeUndefined();
    });

    it("should show navigation when image is processing and multiple mediafiles exist", async () => {
      mockGetValueOfMediafile.mockImplementation(
        (_ctx: string, field: string) => {
          if (field === "mimetype") return "image/jpeg";
          if (field === "display_filename") return null;
          if (field === "id") return "test-mediafile-123";
          return null;
        },
      );
      mockMediafileSelectionState.value.default.mediafiles = [
        { id: "media1", mimetype: "image/jpeg" } as MediaFileEntity,
        { id: "media2", mimetype: "image/png" } as MediaFileEntity,
      ];
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find('[data-testid="nav-prev-mediafile"]').exists()).toBe(
        true,
      );
      expect(wrapper.find('[data-testid="nav-next-mediafile"]').exists()).toBe(
        true,
      );
    });

    it("should show navigation for PDF viewer with multiple mediafiles", async () => {
      mockGetValueOfMediafile.mockImplementation(
        (_ctx: string, field: string) => {
          if (field === "mimetype") return "application/pdf";
          if (field === "id") return "test-mediafile-123";
          return null;
        },
      );
      mockMediafileSelectionState.value.default.mediafiles = [
        { id: "media1" } as MediaFileEntity,
        { id: "media2" } as MediaFileEntity,
      ];
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find('[data-testid="nav-prev-mediafile"]').exists()).toBe(
        true,
      );
      expect(wrapper.find('[data-testid="nav-next-mediafile"]').exists()).toBe(
        true,
      );
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

  describe("Recrop Functionality", () => {
    it("initializes useMediafileRecrop with parentEntityId, parentEntityType, relationType and cropMediafileCoordinatesKey", () => {
      createWrapper({
        parentEntityId: "parent-1",
        parentEntityType: "inscription",
        relationType: "refMediafiles",
      });

      expect(mocks.useMediafileRecrop).toHaveBeenCalledWith({
        parentEntityId: "parent-1",
        parentEntityType: "inscription",
        relationType: "refMediafiles",
        cropMediafileCoordinatesKey: "test-crop-key",
      });
    });

    it("enableSelection on the main viewer reflects only the add-flow crop mode, independent of canRecrop", async () => {
      mocks.useMediafileCrop.mockReturnValue({
        cropSizes: computed(() => undefined),
        addMediafileCropCoordinates: mockAddMediafileCropCoordinates,
        isCropModeEnabled: computed(() => false),
      });
      mocks.useMediafileRecrop.mockReturnValue({
        isRecropModalOpen: computed(() => false),
        canRecrop: computed(() => true),
        openRecropModal: mockOpenRecropModal,
        closeRecropModal: mockCloseRecropModal,
        saveRecrop: mockSaveRecrop,
      });

      const wrapper = createWrapper();
      await nextTick();

      expect(
        wrapper.findComponent(mocks.IIIFViewer).props("enableSelection"),
      ).toBe(false);
    });

    it("passes canRecrop through to the main IIIFViewer", async () => {
      mocks.useMediafileRecrop.mockReturnValue({
        isRecropModalOpen: computed(() => false),
        canRecrop: computed(() => true),
        openRecropModal: mockOpenRecropModal,
        closeRecropModal: mockCloseRecropModal,
        saveRecrop: mockSaveRecrop,
      });

      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.findComponent(mocks.IIIFViewer).props("canRecrop")).toBe(
        true,
      );
    });

    it("dispatches selectArea from the main viewer to addMediafileCropCoordinates when add-flow crop mode is enabled", async () => {
      mocks.useMediafileCrop.mockReturnValue({
        cropSizes: computed(() => undefined),
        addMediafileCropCoordinates: mockAddMediafileCropCoordinates,
        isCropModeEnabled: computed(() => true),
      });

      const wrapper = createWrapper();
      await nextTick();

      const coordinates = { x: 1, y: 2, w: 3, h: 4 };
      wrapper
        .findComponent(mocks.IIIFViewer)
        .vm.$emit("selectArea", coordinates, "test-mediafile-123");

      expect(mockAddMediafileCropCoordinates).toHaveBeenCalledWith(
        coordinates,
        "test-mediafile-123",
      );
    });

    it("ignores selectArea from the main viewer when add-flow crop mode is not enabled", async () => {
      mocks.useMediafileCrop.mockReturnValue({
        cropSizes: computed(() => undefined),
        addMediafileCropCoordinates: mockAddMediafileCropCoordinates,
        isCropModeEnabled: computed(() => false),
      });

      const wrapper = createWrapper();
      await nextTick();

      wrapper
        .findComponent(mocks.IIIFViewer)
        .vm.$emit(
          "selectArea",
          { x: 1, y: 2, w: 3, h: 4 },
          "test-mediafile-123",
        );

      expect(mockAddMediafileCropCoordinates).not.toHaveBeenCalled();
    });

    it("calls openRecropModal when the main IIIFViewer emits open-recrop-modal", async () => {
      const wrapper = createWrapper();
      await nextTick();

      wrapper.findComponent(mocks.IIIFViewer).vm.$emit("open-recrop-modal");

      expect(mockOpenRecropModal).toHaveBeenCalledOnce();
    });

    it("toggles show-cropped on the main viewer when it emits toggle-crop-view", async () => {
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.findComponent(mocks.IIIFViewer).props("showCropped")).toBe(
        true,
      );

      wrapper.findComponent(mocks.IIIFViewer).vm.$emit("toggle-crop-view");
      await nextTick();

      expect(wrapper.findComponent(mocks.IIIFViewer).props("showCropped")).toBe(
        false,
      );

      wrapper.findComponent(mocks.IIIFViewer).vm.$emit("toggle-crop-view");
      await nextTick();

      expect(wrapper.findComponent(mocks.IIIFViewer).props("showCropped")).toBe(
        true,
      );
    });

    it("passes isRecropModalOpen and the current mediafile's info through to RecropModal", async () => {
      mocks.useMediafileRecrop.mockReturnValue({
        isRecropModalOpen: computed(() => true),
        canRecrop: computed(() => true),
        openRecropModal: mockOpenRecropModal,
        closeRecropModal: mockCloseRecropModal,
        saveRecrop: mockSaveRecrop,
      });

      const wrapper = createWrapper();
      await nextTick();

      const modal = wrapper.findComponent(mocks.RecropModal);
      expect(modal.props("open")).toBe(true);
      expect(modal.props("imageFilename")).toBe("test-image-transcoded.jpg");
      expect(modal.props("originalFilename")).toBe("original-test-image.jpg");
      expect(modal.props("mediafileId")).toBe("test-mediafile-123");
    });

    it("calls closeRecropModal when RecropModal emits close", async () => {
      mocks.useMediafileRecrop.mockReturnValue({
        isRecropModalOpen: computed(() => true),
        canRecrop: computed(() => true),
        openRecropModal: mockOpenRecropModal,
        closeRecropModal: mockCloseRecropModal,
        saveRecrop: mockSaveRecrop,
      });

      const wrapper = createWrapper();
      await nextTick();

      wrapper.findComponent(mocks.RecropModal).vm.$emit("close");

      expect(mockCloseRecropModal).toHaveBeenCalledOnce();
    });

    it("calls saveRecrop when RecropModal emits save, and applies the crop optimistically once it resolves", async () => {
      mocks.useMediafileRecrop.mockReturnValue({
        isRecropModalOpen: computed(() => true),
        canRecrop: computed(() => true),
        openRecropModal: mockOpenRecropModal,
        closeRecropModal: mockCloseRecropModal,
        saveRecrop: mockSaveRecrop,
      });

      const wrapper = createWrapper();
      await nextTick();

      const coordinates = { x: 5, y: 6, w: 7, h: 8 };
      wrapper
        .findComponent(mocks.RecropModal)
        .vm.$emit("save", coordinates, "test-mediafile-123");
      await flushPromises();

      expect(mockSaveRecrop).toHaveBeenCalledWith(
        coordinates,
        "test-mediafile-123",
      );
      expect(
        wrapper.findComponent(mocks.IIIFViewer).props("cropSizes"),
      ).toEqual(coordinates);
      expect(wrapper.findComponent(mocks.IIIFViewer).props("showCropped")).toBe(
        true,
      );
    });

    it("marks RecropModal as saving while the save is in flight, and clears it afterwards", async () => {
      mocks.useMediafileRecrop.mockReturnValue({
        isRecropModalOpen: computed(() => true),
        canRecrop: computed(() => true),
        openRecropModal: mockOpenRecropModal,
        closeRecropModal: mockCloseRecropModal,
        saveRecrop: mockSaveRecrop,
      });
      let resolveSave: () => void = () => {};
      mockSaveRecrop.mockReturnValueOnce(
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        }),
      );

      const wrapper = createWrapper();
      await nextTick();

      wrapper
        .findComponent(mocks.RecropModal)
        .vm.$emit("save", { x: 1, y: 2, w: 3, h: 4 }, "test-mediafile-123");
      await nextTick();

      expect(wrapper.findComponent(mocks.RecropModal).props("saving")).toBe(
        true,
      );

      resolveSave();
      await flushPromises();

      expect(wrapper.findComponent(mocks.RecropModal).props("saving")).toBe(
        false,
      );
    });

    it("refetches entities after a successful recrop save, so the saved crop is the source of truth", async () => {
      mocks.useMediafileRecrop.mockReturnValue({
        isRecropModalOpen: computed(() => true),
        canRecrop: computed(() => true),
        openRecropModal: mockOpenRecropModal,
        closeRecropModal: mockCloseRecropModal,
        saveRecrop: mockSaveRecrop,
      });
      const mockRefetchEntities = vi.fn().mockResolvedValue(undefined);

      const wrapper = createWrapper({ refetchEntities: mockRefetchEntities });
      await nextTick();

      wrapper
        .findComponent(mocks.RecropModal)
        .vm.$emit("save", { x: 5, y: 6, w: 7, h: 8 }, "test-mediafile-123");
      await flushPromises();

      expect(mockRefetchEntities).toHaveBeenCalledOnce();
    });

    it("does not apply the optimistic crop override when saveRecrop rejects", async () => {
      mocks.useMediafileRecrop.mockReturnValue({
        isRecropModalOpen: computed(() => true),
        canRecrop: computed(() => true),
        openRecropModal: mockOpenRecropModal,
        closeRecropModal: mockCloseRecropModal,
        saveRecrop: mockSaveRecrop,
      });
      mockSaveRecrop.mockRejectedValueOnce(new Error("network error"));
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const wrapper = createWrapper();
      await nextTick();

      const coordinates = { x: 5, y: 6, w: 7, h: 8 };
      wrapper
        .findComponent(mocks.RecropModal)
        .vm.$emit("save", coordinates, "test-mediafile-123");
      await flushPromises();

      const iiifViewer = wrapper.findComponent(mocks.IIIFViewer);
      expect(iiifViewer.props("cropSizes")).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("does not fail when no refetchEntities function is provided", async () => {
      mocks.useMediafileRecrop.mockReturnValue({
        isRecropModalOpen: computed(() => true),
        canRecrop: computed(() => true),
        openRecropModal: mockOpenRecropModal,
        closeRecropModal: mockCloseRecropModal,
        saveRecrop: mockSaveRecrop,
      });
      const wrapper = createWrapper();
      await nextTick();

      wrapper
        .findComponent(mocks.RecropModal)
        .vm.$emit("save", { x: 5, y: 6, w: 7, h: 8 }, "test-mediafile-123");

      await expect(flushPromises()).resolves.not.toThrow();
    });
  });
});
