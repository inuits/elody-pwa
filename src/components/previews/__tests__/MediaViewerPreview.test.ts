import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import MediaViewerPreview from "@/components/previews/MediaViewerPreview.vue";

const { MediaViewerNewStub } = vi.hoisted(() => ({
  MediaViewerNewStub: {
    props: [
      "mediafiles",
      "currentMediafile",
      "cropMediafileCoordinatesKey",
      "parentEntityId",
      "parentEntityType",
      "relationType",
      "refetchEntities",
    ],
    template: '<div class="media-viewer-new-stub" />',
  },
}));

vi.mock("@/components/base/MediaViewerNew.vue", () => ({
  default: MediaViewerNewStub,
}));

vi.mock("@/components/SpinnerLoader.vue", () => ({
  default: { template: "<div />" },
}));

const getWrapper = (props = {}) =>
  mount(MediaViewerPreview, {
    props: {
      mediafiles: [],
      mediafilesLoading: false,
      entityId: "mediafile-1",
      cropMediafileCoordinatesKey: "coordinates",
      ...props,
    },
  });

describe("MediaViewerPreview - forwarding parentEntityId/relationType", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards parentEntityId and relationType to MediaViewerNew when provided", () => {
    const wrapper = getWrapper({
      parentEntityId: "parent-1",
      relationType: "refMediafiles",
    });

    const mediaViewerNew = wrapper.findComponent(MediaViewerNewStub);
    expect(mediaViewerNew.props("parentEntityId")).toBe("parent-1");
    expect(mediaViewerNew.props("relationType")).toBe("refMediafiles");
  });

  it("leaves parentEntityId/relationType undefined when not provided", () => {
    const wrapper = getWrapper();

    const mediaViewerNew = wrapper.findComponent(MediaViewerNewStub);
    expect(mediaViewerNew.props("parentEntityId")).toBeUndefined();
    expect(mediaViewerNew.props("relationType")).toBeUndefined();
  });

  it("forwards refetchEntities to MediaViewerNew when provided", () => {
    const refetchEntities = vi.fn().mockResolvedValue(undefined);
    const wrapper = getWrapper({ refetchEntities });

    const mediaViewerNew = wrapper.findComponent(MediaViewerNewStub);
    expect(mediaViewerNew.props("refetchEntities")).toBe(refetchEntities);
  });

  it("forwards parentEntityType to MediaViewerNew when provided", () => {
    const wrapper = getWrapper({ parentEntityType: "inscription" });

    const mediaViewerNew = wrapper.findComponent(MediaViewerNewStub);
    expect(mediaViewerNew.props("parentEntityType")).toBe("inscription");
  });
});
