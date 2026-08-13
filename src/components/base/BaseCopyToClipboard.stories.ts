import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseCopyToClipboard from "./BaseCopyToClipboard.vue";

const meta: Meta<typeof BaseCopyToClipboard> = {
  title: "Base/BaseCopyToClipboard",
  component: BaseCopyToClipboard,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-fit p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof BaseCopyToClipboard>;

export const Text: Story = {
  args: {
    value: "OBJ-2024-0157",
  },
};

// Coordinate objects are normalized to a "lat, lng" string before copying.
export const Coordinates: Story = {
  args: {
    value: { latitude: 51.0543, longitude: 3.7174 },
  },
};
