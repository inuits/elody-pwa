import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ListItemSkeleton from "./ListItemSkeleton.vue";

const meta: Meta<typeof ListItemSkeleton> = {
  title: "Base/Skeletons/ListItemSkeleton",
  component: ListItemSkeleton,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof ListItemSkeleton>;

export const Default: Story = {
  args: {
    amount: 5,
  },
};

export const FullPage: Story = {
  args: {
    amount: 20,
  },
};
