import type { Meta, StoryObj } from "@storybook/vue3-vite";
import InlineFieldEditor from "../InlineFieldEditor.vue";
import { InputFieldTypes } from "@/generated-types/queries";

const meta: Meta<typeof InlineFieldEditor> = {
  title: "Metadata/InlineFieldEditor",
  component: InlineFieldEditor,
  parameters: {
    docs: {
      description: {
        component:
          "The input a field row swaps to while one field is edited: the " +
          "input for the field type, a save (✓) and a cancel (×) button, and " +
          "a keyboard hint below. The field row opens it, validates and saves; " +
          "the editor itself only emits save and cancel.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof InlineFieldEditor>;

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Expired", value: "expired" },
];

const label = (text: string) =>
  `<p style="font-size:var(--text-label);font-weight:700;color:var(--color-text-field-label);margin-bottom:var(--field-label-gap)">${text}</p>`;

export const Editing: Story = {
  render: () => ({
    components: { InlineFieldEditor },
    template: `
      <div style="max-width:440px">
        ${label("Title")}
        <inline-field-editor type="text" model-value="Tales from the North Sea" label="Title" />
      </div>`,
  }),
};

export const FieldTypes: Story = {
  render: () => ({
    components: { InlineFieldEditor },
    setup: () => ({ InputFieldTypes, statusOptions }),
    template: `
      <div style="display:flex;flex-direction:column;gap:18px;max-width:440px">
        <div>
          ${label("Year")}
          <inline-field-editor :type="InputFieldTypes.Number" :model-value="1987" label="Year" />
        </div>
        <div>
          ${label("Summary")}
          <inline-field-editor :type="InputFieldTypes.Textarea" model-value="A longer note from the cataloguer." label="Summary" />
        </div>
        <div>
          ${label("Status")}
          <inline-field-editor :type="InputFieldTypes.Dropdown" model-value="draft" label="Status" :options="statusOptions" />
        </div>
        <div>
          ${label("Digitised")}
          <inline-field-editor :type="InputFieldTypes.Checkbox" :model-value="true" label="Digitised" />
        </div>
        <div>
          ${label("Colour")}
          <inline-field-editor :type="InputFieldTypes.Color" model-value="#2f7f8c" label="Colour" />
        </div>
      </div>`,
  }),
};

export const States: Story = {
  render: () => ({
    components: { InlineFieldEditor },
    template: `
      <div style="display:grid;grid-template-columns:90px minmax(0,360px);gap:18px 16px;align-items:start">
        <span style="font-size:var(--text-label);color:var(--color-text-secondary);padding-top:10px">editing</span>
        <inline-field-editor type="text" model-value="Tales from the North Sea" label="Title" />
        <span style="font-size:var(--text-label);color:var(--color-text-secondary);padding-top:10px">saving</span>
        <inline-field-editor type="text" model-value="Tales from the Wadden Sea" label="Title" :saving="true" />
        <span style="font-size:var(--text-label);color:var(--color-text-secondary);padding-top:10px">error</span>
        <inline-field-editor type="text" model-value="" label="Title" error-message="Title is required" />
      </div>`,
  }),
};
