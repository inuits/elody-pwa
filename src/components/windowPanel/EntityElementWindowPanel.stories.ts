import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntityElementWindowPanel from "./EntityElementWindowPanel.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { PanelType, type WindowElementPanel } from "@/generated-types/queries";

const FORM_ID = "asset-storybook-panel-1";

const panelMetaData = (key: string, label: string, value: string) =>
  ({
    __typename: "PanelMetaData",
    key,
    label,
    value,
  }) as any;

const metadataPanel = (overrides: Record<string, unknown> = {}) =>
  ({
    __typename: "WindowElementPanel",
    panelType: PanelType.Metadata,
    isCollapsed: false,
    isEditable: false,
    canBeMultipleColumns: true,
    panelHeaderContent: {
      __typename: "PanelHeaderContent",
      label: "Physical description",
    },
    materialField: panelMetaData("material", "Material", "Oak, gilded bronze"),
    dimensionsField: panelMetaData(
      "dimensions",
      "Dimensions",
      "112 × 64 × 40 cm",
    ),
    conditionField: panelMetaData("condition", "Condition", "Stable, minor wear"),
    ...overrides,
  }) as unknown as WindowElementPanel;

const seedForm = () => {
  const { getForm, createForm } = useFormHelper();
  if (!getForm(FORM_ID))
    createForm(FORM_ID, {
      intialValues: {
        material: "Oak, gilded bronze",
        dimensions: "112 × 64 × 40 cm",
        condition: "Stable, minor wear",
      },
      relationValues: {},
    } as any);
};

const meta: Meta<typeof EntityElementWindowPanel> = {
  title: "WindowPanel/EntityElementWindowPanel",
  component: EntityElementWindowPanel,
  tags: ["autodocs"],
  render: (args) => ({
    components: { EntityElementWindowPanel },
    setup: () => {
      seedForm();
      return { args };
    },
    template:
      '<div class="max-w-3xl p-4 bg-background-light"><EntityElementWindowPanel v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof EntityElementWindowPanel>;

export const Default: Story = {
  args: {
    panel: metadataPanel(),
    identifiers: [FORM_ID],
    isEdit: false,
    formId: FORM_ID,
  },
};

export const Collapsed: Story = {
  args: {
    panel: metadataPanel({ isCollapsed: true }),
    identifiers: [FORM_ID],
    isEdit: false,
    formId: FORM_ID,
  },
};

export const WithoutHeader: Story = {
  args: {
    panel: metadataPanel({ panelHeaderContent: undefined }),
    identifiers: [FORM_ID],
    isEdit: false,
    formId: FORM_ID,
  },
};
