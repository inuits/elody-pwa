import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseSlider from "./BaseSlider.vue";

const meta: Meta<typeof BaseSlider> = {
  title: "Base/BaseSlider",
  component: BaseSlider,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-8"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof BaseSlider>;

export const SingleValue: Story = {
  args: {
    modelValue: 40,
    min: 0,
    max: 100,
  },
};

export const Range: Story = {
  args: {
    modelValue: [1850, 1950],
    min: 1800,
    max: 2024,
  },
};
