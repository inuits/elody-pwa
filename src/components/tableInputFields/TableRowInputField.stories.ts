import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useForm } from "vee-validate";
import TableRowInputField from "./TableRowInputField.vue";
import { InputFieldTypes, type SubField } from "@/generated-types/queries";

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
      ],
    },
  },
  {
    key: "is_primary",
    label: "metadata.labels.is-primary",
    inputField: { type: InputFieldTypes.Checkbox, isMetadataField: true },
  },
] as unknown as SubField[];

// The row renders bare grid cells (one per visible sub-field plus the remove
// button), so the story recreates the parent TableInputField's grid wrapper
// and form context.
const meta: Meta<typeof TableRowInputField> = {
  title: "TableInputFields/TableRowInputField",
  component: TableRowInputField,
  tags: ["autodocs"],
  render: (args) => ({
    components: { TableRowInputField },
    setup: () => {
      useForm({
        initialValues: {
          contributors: [
            { name: "Tove Jansson", role: "author", is_primary: true },
          ],
        },
      });
      return { args };
    },
    template: `
      <div class="w-[720px] p-4">
        <div
          class="grid w-max min-w-full rounded-lg border border-[rgba(0,58,82,0.2)]"
          style="grid-template-columns: minmax(max-content, 1fr) minmax(max-content, 1fr) max-content max-content"
        >
          <TableRowInputField v-bind="args" />
        </div>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<typeof TableRowInputField>;

export const Default: Story = {
  args: {
    rowIndex: 0,
    item: { name: "Tove Jansson", role: "author", is_primary: true },
    subFields,
    formId: "storybook-form",
    parentFieldKey: "contributors",
  },
};

export const Disabled: Story = {
  args: {
    rowIndex: 0,
    item: { name: "Tove Jansson", role: "author", is_primary: true },
    subFields,
    formId: "storybook-form",
    parentFieldKey: "contributors",
    disabled: true,
  },
};
