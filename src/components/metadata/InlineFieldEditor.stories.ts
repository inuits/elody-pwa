import type { Meta, StoryObj } from "@storybook/vue3-vite";
import InlineFieldEditor from "./InlineFieldEditor.vue";
import { InputFieldTypes } from "@/generated-types/queries";

const meta: Meta<typeof InlineFieldEditor> = {
  title: "Metadata/InlineFieldEditor",
  component: InlineFieldEditor,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof InlineFieldEditor>;

/** Manifest id `metadata-inlinefieldeditor--editing`: the open editor —
 *  pick-then-Bewaar, keyboard-hint line ("Enter bewaart · Esc annuleert"),
 *  Bewaar/Annuleer pair. Opened by clicking the value (play function). */
export const Editing: Story = {
  args: {
    formId: "story-form",
    fieldKey: "intialValues.title",
    label: "Titel",
    entityType: "manifestation",
    value: "De ontdekking van de hemel",
  },
  render: (args) => ({
    components: { InlineFieldEditor },
    setup: () => ({ args }),
    template:
      '<div class="p-8 max-w-md"><InlineFieldEditor v-bind="args" /></div>',
  }),
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLElement>("[data-cy='inline-edit-toggle']")
      ?.click();
  },
};

const baseArgs = {
  formId: "story-form",
  fieldKey: "intialValues.title",
  label: "Titel",
  entityType: "manifestation",
};

// Click the value to open the editor; Enter commits, Escape cancels.
export const Resting: Story = {
  args: { ...baseArgs, value: "De ontdekking van de hemel" },
  render: (args) => ({
    components: { InlineFieldEditor },
    setup: () => ({ args }),
    template: '<div class="p-8 max-w-md"><InlineFieldEditor v-bind="args" /></div>',
  }),
};

export const RestingSelect: Story = {
  args: {
    ...baseArgs,
    fieldKey: "intialValues.language",
    label: "Taal",
    value: "dut",
    inputType: InputFieldTypes.DropdownSingleselectMetadata,
    options: [
      { label: "Nederlands", value: "dut" },
      { label: "Engels", value: "eng" },
      { label: "Frans", value: "fre" },
    ],
  },
  render: (args) => ({
    components: { InlineFieldEditor },
    setup: () => ({ args }),
    template: '<div class="p-8 max-w-md"><InlineFieldEditor v-bind="args" /></div>',
  }),
};

export const EmptyDimmed: Story = {
  args: { ...baseArgs, value: "", dim: true },
  render: (args) => ({
    components: { InlineFieldEditor },
    setup: () => ({ args }),
    template: '<div class="p-8 max-w-md"><InlineFieldEditor v-bind="args" /></div>',
  }),
};

export const RequiredField: Story = {
  args: { ...baseArgs, value: "M-RA318MJ07S", label: "Plaatsnummer", required: true },
  render: (args) => ({
    components: { InlineFieldEditor },
    setup: () => ({ args }),
    template: '<div class="p-8 max-w-md"><InlineFieldEditor v-bind="args" /></div>',
  }),
};

export const RestingTextarea: Story = {
  args: {
    ...baseArgs,
    fieldKey: "intialValues.annotation",
    label: "Annotatie",
    value: "Paperback-heruitgave met nieuw voorwoord.",
    inputType: InputFieldTypes.Textarea,
  },
  render: (args) => ({
    components: { InlineFieldEditor },
    setup: () => ({ args }),
    template: '<div class="p-8 max-w-md"><InlineFieldEditor v-bind="args" /></div>',
  }),
};
