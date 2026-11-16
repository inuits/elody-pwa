import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MetadataWrapper from "../MetadataWrapper.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useEditMode } from "@/composables/useEdit";
import { InputFieldTypes, ValidationRules } from "@/generated-types/queries";

const meta: Meta<typeof MetadataWrapper> = {
  title: "Metadata/MetadataWrapper",
  component: MetadataWrapper,
  parameters: {
    docs: {
      description: {
        component:
          "The field row: one metadata field, its label over its value. " +
          "When the user may update the entity and the field type has an " +
          "inline editor, the value is a button with a dashed underline and " +
          "a pencil; a click opens the inline editor in its place.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MetadataWrapper>;

type Row = {
  key: string;
  label: string;
  value: unknown;
  inputField?: Record<string, unknown>;
  [extra: string]: unknown;
};

const row = (
  key: string,
  label: string,
  value: unknown,
  type: InputFieldTypes = InputFieldTypes.Text,
  extra: Record<string, unknown> = {},
): Row => ({
  key,
  label,
  value,
  inputField: { type, label },
  ...extra,
});

const setupRows = (formId: string, rows: Row[], extraValues = {}) => {
  useEditMode(formId).setPermittedEditMode({ canUpdate: true });
  useFormHelper().createForm(formId, {
    intialValues: {
      ...Object.fromEntries(rows.map((field) => [field.key, field.value])),
      ...extraValues,
    },
    relationValues: {},
  } as never);
  return { formId, rows };
};

const rowsTemplate = (width = 420) => `
  <div style="display:flex;flex-direction:column;gap:16px;max-width:${width}px">
    <metadata-wrapper
      v-for="field in rows"
      :key="field.key"
      :is-edit="false"
      :form-id="formId"
      :metadata="field"
    />
  </div>`;

const notedRowsTemplate = `
  <div style="display:grid;grid-template-columns:110px minmax(0,320px);gap:14px 16px;align-items:start">
    <template v-for="field in rows" :key="field.key">
      <span style="font-size:var(--text-label);color:var(--color-text-secondary);padding-top:2px">{{ field.note }}</span>
      <metadata-wrapper :is-edit="false" :form-id="formId" :metadata="field" />
    </template>
  </div>`;

export const Default: Story = {
  render: () => ({
    components: { MetadataWrapper },
    setup: () =>
      setupRows("story-field-row", [
        row("title", "Title", "Tales from the North Sea"),
        row("inventory", "Inventory number", "tg:lhpa:9783:m1", undefined, {
          copyToClipboard: true,
        }),
        row("digitised", "Digitised", true, InputFieldTypes.Checkbox),
      ]),
    template: rowsTemplate(),
  }),
};

export const ValueTypes: Story = {
  render: () => ({
    components: { MetadataWrapper },
    setup: () =>
      setupRows("story-field-row-types", [
        { ...row("title", "Title", "Tales from the North Sea"), note: "text" },
        {
          ...row("website", "Website", "https://www.example.org/collection"),
          note: "URL",
        },
        {
          ...row("digitised", "Digitised", true, InputFieldTypes.Checkbox),
          note: "checkbox",
        },
        {
          ...row("restricted", "Restricted", false, InputFieldTypes.Checkbox),
          note: "checkbox",
        },
        {
          ...row("colour", "Colour", "#2f7f8c", InputFieldTypes.Color),
          note: "colour",
        },
        {
          ...row("inventory", "Inventory number", "tg:lhpa:9783:m1", undefined, {
            copyToClipboard: true,
          }),
          note: "copy",
        },
      ]),
    template: notedRowsTemplate,
  }),
};

export const States: Story = {
  render: () => ({
    components: { MetadataWrapper },
    setup: () =>
      setupRows(
        "story-field-row-states",
        [
          { ...row("title", "Title", "Tales from the North Sea"), note: "editable" },
          { ...row("summary", "Summary", ""), note: "empty" },
          {
            ...row("author", "Author", "Jan Peeters", InputFieldTypes.Text, {
              inputField: {
                type: InputFieldTypes.Text,
                label: "Author",
                validation: { value: [ValidationRules.Required] },
              },
            }),
            note: "required",
          },
          {
            ...row("source", "Source", "Imported from the catalogue", undefined, {
              readOnly: true,
            }),
            note: "read-only",
          },
          {
            ...row("isbn", "ISBN", "978-90-209-1234-5"),
            note: "locked",
          },
        ],
        { lockedProperties: ["isbn"] },
      ),
    template: notedRowsTemplate,
  }),
};

export const Editing: Story = {
  render: () => ({
    components: { MetadataWrapper },
    setup: () =>
      setupRows("story-field-row-editing", [
        row("title", "Title", "Tales from the North Sea"),
        row("place", "Place", "Tielt"),
      ]),
    template: rowsTemplate(),
  }),
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLElement>('[data-cy="field-value"][role="button"]')
      ?.click();
  },
};
