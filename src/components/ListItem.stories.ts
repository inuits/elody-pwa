import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ListItem from "./ListItem.vue";
import { Entitytyping, type Metadata } from "@/generated-types/queries";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";

const teaserMetadata = [
  { key: "title", label: "Titel", value: "Portret van een dame" },
  { key: "object_number", label: "Objectnummer", value: "1902-C-14" },
  { key: "date", label: "Datering", value: "ca. 1650" },
  { key: "creator", label: "Vervaardiger", value: "Michaelina Wautier" },
] as unknown as Metadata[];

const meta: Meta<typeof ListItem> = {
  title: "Components/ListItem",
  component: ListItem,
  tags: ["autodocs"],
  argTypes: {
    viewMode: { control: "select", options: ["list", "grid"] },
  },
  decorators: [() => ({ template: '<ul class="w-full p-4"><story /></ul>' })],
};
export default meta;

type Story = StoryObj<typeof ListItem>;

const baseArgs = {
  itemId: "asset-1902-c-14",
  itemType: Entitytyping.Work,
  entityTypename: Entitytyping.Work,
  teaserMetadata,
  bulkOperationsContext: BulkOperationsContextEnum.EntityElementList as any,
  hasSelection: true,
  previewComponentEnabled: false,
  previewComponentCurrentActive: false,
  previewComponentFeatureEnabled: false,
};

export const ListMode: Story = {
  args: { ...baseArgs, viewMode: "list" },
};

export const GridMode: Story = {
  args: { ...baseArgs, viewMode: "grid", isMediaType: true, thumbIcon: "image" },
};

export const Disabled: Story = {
  args: { ...baseArgs, viewMode: "list", isDisabled: true },
};

export const Loading: Story = {
  args: { ...baseArgs, viewMode: "list", loading: true },
};
