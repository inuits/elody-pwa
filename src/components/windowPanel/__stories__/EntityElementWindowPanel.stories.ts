import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import EntityElementWindowPanel from "../EntityElementWindowPanel.vue";
import EntityElementWindow from "@/components/entityElements/EntityElementWindow.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useEditMode } from "@/composables/useEdit";
import { InputFieldTypes, PanelType } from "@/generated-types/queries";

const meta: Meta<typeof EntityElementWindowPanel> = {
  title: "EntityElements/EntityElementWindowPanel",
  component: EntityElementWindowPanel,
  parameters: {
    docs: {
      description: {
        component:
          "A block of field rows under a bold label. Each row edits and " +
          "saves on its own. A panel with a `repetitionConfig` repeats its " +
          "rows for every value in a stored list: rows are added from the " +
          "header and removed one by one.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EntityElementWindowPanel>;

const panelField = (key: string, label: string, value?: unknown) => ({
  __typename: "PanelMetaData",
  key,
  label,
  ...(value !== undefined ? { value } : {}),
  inputField: { type: InputFieldTypes.Text, label },
});

const basePanel = {
  __typename: "WindowElementPanel",
  panelType: PanelType.Metadata,
  isCollapsed: false,
  isEditable: true,
  canBeMultipleColumns: true,
};

const setupForm = (
  formId: string,
  intialValues: Record<string, unknown>,
  canUpdate = true,
) => {
  provide("entityFormData", { id: formId });
  useEditMode(formId).setPermittedEditMode({ canUpdate });
  useFormHelper().createForm(formId, {
    intialValues,
    relationValues: {},
  } as never);
};

const inWindow = (panel: Record<string, unknown>) => ({
  __typename: "WindowElement",
  label: "Information",
  panel,
});

const template = `
  <div style="max-width:560px">
    <entity-element-window
      :element="element"
      :identifiers="['story-entity']"
      :form-id="formId"
    />
  </div>`;

const repeatablePanel = {
  ...basePanel,
  panelHeaderContent: { label: "ISBN" },
  repetitionConfig: { repetitionKey: "isbn_group" },
  isbn: panelField("isbn", "ISBN"),
  edition: panelField("edition", "Edition"),
};

const storedRows = [
  { isbn: "978-90-209-1234-5", edition: "Hardcover" },
  { isbn: "978-90-209-5678-9", edition: "Paperback" },
];

const repeatableStory = (
  formId: string,
  rows: Record<string, unknown>[] | undefined,
  canUpdate = true,
): Story => ({
  render: () => ({
    components: { EntityElementWindow },
    setup() {
      setupForm(formId, rows ? { isbn_group: rows } : {}, canUpdate);
      return { element: inWindow(repeatablePanel), formId };
    },
    template,
  }),
});

export const IndependentRows: Story = {
  render: () => ({
    components: { EntityElementWindow },
    setup() {
      const formId = "story-panel-rows";
      setupForm(formId, { publisher: "Lannoo", place: "Tielt", year: "1987" });
      return {
        element: inWindow({
          ...basePanel,
          panelHeaderContent: { label: "Publication" },
          publisher: panelField("publisher", "Publisher", "Lannoo"),
          place: panelField("place", "Place", "Tielt"),
          year: panelField("year", "Year", "1987"),
        }),
        formId,
      };
    },
    template,
  }),
};

export const Repeatable: Story = repeatableStory(
  "story-repeatable",
  storedRows,
);

export const RepeatableNewRow: Story = {
  ...repeatableStory("story-repeatable-new", storedRows.slice(0, 1)),
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLElement>('[data-cy="repeatable-add-row"]')
      ?.click();
  },
};

export const RepeatableEmpty: Story = repeatableStory(
  "story-repeatable-empty",
  undefined,
);

export const RepeatableReadOnly: Story = repeatableStory(
  "story-repeatable-read-only",
  storedRows,
  false,
);
