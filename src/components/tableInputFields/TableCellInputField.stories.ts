import type { Meta, StoryObj } from "@storybook/vue3-vite";
import TableCellInputField from "./TableCellInputField.vue";
import { InputFieldTypes, type SubField } from "@/generated-types/queries";

// SubField fixtures as baseGraphql would declare them for a table column.
const textSubField = {
  key: "role",
  label: "metadata.labels.role",
  inputField: {
    type: InputFieldTypes.Text,
    isMetadataField: true,
  },
} as unknown as SubField;

const checkboxSubField = {
  key: "is_primary",
  label: "metadata.labels.is-primary",
  inputField: {
    type: InputFieldTypes.Checkbox,
    isMetadataField: true,
  },
} as unknown as SubField;

const dropdownSubField = {
  key: "language",
  label: "metadata.labels.language",
  inputField: {
    type: InputFieldTypes.Dropdown,
    isMetadataField: true,
    options: [
      { label: "Dutch", value: "dut" },
      { label: "English", value: "eng" },
      { label: "French", value: "fre" },
    ],
  },
} as unknown as SubField;

const requiredSubField = {
  key: "role",
  label: "metadata.labels.role",
  inputField: {
    type: InputFieldTypes.Text,
    isMetadataField: true,
    validation: { value: "required", required_if: null },
  },
} as unknown as SubField;

const meta: Meta<typeof TableCellInputField> = {
  title: "TableInputFields/TableCellInputField",
  component: TableCellInputField,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-72 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof TableCellInputField>;

export const Text: Story = {
  args: {
    modelValue: "Author",
    subField: textSubField,
    fieldKey: "contributors[0].role",
    formId: "storybook-form",
  },
};

export const Checkbox: Story = {
  args: {
    modelValue: true,
    subField: checkboxSubField,
    fieldKey: "contributors[0].is_primary",
    formId: "storybook-form",
  },
};

export const Dropdown: Story = {
  args: {
    modelValue: "dut",
    subField: dropdownSubField,
    fieldKey: "contributors[0].language",
    formId: "storybook-form",
  },
};

// Disabled cells (read-only detail views) never validate, so an empty
// required value shows no error here.
export const Disabled: Story = {
  args: {
    modelValue: "",
    subField: requiredSubField,
    fieldKey: "contributors[0].role",
    formId: "storybook-form",
    disabled: true,
  },
};
