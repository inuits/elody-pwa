import type { Meta, StoryObj } from "@storybook/vue3-vite";
import LoadingList from "./LoadingList.vue";

const meta: Meta<typeof LoadingList> = {
  title: "Base/LoadingList",
  component: LoadingList,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof LoadingList>;

export const Default: Story = {};
