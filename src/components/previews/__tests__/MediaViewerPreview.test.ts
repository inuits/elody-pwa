import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import MediaViewerPreview from "@/components/previews/MediaViewerPreview.vue";
import { isCompact } from "@/composables/useNavMenu";

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
      "hideNavigation",
    ],
    template: '<div class="media-viewer-new-stub" />',
  },
}));

vi.mock("@/components/base/MediaViewerNew.vue", () => ({
  default: MediaViewerNewStub,
}));

vi.mock("@/composables/useNavMenu", async () => {
  const { ref } = await import("vue");
  return { isCompact: ref(false) };
});
vi.mock("@/composables/useListItemHelper", () => ({
  useListItemHelper: () => ({
    getMediaFilenameFromEntity: (entity: { file?: string }) => entity.file,
  }),
}));
vi.mock("@/helpers", () => ({
  getTitleOrNameFromEntity: (entity: { title: string }) => entity.title,
  stringIsUrl: () => false,
}));
vi.mock("@/components/base/ImageViewer.vue", () => ({
  default: { props: ["url"], template: '<img :src="url" />' },
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

describe("MediaViewerPreview - thumbnail strip on a small screen", () => {
  const mediafiles = [
    { id: "mediafile-1", title: "sheep.JPEG", file: "sheep.jpg" },
    { id: "mediafile-2", title: "front.tif", file: "front.jpg" },
    { id: "mediafile-3", title: "back.tif" },
  ];
  const thumbs = (wrapper: ReturnType<typeof getWrapper>) =>
    wrapper.findAll('[data-cy="preview-thumbnail"]');

  beforeEach(() => {
    isCompact.value = true;
  });
  afterEach(() => {
    isCompact.value = false;
  });

  it("shows a thumbnail per mediafile, named after it", () => {
    const wrapper = getWrapper({ mediafiles });

    expect(thumbs(wrapper).map((thumb) => thumb.attributes("aria-label")))
      .toEqual(["sheep.JPEG", "front.tif", "back.tif"]);
    expect(thumbs(wrapper)[1].find("img").attributes("src")).toBe(
      "/api/iiif/3/front.jpg/square/^100,/0/default.jpg",
    );
  });

  it("marks the mediafile on screen", () => {
    const wrapper = getWrapper({ mediafiles });

    expect(thumbs(wrapper)[0].attributes("aria-current")).toBe("true");
    expect(thumbs(wrapper)[1].attributes("aria-current")).toBeUndefined();
  });

  it("switches to the tapped mediafile", async () => {
    const wrapper = getWrapper({ mediafiles });

    await thumbs(wrapper)[2].trigger("click");
    await thumbs(wrapper)[0].trigger("click");

    expect(wrapper.emitted("togglePreviewComponent")).toEqual([
      ["mediafile-3"],
    ]);
  });

  it("replaces the viewer's arrows", () => {
    const viewer = getWrapper({ mediafiles }).findComponent(MediaViewerNewStub);

    expect(viewer.props("hideNavigation")).toBe(true);
  });

  it("keeps the arrows without a strip", () => {
    isCompact.value = false;
    const viewer = getWrapper({ mediafiles }).findComponent(MediaViewerNewStub);

    expect(viewer.props("hideNavigation")).toBe(false);
  });

  it("is left out for a single mediafile", () => {
    expect(thumbs(getWrapper({ mediafiles: [mediafiles[0]] }))).toHaveLength(0);
  });

  it("is left out on a wide screen", () => {
    isCompact.value = false;

    expect(thumbs(getWrapper({ mediafiles }))).toHaveLength(0);
  });
});
