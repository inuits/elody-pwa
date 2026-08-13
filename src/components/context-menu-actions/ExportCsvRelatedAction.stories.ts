import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ExportCsvRelatedAction from "./ExportCsvRelatedAction.vue";
import { DamsIcons, Entitytyping } from "@/generated-types/queries";

// Context-menu item that opens the bulk-operations CSV-export modal scoped
// to the entities related to this entity through the given relation.
const meta: Meta<typeof ExportCsvRelatedAction> = {
  title: "ContextMenuActions/ExportCsvRelatedAction",
  component: ExportCsvRelatedAction,
  tags: ["autodocs"],
  decorators: [
    () => ({
      template:
        '<div class="w-72 rounded-md border border-neutral-50 bg-neutral-0 py-1"><story /></div>',
    }),
  ],
};
export default meta;

type Story = StoryObj<typeof ExportCsvRelatedAction>;

export const Default: Story = {
  args: {
    label: "contextMenu.exportCsvOfRelatedEntities",
    icon: DamsIcons.FileExport,
    entityId: "manifestation-1",
    entityType: Entitytyping.Mediafile,
    parentRelation: "hasMediafile",
  },
};
