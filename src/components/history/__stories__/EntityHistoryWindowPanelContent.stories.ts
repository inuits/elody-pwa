import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { computed } from "vue";
import EntityHistoryWindowPanelContent from "../EntityHistoryWindowPanelContent.vue";
import { getMetadataFields } from "@/helpers";
import {
  createHistoryForm,
  panel,
  relationDiffsFor,
  wysiwygDiffsFor,
  type HistoryVariant,
} from "./historyFixtures";

type Args = { variant: HistoryVariant; canBeMultipleColumns: boolean };

const meta: Meta<Args> = {
  title: "History/EntityHistoryWindowPanelContent",
  component: EntityHistoryWindowPanelContent as never,
  parameters: {
    docs: {
      description: {
        component:
          "The fields of one panel in one history version, read-only: plain " +
          "metadata rows, relation fields as diff chips and rich text with " +
          "its changed border and tint.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["previous", "current"] },
    canBeMultipleColumns: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  args: { variant: "current", canBeMultipleColumns: false },
  render: (args) => ({
    components: { EntityHistoryWindowPanelContent },
    setup() {
      const forms = {
        previous: createHistoryForm("previous"),
        current: createHistoryForm("current"),
      };
      const formId = computed(() => forms[args.variant]);
      return {
        args,
        formId,
        metadatafields: computed(() =>
          getMetadataFields(panel as never, formId.value),
        ),
        relationDiffs: computed(() => relationDiffsFor(args.variant)),
        wysiwygDiffs: computed(() => wysiwygDiffsFor(args.variant)),
      };
    },
    template: `
      <div style="max-width:420px">
        <entity-history-window-panel-content
          :key="formId"
          :relation-array="[]"
          :metadatafields="metadatafields"
          :can-be-multiple-columns="args.canBeMultipleColumns"
          :form-id="formId"
          :identifiers="[formId]"
          :parent-is-list-item="false"
          :relation-diffs="relationDiffs"
          :wysiwyg-diffs="wysiwygDiffs"
        />
      </div>`,
  }),
};
