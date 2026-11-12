import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ListItem from "@/components/ListItem.vue";
import { BaseLibraryModes, ListItemCoverageTypes } from "@/generated-types/queries";
import { Unicons } from "@/types";

const meta: Meta<typeof ListItem> = {
  // Story id library-viewmodes-listitem--default, per MANIFEST.md.
  title: "Library/ViewModes/ListItem",
  component: ListItem,
  parameters: {
    docs: {
      description: {
        component:
          "A result row. Selection and preview are deliberately two different " +
          "cues and never collapse into one: the checkbox owns the accent " +
          "wash and the accent ring, while the row whose preview is open is " +
          "marked by a 3px accent border on the left and no wash at all. " +
          "Hover is its own, lighter fill. All three follow the tenant " +
          "accent — switch tenant in the toolbar to see it.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ListItem>;

const teaser = (title: string, secondary: string) => [
  { label: "Title", key: "title", value: title },
  { label: "Author", key: "author", value: secondary },
];

const base = {
  bulkOperationsContext: undefined,
  relation: "no-relation-found" as const,
  hasSelection: false,
  baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
  previewComponentEnabled: false,
  previewComponentCurrentActive: false,
  previewComponentFeatureEnabled: false,
  isEnableNavigation: false,
  viewMode: "list" as const,
  thumbIcon: Unicons.FileAlt.name,
  isMediaType: true,
};

export const Default: Story = {
  render: () => ({
    components: { ListItem },
    setup: () => ({
      base,
      rows: [
        teaser("Tales from the North Sea", "Jan Persoon"),
        teaser("Coastal Fishing in the 20th Century", "Marie Vermeulen"),
      ],
      coverage: ListItemCoverageTypes.OneListItem,
    }),
    template: `
      <ul style="max-width:620px;list-style:none">
        <li style="font-size:var(--text-label);color:var(--color-text-secondary);margin-bottom:4px">resting · hover me</li>
        <list-item v-bind="base" item-id="row-1" :teaser-metadata="rows[0]" />

        <li style="font-size:var(--text-label);color:var(--color-text-secondary);margin:14px 0 4px">
          preview open — 3px accent border left, no wash
        </li>
        <list-item
          v-bind="base"
          item-id="row-2"
          :teaser-metadata="rows[1]"
          :preview-component-current-active="true"
          :preview-component-list-items-coverage="coverage"
        />
      </ul>`,
  }),
};
