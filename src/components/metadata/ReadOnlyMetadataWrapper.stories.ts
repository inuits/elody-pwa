import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ReadOnlyMetadataWrapper from "./ReadOnlyMetadataWrapper.vue";
import type { PanelMetaData } from "@/generated-types/queries";

const meta: Meta<typeof ReadOnlyMetadataWrapper> = {
  title: "Metadata/ReadOnlyMetadataWrapper",
  component: ReadOnlyMetadataWrapper,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
  args: {
    isEdit: false,
    formId: "storybook-form",
  },
};
export default meta;

type Story = StoryObj<typeof ReadOnlyMetadataWrapper>;

export const Default: Story = {
  args: {
    metadata: {
      __typename: "PanelMetaData",
      key: "title",
      label: "Title",
      value: "Portrait of a Lady with a Fan",
    } as unknown as PanelMetaData,
  },
};

export const PillValue: Story = {
  args: {
    metadata: {
      __typename: "PanelMetaData",
      key: "publicationStatus",
      label: "Publication status",
      value: { formatter: "pill|auto", label: "published" },
    } as unknown as PanelMetaData,
  },
};

export const WithoutLabel: Story = {
  args: {
    metadata: {
      __typename: "PanelMetaData",
      key: "objectNumber",
      label: "Object number",
      value: "SK-A-1234",
    } as unknown as PanelMetaData,
    hideLabel: true,
  },
};

export const MultipleValues: Story = {
  args: {
    metadata: {
      __typename: "PanelMetaData",
      key: "materials",
      label: "Materials",
      value: ["oil paint", "canvas", "gilded wood"],
    } as unknown as PanelMetaData,
  },
};
