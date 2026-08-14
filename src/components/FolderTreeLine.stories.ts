import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { gql } from "@apollo/client/core";
import FolderTreeLine from "./FolderTreeLine.vue";
import type { Directory } from "@/generated-types/queries";

// The mock Apollo client resolves every query with empty data, so expanding
// a directory simply yields no children.
const subDirectoriesQuery = gql`
  query GetDirectories($dir: String!) {
    Directories(dir: $dir) {
      id
      dir
      has_subdirs
      parent
    }
  }
`;

const meta: Meta<typeof FolderTreeLine> = {
  title: "Components/FolderTreeLine",
  component: FolderTreeLine,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof FolderTreeLine>;

export const WithSubdirectories: Story = {
  args: {
    queryForSubDirectories: subDirectoriesQuery,
    directory: {
      id: "beeldarchief",
      dir: "beeldarchief",
      parent: "/",
      has_subdirs: true,
    } as unknown as Directory,
    dictionary: [] as unknown as Directory[],
    defaultOpen: false,
  },
};

export const Leaf: Story = {
  args: {
    queryForSubDirectories: subDirectoriesQuery,
    directory: {
      id: "aanwinsten_2026",
      dir: "aanwinsten_2026",
      parent: "/",
      has_subdirs: false,
    } as unknown as Directory,
    dictionary: [] as unknown as Directory[],
    defaultOpen: false,
  },
};
