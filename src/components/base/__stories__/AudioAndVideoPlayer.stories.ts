import type { Meta, StoryObj } from "@storybook/vue3-vite";
import AudioAndVideoPlayer from "../AudioAndVideoPlayer.vue";
import { mediafile, withMediafileContext } from "./mediafileFixtures";

const meta: Meta<typeof AudioAndVideoPlayer> = {
  title: "Base/AudioAndVideoPlayer",
  component: AudioAndVideoPlayer,
  decorators: [withMediafileContext("story-av-player")],
  argTypes: {
    mediaType: { control: "inline-radio", options: ["Audio", "Video"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Native audio or video player for a mediafile, under the shared viewer toolbar. " +
          "It streams /api/mediafile/{id}, which only a running collection API serves, so in Storybook the controls show but nothing plays.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AudioAndVideoPlayer>;

export const Default: Story = {
  args: { mediaType: "Video", source: mediafile("video") },
  render: (args) => ({
    components: { AudioAndVideoPlayer },
    setup: () => ({ args }),
    template: `<div style="height:380px"><audio-and-video-player v-bind="args" :key="args.mediaType" /></div>`,
  }),
};
