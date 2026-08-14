import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseVirtualKeyboard from "./BaseVirtualKeyboard.vue";

const meta: Meta<typeof BaseVirtualKeyboard> = {
  title: "Base/BaseVirtualKeyboard",
  component: BaseVirtualKeyboard,
  tags: ["autodocs"],
  // Renders a keyboard toggle icon; clicking it opens the fixed-position
  // simple-keyboard at the bottom of the viewport.
  decorators: [() => ({ template: '<div class="h-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof BaseVirtualKeyboard>;

export const Default: Story = {
  args: {
    input: "",
  },
};

export const WithInput: Story = {
  args: {
    input: "Zelfportret",
  },
};
