import type { Meta, StoryObj } from "@storybook/vue3-vite";
import FolderTree from "./FolderTree.vue";
import type { Directory } from "@/generated-types/queries";

const directories = [
  { id: "beeldarchief", dir: "beeldarchief", parent: "/", has_subdirs: true },
  { id: "aanwinsten_2026", dir: "aanwinsten_2026", parent: "/", has_subdirs: false },
  { id: "digitalisatie", dir: "digitalisatie", parent: "/", has_subdirs: false },
] as unknown as Directory[];

const meta: Meta<typeof FolderTree> = {
  title: "Components/FolderTree",
  component: FolderTree,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof FolderTree>;

export const Default: Story = {
  args: { directories },
};
