import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useForm } from "vee-validate";
import TableInputField from "./TableInputField.vue";
import { InputFieldTypes, type SubField } from "@/generated-types/queries";

// Column definitions as baseGraphql would declare them for a repeatable
// table field (here: the contributors of a manifestation).
const subFields = [
  {
    key: "name",
    label: "metadata.labels.name",
    inputField: { type: InputFieldTypes.Text, isMetadataField: true },
  },
  {
    key: "role",
    label: "metadata.labels.role",
    inputField: {
      type: InputFieldTypes.Dropdown,
      isMetadataField: true,
      options: [
        { label: "Author", value: "author" },
        { label: "Illustrator", value: "illustrator" },
        { label: "Translator", value: "translator" },
      ],
    },
  },
  {
    key: "is_primary",
    label: "metadata.labels.is-primary",
    inputField: { type: InputFieldTypes.Checkbox, isMetadataField: true },
  },
] as unknown as SubField[];

const rows = [
  { name: "Tove Jansson", role: "author", is_primary: true },
  { name: "Lars Jansson", role: "illustrator", is_primary: false },
];

const meta: Meta<typeof TableInputField> = {
  title: "TableInputFields/TableInputField",
  component: TableInputField,
  tags: ["autodocs"],
  // The component manages its rows through vee-validate's useFieldArray, so
  // the story hosts it inside a form context. The add-entry button positions
  // itself absolutely against the nearest relative ancestor.
  render: (args) => ({
    components: { TableInputField },
    setup: () => {
      useForm();
      return { args };
    },
    template:
      '<div class="relative w-[720px] p-4 pt-10"><TableInputField v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof TableInputField>;

export const Prefilled: Story = {
  args: {
    modelValue: rows,
    subFields,
    formId: "storybook-form",
    parentFieldKey: "contributors",
  },
};

// No rows yet: only the header and the add-entry button render.
export const Empty: Story = {
  args: {
    subFields,
    formId: "storybook-form",
    parentFieldKey: "contributors",
  },
};

// Read-only rendering (detail view): no add/remove column, cells disabled.
export const Disabled: Story = {
  args: {
    modelValue: rows,
    subFields,
    formId: "storybook-form",
    parentFieldKey: "contributors",
    disabled: true,
  },
};
