import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BulkOperationsActionsBar from "../BulkOperationsActionsBar.vue";
import { Entitytyping } from "@/generated-types/queries";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";

const meta: Meta<typeof BulkOperationsActionsBar> = {
  // Story id bulkoperations-selectionactionbar--default, per MANIFEST.md.
  title: "BulkOperations/SelectionActionBar",
  component: BulkOperationsActionsBar,
  parameters: {
    docs: {
      description: {
        component:
          "Bulk actions on the current selection. The bar is a toolbar named " +
          '"Acties op selectie" and its count is a live region, so a screen ' +
          "reader hears the selection change instead of having to go looking " +
          "for it. Wis selectie and Selecteer pagina are real buttons — they " +
          "were clickable spans, which the keyboard could not reach at all.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BulkOperationsActionsBar>;

const base = {
  context: BulkOperationsContextEnum.Home,
  useExtendedBulkOperations: true,
  entityType: Entitytyping.Asset,
  relationType: "",
  excludePagination: true,
  showPagination: false,
  enableSelection: true,
  showButton: false,
  refetchEntities: () => undefined,
};

/** Nothing selected: the count rests, no selection actions offered. */
export const Default: Story = {
  render: () => ({
    components: { BulkOperationsActionsBar },
    setup() {
      useBulkOperations().dequeueAllItemsForBulkProcessing(base.context);
      return { base };
    },
    template: `
      <div style="max-width:720px">
        <bulk-operations-actions-bar v-bind="base" />
      </div>`,
  }),
};

/**
 * With a selection the count takes the panel-header pair, and Wis selectie
 * and Selecteer pagina appear — both real buttons, both tabbable.
 */
export const Selected: Story = {
  render: () => ({
    components: { BulkOperationsActionsBar },
    setup() {
      const { enqueueItemForBulkProcessing, dequeueAllItemsForBulkProcessing } =
        useBulkOperations();
      dequeueAllItemsForBulkProcessing(base.context);
      ["a", "b"].forEach((id) =>
        enqueueItemForBulkProcessing(base.context, { id } as never),
      );
      return { base };
    },
    template: `
      <div style="max-width:720px">
        <bulk-operations-actions-bar v-bind="base" />
      </div>`,
  }),
};
