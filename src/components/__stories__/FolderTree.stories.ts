import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import { gql } from "@apollo/client/core";
import FolderTreeLine from "../FolderTreeLine.vue";

const meta: Meta = {
  // Story id components-hierarchytree--default, per MANIFEST.md.
  title: "Components/HierarchyTree",
  parameters: {
    docs: {
      description: {
        component:
          "The folder tree behind the network-drive import, on the tree " +
          "pattern: treeitems with aria-expanded, aria-level and " +
          "aria-selected. Selecting and disclosing are two separate buttons " +
          "— the title selects, the ⌄/⌃ toggles — so neither steals the " +
          "other's click, and both are reachable from the keyboard. The " +
          "selected row wears the accent wash like every selected row; " +
          "children lazy-load on first expand.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const QUERY = gql`
  query storyDirs($dir: String!) {
    directories(dir: $dir) {
      id
    }
  }
`;

const dir = (id: string, name: string, hasSubdirs: boolean) => ({
  id,
  dir: name,
  parent: "/",
  has_subdirs: hasSubdirs,
});

export const Default: Story = {
  render: () => ({
    components: { FolderTreeLine },
    setup() {
      provide("updateSelectedDirectory", () => undefined);
      provide("selectedDirectory", dir("/archief", "archief", true));
      return {
        QUERY,
        roots: [
          dir("/archief", "archief", true),
          dir("/aanwinsten-2026", "aanwinsten-2026", true),
          dir("/losse-scans", "losse-scans", false),
        ],
      };
    },
    template: `
      <div style="max-width:380px">
        <folder-tree-line
          v-for="root in roots"
          :key="root.id"
          :query-for-sub-directories="QUERY"
          :directory="root"
          :dictionary="roots"
          :default-open="false"
        />
      </div>`,
  }),
};
