import type { Meta, StoryObj } from "@storybook/vue3-vite";
import AudioPlayer from "./AudioPlayer.vue";

const meta: Meta<typeof AudioPlayer> = {
  title: "Base/AudioPlayer",
  component: AudioPlayer,
  tags: ["autodocs"],
  // Sizes to its container; the audio source points at the mediafile API and
  // stays silent without a backend, but the player chrome renders.
  decorators: [() => ({ template: '<div class="w-96 h-24 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof AudioPlayer>;

export const Default: Story = {
  args: {
    source: {
      id: "mediafile-audio-001",
      mimetype: "audio/mpeg",
    },
  },
};
