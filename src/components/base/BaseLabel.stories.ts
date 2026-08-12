import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseLabel from "./BaseLabel.vue";

const meta: Meta<typeof BaseLabel> = {
  title: "Base/BaseLabel",
  component: BaseLabel,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-fit p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof BaseLabel>;

export const Default: Story = {
  args: {
    name: "Publiek domein",
  },
};

export const Accent: Story = {
  args: {
    name: "In restauratie",
    color: "accent-highlight",
  },
};

export const Neutral: Story = {
  args: {
    name: "Gearchiveerd",
    color: "neutral-30",
  },
};
