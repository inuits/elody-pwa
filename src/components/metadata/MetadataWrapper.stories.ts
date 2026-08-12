import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MetadataWrapper from "./MetadataWrapper.vue";
import {
  InputFieldTypes,
  type PanelMetaData,
} from "@/generated-types/queries";

const readOnlyMetadata = {
  __typename: "PanelMetaData",
  key: "title",
  label: "Title",
  value: "Portrait of a Lady with a Fan",
} as unknown as PanelMetaData;

const editableMetadata = {
  __typename: "PanelMetaData",
  key: "title",
  label: "Title",
  value: "Portrait of a Lady with a Fan",
  inputField: {
    type: InputFieldTypes.Text,
    isMetadataField: true,
  },
} as unknown as PanelMetaData;

const checkboxMetadata = {
  __typename: "PanelMetaData",
  key: "onDisplay",
  label: "On display",
  value: true,
  inputField: {
    type: InputFieldTypes.Checkbox,
    isMetadataField: true,
  },
} as unknown as PanelMetaData;

const meta: Meta<typeof MetadataWrapper> = {
  title: "Metadata/MetadataWrapper",
  component: MetadataWrapper,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
  args: {
    formId: "storybook-form",
  },
};
export default meta;

type Story = StoryObj<typeof MetadataWrapper>;

export const ReadOnly: Story = {
  args: {
    isEdit: false,
    metadata: readOnlyMetadata,
  },
};

export const EditText: Story = {
  args: {
    isEdit: true,
    formFlow: "edit",
    metadata: editableMetadata,
  },
};

export const ReadOnlyCheckbox: Story = {
  args: {
    isEdit: false,
    metadata: checkboxMetadata,
  },
};

export const PillValue: Story = {
  args: {
    isEdit: false,
    metadata: {
      __typename: "PanelMetaData",
      key: "publicationStatus",
      label: "Publication status",
      value: { formatter: "pill|auto", label: "published" },
    } as unknown as PanelMetaData,
  },
};
