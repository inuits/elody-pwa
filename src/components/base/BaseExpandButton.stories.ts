import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseExpandButton from "./BaseExpandButton.vue";

const meta: Meta<typeof BaseExpandButton> = {
  title: "Base/BaseExpandButton",
  component: BaseExpandButton,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "select", options: ["left", "right"] },
  },
  decorators: [() => ({ template: '<div class="w-fit p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof BaseExpandButton>;

export const Right: Story = {
  args: {
    orientation: "right",
  },
};

export const Left: Story = {
  args: {
    orientation: "left",
  },
};

export const Hidden: Story = {
  args: {
    isHidden: true,
  },
};
