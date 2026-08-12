import type { Meta, StoryObj } from "@storybook/vue3-vite";
import WindowPanelContent from "./WindowPanelContent.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { PanelType, type MetadataField } from "@/generated-types/queries";

const FORM_ID = "asset-storybook-panel-content-1";

const panelMetaData = (key: string, label: string, value: string) =>
  ({
    __typename: "PanelMetaData",
    key,
    label,
    value,
  }) as any;

const metadatafields = [
  panelMetaData("title", "Title", "Portrait of a lady with fan"),
  panelMetaData("creator", "Creator", "Studio of Anthony van Dyck"),
  panelMetaData("date_created", "Date created", "1632–1641"),
  panelMetaData("technique", "Technique", "Oil on canvas"),
] as MetadataField[];

const seedForm = () => {
  const { getForm, createForm } = useFormHelper();
  if (!getForm(FORM_ID))
    createForm(FORM_ID, {
      intialValues: {
        title: "Portrait of a lady with fan",
        creator: "Studio of Anthony van Dyck",
        date_created: "1632–1641",
        technique: "Oil on canvas",
      },
      relationValues: {},
    } as any);
};

const baseArgs = {
  panelType: PanelType.Metadata,
  relationArray: [],
  metadatafields,
  canBeMultipleColumns: true,
  formId: FORM_ID,
  isEdit: false,
  editState: { showErrors: false } as any,
  identifiers: [FORM_ID],
  parentIsListItem: false,
};

const meta: Meta<typeof WindowPanelContent> = {
  title: "WindowPanel/WindowPanelContent",
  component: WindowPanelContent,
  tags: ["autodocs"],
  render: (args) => ({
    components: { WindowPanelContent },
    setup: () => {
      seedForm();
      return { args };
    },
    template:
      '<div class="max-w-3xl p-4 bg-background-light"><WindowPanelContent v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof WindowPanelContent>;

export const MultipleColumns: Story = {
  args: { ...baseArgs },
};

export const SingleColumn: Story = {
  args: { ...baseArgs, canBeMultipleColumns: false },
};
