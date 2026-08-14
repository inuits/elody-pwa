import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MetadataTitle from "./MetadataTitle.vue";
import type { PanelMetaData } from "@/generated-types/queries";

const baseMetadata = {
  __typename: "PanelMetaData",
  key: "title",
  label: "Title",
} as unknown as PanelMetaData;

const meta: Meta<typeof MetadataTitle> = {
  title: "Metadata/MetadataTitle",
  component: MetadataTitle,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof MetadataTitle>;

export const Default: Story = {
  args: {
    metadata: baseMetadata,
  },
};

export const Required: Story = {
  args: {
    metadata: baseMetadata,
    isFieldRequired: true,
  },
};

export const OneOfRequired: Story = {
  args: {
    metadata: {
      ...baseMetadata,
      key: "isbn",
      label: "ISBN",
    } as unknown as PanelMetaData,
    isOneOfRequired: true,
  },
};

export const WithTooltip: Story = {
  args: {
    metadata: {
      ...baseMetadata,
      key: "objectNumber",
      label: "Object number",
      tooltip: "The unique inventory number assigned by the museum registrar",
    } as unknown as PanelMetaData,
  },
};
