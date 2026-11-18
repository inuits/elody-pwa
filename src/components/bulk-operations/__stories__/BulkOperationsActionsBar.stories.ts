import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BulkOperationsActionsBar from "../BulkOperationsActionsBar.vue";
import {
  ActionContextEntitiesSelectionType,
  ActionTone,
  BulkOperationTypes,
  DamsIcons,
  Entitytyping,
} from "@/generated-types/queries";
import {
  BulkOperationsContextEnum,
  type Context,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { registerQueryFixture } from "@/main";
import { isCompact } from "@/composables/useNavMenu";

const meta: Meta<typeof BulkOperationsActionsBar> = {
  title: "BulkOperations/SelectionActionBar",
  component: BulkOperationsActionsBar,
  parameters: {
    docs: {
      description: {
        component:
          "Bulk actions on the current selection. The bar is a toolbar named " +
          '"Actions on selection" and its count is a live region. Every ' +
          "action is its own button; one that needs a selection stays " +
          "disabled until something is selected, and destructive actions sit last.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BulkOperationsActionsBar>;

const someSelected = {
  __typename: "ActionContext",
  entitiesSelectionType: ActionContextEntitiesSelectionType.SomeSelected,
  labelForTooltip: "Select one or more items first",
};

const bulkOperations = [
  {
    __typename: "DropdownOption",
    label: "bulk-operations.export-to-csv",
    value: BulkOperationTypes.ExportCsv,
    icon: DamsIcons.FileExport,
  },
  {
    __typename: "DropdownOption",
    label: "bulk-operations.bulk-edit",
    value: BulkOperationTypes.BulkUpdateMetadata,
    icon: DamsIcons.Edit,
    actionContext: someSelected,
  },
  {
    __typename: "DropdownOption",
    label: "bulk-operations.delete",
    value: BulkOperationTypes.DeleteEntities,
    icon: DamsIcons.Trash,
    tone: ActionTone.Danger,
    actionContext: someSelected,
  },
];

const registerBulkOperations = () =>
  registerQueryFixture("GetBulkOperations", {
    BulkOperations: {
      __typename: "BaseEntity",
      bulkOperationOptions: {
        __typename: "BulkOperations",
        options: bulkOperations,
      },
    },
  });

const select = (context: Context, ids: string[]) => {
  const { enqueueItemForBulkProcessing, dequeueAllItemsForBulkProcessing } =
    useBulkOperations();
  dequeueAllItemsForBulkProcessing(context);
  ids.forEach((id) => enqueueItemForBulkProcessing(context, { id } as never));
};

const base = {
  context: BulkOperationsContextEnum.Home,
  useExtendedBulkOperations: true,
  entityType: Entitytyping.Asset,
  relationType: "",
  excludePagination: true,
  showPagination: false,
  enableSelection: true,
  refetchEntities: () => undefined,
};

const bar = (props = "") => `
  <div style="max-width:720px;background:var(--color-surface);padding:8px 16px">
    <bulk-operations-actions-bar v-bind="base" ${props} />
  </div>`;

/** Nothing selected: the muted label, and the actions that need a selection stay disabled. */
export const Default: Story = {
  render: () => ({
    components: { BulkOperationsActionsBar },
    setup() {
      registerBulkOperations();
      select(base.context, []);
      return { base };
    },
    template: bar(),
  }),
};

/** Two items selected: the count turns bold and every action applies. */
export const Selected: Story = {
  render: () => ({
    components: { BulkOperationsActionsBar },
    setup() {
      registerBulkOperations();
      select(base.context, ["a", "b"]);
      return { base };
    },
    template: bar(),
  }),
};

const label = (text: string) =>
  `<p style="margin:12px 0 4px;font-size:var(--text-label);color:var(--color-text-secondary)">${text}</p>`;

/** Nothing selected, items selected, and a selection that reaches other pages. */
export const States: Story = {
  render: () => ({
    components: { BulkOperationsActionsBar },
    setup() {
      registerBulkOperations();
      select(BulkOperationsContextEnum.FilterOptions, []);
      select(BulkOperationsContextEnum.EntityElementList, ["a", "b"]);
      select(BulkOperationsContextEnum.EntityElementMedia, ["a", "b", "c", "d"]);
      return { base, BulkOperationsContextEnum };
    },
    template: `<div>
      ${label("Nothing selected")}
      ${bar(':context="BulkOperationsContextEnum.FilterOptions"')}
      ${label("Items selected")}
      ${bar(':context="BulkOperationsContextEnum.EntityElementList"')}
      ${label("Selection on other pages")}
      ${bar(':context="BulkOperationsContextEnum.EntityElementMedia" :page-item-ids="[\'a\']"')}
    </div>`,
  }),
};

/** In a picker the actions make way for one commit button. */
export const ConfirmSelection: Story = {
  render: () => ({
    components: { BulkOperationsActionsBar },
    setup() {
      registerBulkOperations();
      select(BulkOperationsContextEnum.EntityElementListEntityPickerModal, ["a", "b"]);
      return { base, BulkOperationsContextEnum };
    },
    template: bar(
      ':context="BulkOperationsContextEnum.EntityElementListEntityPickerModal" :confirm-selection-button="true"',
    ),
  }),
};

/** Below 48rem more than one action folds into the overflow menu. */
export const SmallScreen: Story = {
  render: () => ({
    components: { BulkOperationsActionsBar },
    setup() {
      isCompact.value = true;
      registerBulkOperations();
      select(base.context, ["a", "b"]);
      return { base };
    },
    template: `<div style="max-width:360px">${bar()}</div>`,
  }),
};
