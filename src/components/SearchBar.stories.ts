import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SearchBar from "./SearchBar.vue";

const meta: Meta<typeof SearchBar> = {
  title: "Components/SearchBar",
  component: SearchBar,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-[28rem] p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof SearchBar>;

export const WithInput: Story = {
  args: { inputEnabled: true },
};

export const ButtonOnly: Story = {
  args: { inputEnabled: false },
};
