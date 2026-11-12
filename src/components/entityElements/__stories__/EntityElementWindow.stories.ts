import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntityElementWindow from "../EntityElementWindow.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useEditMode } from "@/composables/useEdit";
import { InputFieldTypes, PanelType } from "@/generated-types/queries";

const meta: Meta<typeof EntityElementWindow> = {
  title: "EntityElements/EntityElementWindow",
  component: EntityElementWindow,
  parameters: {
    docs: {
      description: {
        component:
          "The panel shell: a white card with a 1px panel border, an " +
          "accent-light header band and no shadow. Each block inside gets " +
          "its own section header.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EntityElementWindow>;

const FORM_ID = "story-window";

const field = (key: string, label: string, value: unknown) => ({
  __typename: "PanelMetaData",
  key,
  label,
  value,
  inputField: { type: InputFieldTypes.Text, label },
});

const panel = (label: string, fields: Record<string, unknown>) => ({
  __typename: "WindowElementPanel",
  panelType: PanelType.Metadata,
  isCollapsed: false,
  isEditable: true,
  canBeMultipleColumns: false,
  panelHeaderContent: { label },
  ...fields,
});

const element = {
  __typename: "WindowElement",
  label: "Information",
  description: panel("Description", {
    title: field("title", "Title", "Tales from the North Sea"),
    author: field("author", "Author", "Jan Peeters"),
  }),
  publication: panel("Publication", {
    publisher: field("publisher", "Publisher", "Lannoo"),
    year: field("year", "Year", "1987"),
  }),
};

export const Default: Story = {
  render: () => ({
    components: { EntityElementWindow },
    setup() {
      useEditMode(FORM_ID);
      useFormHelper().createForm(FORM_ID, {
        intialValues: {
          title: "Tales from the North Sea",
          author: "Jan Peeters",
          publisher: "Lannoo",
          year: "1987",
        },
        relationValues: {},
      } as never);
      return { element, formId: FORM_ID };
    },
    template: `
      <div style="max-width:560px">
        <entity-element-window
          :element="element"
          :identifiers="['story-entity']"
          :form-id="formId"
        />
      </div>`,
  }),
};
