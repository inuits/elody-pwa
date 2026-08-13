import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntityElementMetadataEdit from "./EntityElementMetadataEdit.vue";
import {
  type InputField as InputFieldType,
  InputFieldTypes,
} from "@/generated-types/queries";

const textField = {
  type: InputFieldTypes.Text,
  isMetadataField: true,
} as unknown as InputFieldType;

const dropdownField = {
  type: InputFieldTypes.Dropdown,
  multiple: false,
  options: [
    { label: "Painting", value: "painting" },
    { label: "Sculpture", value: "sculpture" },
    { label: "Drawing", value: "drawing" },
  ],
} as unknown as InputFieldType;

const meta: Meta<typeof EntityElementMetadataEdit> = {
  title: "Metadata/EntityElementMetadataEdit",
  component: EntityElementMetadataEdit,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
  args: {
    formId: "storybook-form",
    showErrors: false,
    fieldIsValid: true,
    isFieldRequired: false,
    extractValueFromParent: () => undefined,
  },
};
export default meta;

type Story = StoryObj<typeof EntityElementMetadataEdit>;

export const TextInput: Story = {
  args: {
    fieldKey: "title",
    value: "Portrait of a Lady with a Fan",
    field: textField,
  },
};

export const Dropdown: Story = {
  args: {
    fieldKey: "objectCategory",
    value: "painting",
    field: dropdownField,
  },
};

export const WithValidationError: Story = {
  args: {
    fieldKey: "title",
    value: "",
    field: textField,
    showErrors: true,
    fieldIsValid: false,
    isFieldRequired: true,
    error: "This field is required",
  },
};

export const Disabled: Story = {
  args: {
    fieldKey: "objectNumber",
    value: "SK-A-1234",
    field: textField,
    disabled: true,
  },
};
