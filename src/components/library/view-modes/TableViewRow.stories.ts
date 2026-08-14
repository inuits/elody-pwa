import type { Meta, StoryObj } from "@storybook/vue3-vite";
import TableViewRow from "./TableViewRow.vue";
import type { Metadata } from "@/generated-types/queries";

const teaserMetadata = [
  {
    __typename: "PanelMetaData",
    key: "title",
    label: "Title",
    value: "Portrait of a Lady with a Fan",
  },
  {
    __typename: "PanelMetaData",
    key: "objectNumber",
    label: "Object number",
    value: "SK-A-1234",
  },
  {
    __typename: "PanelMetaData",
    key: "period",
    label: "Period",
    value: "1660",
  },
] as unknown as Metadata[];

const meta: Meta<typeof TableViewRow> = {
  title: "Library/ViewModes/TableViewRow",
  component: TableViewRow,
  tags: ["autodocs"],
  decorators: [
    () => ({ template: '<ul class="w-[48rem] p-4"><story /></ul>' }),
  ],
  args: {
    itemId: "entity-1",
    teaserMetadata,
    relation: "no-relation-found",
    bulkOperationsContext: undefined,
    hasSelection: true,
    hasThumbnail: false,
    previewComponentEnabled: false,
    previewComponentCurrentActive: false,
    previewComponentFeatureEnabled: false,
  },
};
export default meta;

type Story = StoryObj<typeof TableViewRow>;

export const Default: Story = {};

export const WithThumbnailFallback: Story = {
  args: {
    hasThumbnail: true,
    isMediaType: true,
    thumbIcon: "image",
  },
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};
