import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntityElementWindow from "./EntityElementWindow.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import {
  PanelType,
  WindowElementLayout,
  type WindowElement,
} from "@/generated-types/queries";

const FORM_ID = "asset-storybook-window-1";

const panelMetaData = (key: string, label: string, value: string) =>
  ({
    __typename: "PanelMetaData",
    key,
    label,
    value,
  }) as any;

const windowElement = (
  overrides: Record<string, unknown> = {},
): WindowElement =>
  ({
    __typename: "WindowElement",
    label: "Object information",
    layout: WindowElementLayout.Vertical,
    identificationPanel: {
      __typename: "WindowElementPanel",
      panelType: PanelType.Metadata,
      isCollapsed: false,
      isEditable: false,
      canBeMultipleColumns: true,
      panelHeaderContent: {
        __typename: "PanelHeaderContent",
        label: "Identification",
      },
      titleField: panelMetaData("title", "Title", "Delftware garniture vase"),
      objectNumberField: panelMetaData(
        "object_number",
        "Object number",
        "CER-1690-0042",
      ),
      materialField: panelMetaData("material", "Material", "Tin-glazed earthenware"),
    },
    datingPanel: {
      __typename: "WindowElementPanel",
      panelType: PanelType.Metadata,
      isCollapsed: false,
      isEditable: false,
      canBeMultipleColumns: true,
      panelHeaderContent: { __typename: "PanelHeaderContent", label: "Dating" },
      dateField: panelMetaData("date_created", "Date created", "ca. 1690"),
      periodField: panelMetaData("period", "Period", "Late 17th century"),
    },
    ...overrides,
  }) as unknown as WindowElement;

const seedForm = () => {
  const { getForm, createForm } = useFormHelper();
  if (!getForm(FORM_ID))
    createForm(FORM_ID, {
      intialValues: {
        title: "Delftware garniture vase",
        object_number: "CER-1690-0042",
        material: "Tin-glazed earthenware",
        date_created: "ca. 1690",
        period: "Late 17th century",
      },
      relationValues: {},
    } as any);
};

const meta: Meta<typeof EntityElementWindow> = {
  title: "EntityElements/EntityElementWindow",
  component: EntityElementWindow,
  tags: ["autodocs"],
  render: (args) => ({
    components: { EntityElementWindow },
    setup: () => {
      seedForm();
      return { args };
    },
    template:
      '<div class="max-w-4xl p-4"><EntityElementWindow v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof EntityElementWindow>;

export const Default: Story = {
  args: {
    element: windowElement(),
    identifiers: [FORM_ID],
    formId: FORM_ID,
  },
};

export const HorizontalGrid: Story = {
  args: {
    element: windowElement({ layout: WindowElementLayout.HorizontalGrid }),
    identifiers: [FORM_ID],
    formId: FORM_ID,
  },
};

export const WithPreviewLabel: Story = {
  args: {
    element: windowElement(),
    identifiers: [FORM_ID],
    formId: FORM_ID,
    previewLabel: "Preview of Delftware garniture vase",
  },
};
