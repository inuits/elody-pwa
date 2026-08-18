import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide, ref } from "vue";
import { gql } from "@apollo/client/core";
import FolderTreeLine from "@/components/FolderTreeLine.vue";
import ImportListItem from "../ImportListItem.vue";
import BaseButton from "@/components/base/BaseButton.vue";

const meta: Meta = {
  // Story id components-importbrowser--default, per MANIFEST.md.
  title: "Components/ImportBrowser",
  parameters: {
    docs: {
      description: {
        component:
          "Browsing a network drive: the folder tree on the left, pick rows " +
          "on the right — every row a real button with aria-pressed, " +
          "selection as the accent wash — and the import commit in the " +
          "footer, disabled until something is picked. The docs' fuller " +
          "two-pane file table (per-file checkboxes, path breadcrumb) is a " +
          "feature the flow does not have yet; recorded in DESIGN_SYSTEM.md.",
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

export const Default: Story = {
  render: () => ({
    components: { FolderTreeLine, ImportListItem, BaseButton },
    setup() {
      provide("updateSelectedDirectory", () => undefined);
      provide("selectedDirectory", {
        id: "/archief",
        dir: "archief",
        parent: "/",
        has_subdirs: true,
      });
      const selected = ref("editie-2026-08.zip");
      return {
        QUERY,
        selected,
        roots: [
          { id: "/archief", dir: "archief", parent: "/", has_subdirs: true },
          { id: "/instroom", dir: "instroom", parent: "/", has_subdirs: false },
        ],
        items: ["editie-2026-07.zip", "editie-2026-08.zip", "los-nummer.pdf"],
      };
    },
    template: `
      <div style="max-width:680px;border:1px solid var(--color-border-subtle);border-radius:var(--radius-overlay);overflow:hidden">
        <div style="display:grid;grid-template-columns:240px 1fr;gap:0 16px;padding:12px">
          <div>
            <folder-tree-line
              v-for="root in roots"
              :key="root.id"
              :query-for-sub-directories="QUERY"
              :directory="root"
              :dictionary="roots"
              :default-open="false"
            />
          </div>
          <div>
            <import-list-item
              v-for="item in items"
              :key="item"
              :item="item"
              :selected-item="selected"
              @update-selected-item="(value) => (selected = value)"
            />
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;padding:10px 12px;
                    background:var(--color-surface);border-top:1px solid var(--color-border-subtle)">
          <base-button button-style="commit" label="Start import" style="width:auto" :disabled="!selected" />
        </div>
      </div>`,
  }),
};
