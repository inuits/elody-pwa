import type { Meta, StoryObj } from "@storybook/vue3-vite";
import TableViewRow from "../TableViewRow.vue";
import {
  BaseLibraryModes,
  ListItemCoverageTypes,
} from "@/generated-types/queries";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { Unicons } from "@/types";

const CONTEXT = BulkOperationsContextEnum.Home;

const meta: Meta<typeof TableViewRow> = {
  title: "Library/ViewModes/TableViewRow",
  component: TableViewRow,
  parameters: {
    docs: {
      description: {
        component:
          "A row of the table view: checkbox, optional thumbnail, one column per teaser field, the row actions and the preview eye. " +
          "The checkbox owns the selected wash; an open preview owns the accent left border.",
      },
    },
  },
  argTypes: {
    baseLibraryMode: {
      control: "select",
      options: Object.values(BaseLibraryModes),
    },
    previewComponentListItemsCoverage: {
      control: "select",
      options: Object.values(ListItemCoverageTypes),
    },
    teaserMetadata: { control: "object" },
    onTogglePreviewComponent: { action: "togglePreviewComponent" },
  },
  render: (args) => ({
    components: { TableViewRow },
    setup: () => ({ args }),
    template: `<ul style="max-width:860px;padding:0"><table-view-row v-bind="args" /></ul>`,
  }),
};

export default meta;
type Story = StoryObj<typeof TableViewRow>;

const teaser = (title: string, author: string, year: string) => [
  { label: "Title", key: "title", value: title },
  { label: "Author", key: "author", value: author },
  { label: "Year", key: "year", value: year },
];

const base = {
  relation: "no-relation-found" as const,
  bulkOperationsContext: CONTEXT,
  hasSelection: true,
  hasThumbnail: true,
  isMediaType: true,
  thumbIcon: Unicons.FileAlt.name,
  baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
  previewComponentEnabled: false,
  previewComponentCurrentActive: false,
  previewOpen: false,
  previewComponentFeatureEnabled: true,
  previewComponentListItemsCoverage: ListItemCoverageTypes.OneListItem,
  isDisabled: false,
  loading: false,
};

export const Default: Story = {
  args: {
    ...base,
    itemId: "row-1",
    teaserMetadata: teaser("Tales from the North Sea", "Jan Persoon", "1987"),
  },
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Resting (hover it), selected, preview open (eye pressed), last previewed (border without a pressed eye), " +
          "disabled and loading. The seen and new cues depend on the route's entity config and are not shown here.",
      },
    },
  },
  render: () => ({
    components: { TableViewRow },
    setup() {
      const { enqueueItemForBulkProcessing, dequeueAllItemsForBulkProcessing } =
        useBulkOperations();
      dequeueAllItemsForBulkProcessing(CONTEXT);
      enqueueItemForBulkProcessing(CONTEXT, { id: "row-selected" } as never);
      const rows = [
        { note: "resting", id: "row-resting", props: {} },
        { note: "selected", id: "row-selected", props: {} },
        {
          note: "preview open",
          id: "row-preview",
          props: { previewComponentCurrentActive: true, previewOpen: true },
        },
        {
          note: "last previewed",
          id: "row-last",
          props: { previewComponentCurrentActive: true },
        },
        { note: "disabled", id: "row-disabled", props: { isDisabled: true } },
        { note: "loading", id: "row-loading", props: { loading: true } },
      ];
      return {
        base,
        rows,
        metadata: teaser(
          "Coastal Fishing in the 20th Century",
          "Marie Vermeulen",
          "2004",
        ),
      };
    },
    template: `
      <ul style="max-width:860px;padding:0">
        <template v-for="row in rows" :key="row.id">
          <li style="list-style:none;font-size:var(--text-label);color:var(--color-text-secondary);margin:12px 0 4px">{{ row.note }}</li>
          <table-view-row v-bind="{ ...base, ...row.props }" :item-id="row.id" :teaser-metadata="metadata" />
        </template>
      </ul>`,
  }),
};
