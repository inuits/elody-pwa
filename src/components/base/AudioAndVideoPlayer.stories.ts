import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import AudioAndVideoPlayer from "./AudioAndVideoPlayer.vue";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";

const videoSource = {
  id: "mediafile-video-001",
  intialValues: {
    original_filename: "interview-conservator.mp4",
    mimetype: "video/mp4",
  },
} as any;

const audioSource = {
  id: "mediafile-audio-001",
  intialValues: {
    original_filename: "audiotour-zaal-3.mp3",
    mimetype: "audio/mpeg",
  },
} as any;

const meta: Meta<typeof AudioAndVideoPlayer> = {
  title: "Base/AudioAndVideoPlayer",
  component: AudioAndVideoPlayer,
  tags: ["autodocs"],
  argTypes: {
    mediaType: { control: "select", options: ["Audio", "Video"] },
  },
  // The component reads its mimetype from the injected mediafile-viewer
  // context, so the story registers a context before rendering. It also
  // sizes to its container (h-full), hence the sized wrapper.
  render: (args) => ({
    components: { AudioAndVideoPlayer },
    setup() {
      const { addMediafileSelectionStateContext } =
        useEntityMediafileSelector();
      addMediafileSelectionStateContext("storybook");
      provide("mediafileViewerContext", "storybook");
      return { args };
    },
    template:
      '<div class="w-[32rem] h-80 p-4"><AudioAndVideoPlayer v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof AudioAndVideoPlayer>;

export const Video: Story = {
  args: {
    source: videoSource,
    mediaType: "Video",
  },
};

export const Audio: Story = {
  args: {
    source: audioSource,
    mediaType: "Audio",
  },
};
