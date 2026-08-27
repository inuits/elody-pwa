import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import EntityElementWindowPanel from "../EntityElementWindowPanel.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { InputFieldTypes, PanelType } from "@/generated-types/queries";

const meta: Meta<typeof EntityElementWindowPanel> = {
  // Story id entityelements-entityelementwindowpanel--group-editing,
  // per MANIFEST.md.
  title: "EntityElements/EntityElementWindowPanel",
  component: EntityElementWindowPanel,
  parameters: {
    docs: {
      description: {
        component:
          "The group scope of per-field editing. Fields that make no sense " +
          "apart — publisher, place, year — carry a tint at rest and lift " +
          "into a card when any one of them is clicked: one gesture opens all " +
          "of them, one Bewaar/Annuleer pair commits them, and validation " +
          "covers the group and stops there. Panels opt in with `isGroup`; " +
          "everything else keeps independent field rows.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EntityElementWindowPanel>;

const FORM_ID = "story-group-panel";

const panelField = (key: string, label: string, value: unknown) => ({
  __typename: "PanelMetaData",
  key,
  label,
  value,
  inputField: { type: InputFieldTypes.Text, label },
});

const panel = (isGroup: boolean) => ({
  __typename: "WindowElementPanel",
  panelType: PanelType.Metadata,
  isCollapsed: false,
  isEditable: true,
  canBeMultipleColumns: false,
  isGroup,
  panelHeaderContent: { label: "Uitgave" },
  publisher: panelField("publisher", "Uitgever", "Lannoo"),
  place: panelField("place", "Plaats", "Tielt"),
  year: panelField("year", "Jaar", "1987"),
});

const setupForm = () => {
  provide("persistEntity", async () => {
    await new Promise((resolve) => setTimeout(resolve, 700));
  });
  useFormHelper().createForm(FORM_ID, {
    intialValues: { publisher: "Lannoo", place: "Tielt", year: "1987" },
    relationValues: {},
  } as never);
};

/**
 * Clicking any of the three values opens all three; the pair at the bottom
 * right commits them together.
 */
export const GroupEditing: Story = {
  render: () => ({
    components: { EntityElementWindowPanel },
    setup() {
      setupForm();
      return { panel: panel(true), formId: FORM_ID };
    },
    template: `
      <div style="max-width:560px">
        <entity-element-window-panel
          :panel="panel"
          :identifiers="['story-entity']"
          :is-edit="false"
          :form-id="formId"
        />
      </div>`,
  }),
};

/**
 * A panel with a repetitionConfig repeats its row block: "Add more" appends a
 * block, each block after the first carries its own remove, and a rule
 * separates the blocks (repeatable-row-group.md).
 */
export const Repeatable: Story = {
  render: () => ({
    components: { EntityElementWindowPanel },
    setup() {
      setupForm();
      return {
        panel: {
          ...panel(false),
          panelHeaderContent: { label: "Identificatienummers" },
          repetitionConfig: { repetitionKey: "identifiers" },
        },
        formId: FORM_ID,
      };
    },
    template: `
      <div style="max-width:560px">
        <entity-element-window-panel
          :panel="panel"
          :identifiers="['story-entity']"
          :is-edit="true"
          :form-id="formId"
        />
      </div>`,
  }),
};

/**
 * The same three fields without the flag: independent rows, each saving on its
 * own. This is what every panel does unless the form definition says otherwise.
 */
export const IndependentRows: Story = {
  render: () => ({
    components: { EntityElementWindowPanel },
    setup() {
      setupForm();
      return { panel: panel(false), formId: FORM_ID };
    },
    template: `
      <div style="max-width:560px">
        <entity-element-window-panel
          :panel="panel"
          :identifiers="['story-entity']"
          :is-edit="false"
          :form-id="formId"
        />
      </div>`,
  }),
};
