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
  // "EntityElements/…" so the manifest ids
  // `entityelements-entityelementwindowpanel--*` resolve.
  title: "EntityElements/EntityElementWindowPanel",
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

const editableMetadataPanel = () =>
  metadataPanel({
    isEditable: true,
    materialField: {
      ...panelMetaData("material", "Material", "Oak, gilded bronze"),
      inputField: { type: "text", isMetadataField: true },
    },
    dimensionsField: {
      ...panelMetaData("dimensions", "Dimensions", "112 × 64 × 40 cm"),
      inputField: { type: "text", isMetadataField: true },
    },
  });

/** Manifest id `entityelements-entityelementwindowpanel--group-editing`:
 *  interdependent group — one gesture opens the whole card with a single
 *  Bewaar/Annuleer pair (useBlockEditor). The play function performs the
 *  opening gesture on the first member. */
export const GroupEditing: Story = {
  args: {
    panel: editableMetadataPanel(),
    identifiers: [FORM_ID],
    isEdit: true,
    formId: FORM_ID,
  },
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLElement>("[data-cy='inline-edit-toggle']")
      ?.click();
  },
};

const REPEATABLE_FORM_ID = "asset-storybook-panel-repeatable";

/** Manifest id `entityelements-entityelementwindowpanel--repeatable`:
 *  repeatable rows (zebra), add-row pill in edit mode; a row behaves as a
 *  field (edit scope = save scope). `tableInputFields/*` are the
 *  multi-column variant of this pattern. */
export const Repeatable: Story = {
  args: {
    panel: metadataPanel({
      panelHeaderContent: {
        __typename: "PanelHeaderContent",
        label: "ISBN",
      },
      repetitionConfig: {
        __typename: "RepetitionConfig",
        repetitionKey: "isbn",
      },
      materialField: {
        ...panelMetaData("isbn", "ISBN", "978-90-234-5678-1"),
        inputField: { type: "text", isMetadataField: true },
      },
    }),
    identifiers: [REPEATABLE_FORM_ID],
    isEdit: true,
    formId: REPEATABLE_FORM_ID,
  },
  render: (args) => ({
    components: { EntityElementWindowPanel },
    setup: () => {
      const { getForm, createForm } = useFormHelper();
      if (!getForm(REPEATABLE_FORM_ID))
        createForm(REPEATABLE_FORM_ID, {
          intialValues: {
            isbn: ["978-90-234-5678-1", "978-90-234-5678-2"],
          },
          relationValues: {},
        } as any);
      return { args };
    },
    template:
      '<div class="max-w-3xl p-4 bg-background-light"><EntityElementWindowPanel v-bind="args" /></div>',
  }),
};
