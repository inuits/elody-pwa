import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BasePaginationSkeleton from "./BasePaginationSkeleton.vue";

const meta: Meta<typeof BasePaginationSkeleton> = {
  title: "Base/Skeletons/BasePaginationSkeleton",
  component: BasePaginationSkeleton,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-fit p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof BasePaginationSkeleton>;

export const Default: Story = {};
