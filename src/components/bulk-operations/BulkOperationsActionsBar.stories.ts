import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import BulkOperationsActionsBar from "./BulkOperationsActionsBar.vue";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { Entitytyping, RouteNames } from "@/generated-types/queries";

// The actions bar sits above every library list: it shows the (selected)
// item count, selection shortcuts and the bulk-operations dropdown. The
// available operations normally come from a GetBulkOperations query; with
// the Storybook Apollo client that resolves empty, so the dropdown stays
// hidden while counts and selection actions render.
const storyConfig = {
  customization: {},
  features: { hasTenantSelect: false, hideSuperTenant: false },
  routerConfig: [{ name: RouteNames.Home, children: [] }],
};

const context = BulkOperationsContextEnum.EntityElementList;

const baseArgs = {
  context,
  totalItemsCount: 128,
  useExtendedBulkOperations: true,
  entityType: Entitytyping.Manifestation,
  refetchEntities: () => undefined,
  selectedPaginationLimitOption: 20,
  excludePagination: true,
  showPagination: false,
};

const meta: Meta<typeof BulkOperationsActionsBar> = {
  title: "BulkOperations/BulkOperationsActionsBar",
  component: BulkOperationsActionsBar,
  tags: ["autodocs"],
  render: (args) => ({
    components: { BulkOperationsActionsBar },
    setup() {
      provide("config", storyConfig);
      return { args };
    },
    template:
      '<div class="w-full p-4"><BulkOperationsActionsBar v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof BulkOperationsActionsBar>;

export const Default: Story = {
  args: { ...baseArgs },
};

// With items enqueued for bulk processing the bar switches to its accent
// styling and shows the "x/total selected" count plus the undo action.
export const WithSelection: Story = {
  args: { ...baseArgs },
  render: (args) => ({
    components: { BulkOperationsActionsBar },
    setup() {
      provide("config", storyConfig);
      const { dequeueAllItemsForBulkProcessing, enqueueItemForBulkProcessing } =
        useBulkOperations();
      dequeueAllItemsForBulkProcessing(context);
      ["manifestation-1", "manifestation-2", "manifestation-3"].forEach((id) =>
        enqueueItemForBulkProcessing(context, { id }),
      );
      return { args };
    },
    template:
      '<div class="w-full p-4"><BulkOperationsActionsBar v-bind="args" /></div>',
  }),
};

export const ExactCountLoading: Story = {
  args: { ...baseArgs, totalItemsCount: 10000, exactCountLoading: true },
};

export const ConfirmSelectionButton: Story = {
  args: { ...baseArgs, confirmSelectionButton: true },
};
