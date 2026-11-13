import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { computed } from "vue";
import ActionMenuGroup from "../ActionMenuGroup.vue";
import {
  ActionContextEntitiesSelectionType,
  ActionTone,
  BulkOperationTypes,
  DamsIcons,
  Entitytyping,
  type DropdownOption,
} from "@/generated-types/queries";

const someSelected = {
  entitiesSelectionType: ActionContextEntitiesSelectionType.SomeSelected,
};

const options: DropdownOption[] = [
  {
    label: "bulk-operations.bulk-edit",
    value: BulkOperationTypes.BulkUpdateMetadata,
    icon: DamsIcons.Edit,
    primary: true,
    actionContext: someSelected,
  },
  {
    label: "bulk-operations.export-to-xlsx",
    value: BulkOperationTypes.ExportXlsx,
    icon: DamsIcons.FileExport,
    primaryFallback: true,
    actionContext: {
      entitiesSelectionType: ActionContextEntitiesSelectionType.NoneSelected,
    },
  },
  {
    label: "bulk-operations.export-to-csv",
    value: BulkOperationTypes.ExportCsv,
    icon: DamsIcons.DocumentInfo,
    actionContext: someSelected,
  },
  {
    label: "bulk-operations.merge",
    value: BulkOperationTypes.MergeEntities,
    actionContext: {
      ...someSelected,
      minSelectedItems: 2,
      maxSelectedItems: 2,
    },
  },
  {
    label: "bulk-operations.delete-selected",
    value: BulkOperationTypes.DeleteEntities,
    icon: DamsIcons.Trash,
    tone: ActionTone.Danger,
    actionContext: someSelected,
  },
];

const withSubMenu: DropdownOption[] = [
  ...options,
  {
    label: "bulk-operations.add-relation",
    value: BulkOperationTypes.OpenDropdown,
  },
];

const selection = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `asset-${index + 1}`,
    type: Entitytyping.Asset,
  }));

type Args = InstanceType<typeof ActionMenuGroup>["$props"] & {
  selectedCount: number;
};

const meta: Meta<Args> = {
  title: "Components/ActionMenuGroup",
  component: ActionMenuGroup as never,
  parameters: {
    docs: {
      description: {
        component:
          "The action row of the selection bar and of detail-panel lists. " +
          "As a split button it leads with one primary action and puts the " +
          "rest in its menu; flat, every action is its own button, disabled " +
          "with its reason until it applies, destructive actions last in " +
          "danger ink. Actions that need a selection say the count in their " +
          'accessible name, for example "Bulk edit (2 selected)".',
      },
    },
  },
  argTypes: {
    selectedCount: { control: { type: "range", min: 0, max: 5, step: 1 } },
    flat: { control: "boolean" },
    isMainActionDisabled: { control: "boolean" },
    entityType: { control: "select", options: Object.values(Entitytyping) },
    options: { control: "object" },
    subDropdownOptions: { control: "object" },
    parentEntityId: { control: "text" },
    selectedItems: { table: { disable: true } },
    itemsSelected: { table: { disable: true } },
    modelValue: { table: { disable: true } },
    clearSubDropdownOptions: { table: { disable: true } },
    "onUpdate:modelValue": { action: "update:modelValue" },
  },
};

export default meta;
type Story = StoryObj<Args>;

const render: Story["render"] = (args) => ({
  components: { ActionMenuGroup },
  setup() {
    const selectedItems = computed(() => selection(args.selectedCount));
    return { args, selectedItems };
  },
  template: `
    <div style="display:flex;justify-content:flex-end;max-width:720px">
      <action-menu-group
        v-bind="args"
        :selected-items="selectedItems"
        :items-selected="selectedItems.length > 0"
        :clear-sub-dropdown-options="() => {}"
      />
    </div>`,
});

export const Default: Story = {
  args: {
    selectedCount: 2,
    flat: false,
    isMainActionDisabled: false,
    entityType: Entitytyping.Asset,
    options,
    subDropdownOptions: [],
    parentEntityId: undefined,
  },
  render,
};

export const Flat: Story = {
  args: { ...Default.args, flat: true, options: withSubMenu },
  render,
};

export const States: Story = {
  render: () => ({
    components: { ActionMenuGroup },
    setup: () => ({
      rows: [
        { name: "Split, nothing selected", flat: false, count: 0 },
        { name: "Split, 2 selected", flat: false, count: 2 },
        { name: "Flat, nothing selected", flat: true, count: 0 },
        { name: "Flat, 2 selected", flat: true, count: 2 },
        {
          name: "Flat, 3 selected (merge needs exactly 2)",
          flat: true,
          count: 3,
        },
      ],
      selection,
      options: withSubMenu,
      entityType: Entitytyping.Asset,
    }),
    template: `
      <table style="border-collapse:separate;border-spacing:12px 10px">
        <tr v-for="row in rows" :key="row.name">
          <td style="font-size:var(--text-label);color:var(--color-text-secondary);white-space:nowrap">{{ row.name }}</td>
          <td>
            <action-menu-group
              :options="row.flat ? options : options.slice(0, -1)"
              :flat="row.flat"
              :entity-type="entityType"
              :selected-items="selection(row.count)"
              :items-selected="row.count > 0"
              :clear-sub-dropdown-options="() => {}"
            />
          </td>
        </tr>
      </table>`,
  }),
};
