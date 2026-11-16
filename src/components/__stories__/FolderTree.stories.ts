import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide, ref } from "vue";
import FolderTreeLine from "../FolderTreeLine.vue";
import { GetDirectoriesDocument } from "@/generated-types/queries";
import {
  openAndSelect,
  registerDirectories,
} from "@/components/imports/__stories__/importFixtures";

const meta: Meta<typeof FolderTreeLine> = {
  title: "Components/HierarchyTree",
  component: FolderTreeLine,
  parameters: {
    docs: {
      description: {
        component:
          "The folder tree of the network-drive import. A row selects its " +
          "folder; the chevron opens it and loads its subfolders.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FolderTreeLine>;

const roots = [
  { id: "/archive", dir: "archive", parent: "/", has_subdirs: true },
  { id: "/acquisitions-2026", dir: "acquisitions-2026", parent: "/", has_subdirs: true },
  { id: "/loose-scans", dir: "loose-scans", parent: "/", has_subdirs: false },
];

const render = () => ({
  components: { FolderTreeLine },
  setup() {
    const selected = ref();
    provide("selectedDirectory", selected);
    provide("updateSelectedDirectory", (value: unknown) => {
      selected.value = value;
    });
    return { roots, query: GetDirectoriesDocument };
  },
  template: `
    <ul style="max-width:420px;list-style:none;padding:0">
      <li v-for="root in roots" :key="root.id">
        <folder-tree-line :query-for-sub-directories="query" :directory="root" :dictionary="roots" :default-open="false" />
      </li>
    </ul>`,
});

export const Default: Story = {
  beforeEach: registerDirectories,
  render,
  play: openAndSelect,
};

export const Collapsed: Story = {
  beforeEach: registerDirectories,
  render,
};
