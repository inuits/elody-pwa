import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ImportListItem from "./ImportListItem.vue";

// One selectable row in the magazine-import list; the item is the folder name
// on the network drive.
const meta: Meta<typeof ImportListItem> = {
  title: "Imports/ImportListItem",
  component: ImportListItem,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof ImportListItem>;

export const Default: Story = {
  args: {
    item: "magazines/2026/week-32",
    selectedItem: "",
  },
};

export const Selected: Story = {
  args: {
    item: "magazines/2026/week-32",
    selectedItem: "magazines/2026/week-32",
  },
};
