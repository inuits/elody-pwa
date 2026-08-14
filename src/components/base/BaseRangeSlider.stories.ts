import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseRangeSlider from "./BaseRangeSlider.vue";

const meta: Meta<typeof BaseRangeSlider> = {
  title: "Base/BaseRangeSlider",
  component: BaseRangeSlider,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-8"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof BaseRangeSlider>;

export const Years: Story = {
  args: {
    from: 1880,
    to: 1920,
    min: 1800,
    max: 2000,
  },
};

export const WithUnit: Story = {
  args: {
    from: 20,
    to: 80,
    min: 0,
    max: 120,
    unit: "cm",
  },
};
