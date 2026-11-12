import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseCopyToClipboard from "../BaseCopyToClipboard.vue";

const meta: Meta<typeof BaseCopyToClipboard> = {
  title: "Base/BaseCopyToClipboard",
  component: BaseCopyToClipboard,
  argTypes: {
    value: { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Small copy button next to a metadata value. It copies the value " +
          "(coordinates as 'lat, long') and briefly confirms with 'Copied'.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseCopyToClipboard>;

export const Default: Story = {
  args: { value: "tg:lhpa:9783:m1" },
};

export const Coordinates: Story = {
  args: { value: { latitude: 51.2194, longitude: 4.4025 } },
  argTypes: { value: { control: "object" } },
};
