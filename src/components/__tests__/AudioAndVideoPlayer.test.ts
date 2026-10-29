import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import AudioAndVideoPlayer from "@/components/base/AudioAndVideoPlayer.vue";

vi.mock("@/composables/useEntityMediafileSelector", () => ({
  useEntityMediafileSelector: () => ({
    getValueOfMediafile: () => "video/mp4",
  }),
}));

const ViewerToolbarStub = {
  name: "ViewerToolbar",
  props: ["mode", "mediafileId", "originalFilename"],
  template: "<div />",
};

const source = {
  id: "mediafile-1",
  intialValues: { original_filename: "clip.mp4" },
};

const getWrapper = (mediaType: "Audio" | "Video" = "Video") =>
  mount(AudioAndVideoPlayer, {
    props: { source, mediaType },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: { ViewerToolbar: ViewerToolbarStub, unicon: true },
    },
  });

describe("AudioAndVideoPlayer - toolbar", () => {
  it("uses the shared viewer toolbar in av mode for this file", () => {
    const toolbar = getWrapper().findComponent(ViewerToolbarStub);
    expect(toolbar.props("mode")).toBe("av");
    expect(toolbar.props("mediafileId")).toBe("mediafile-1");
    expect(toolbar.props("originalFilename")).toBe("clip.mp4");
  });

  it("has no download button of its own", () => {
    expect(getWrapper().findAll("button")).toHaveLength(0);
  });

  it("keeps the native media controls", () => {
    expect(getWrapper("Video").find("video").attributes()).toHaveProperty(
      "controls",
    );
    expect(getWrapper("Audio").find("audio").attributes()).toHaveProperty(
      "controls",
    );
  });
});
