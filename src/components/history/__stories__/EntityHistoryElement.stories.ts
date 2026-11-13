import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { computed } from "vue";
import EntityHistoryElement from "../EntityHistoryElement.vue";
import {
  createHistoryForm,
  relationDiffsFor,
  windowElements,
  wysiwygDiffsFor,
  type HistoryVariant,
} from "./historyFixtures";

type Args = { variant: HistoryVariant };

const meta: Meta<Args> = {
  title: "History/EntityHistoryElement",
  component: EntityHistoryElement as never,
  parameters: {
    docs: {
      description: {
        component:
          "One version of a record in the history view: its windows and " +
          "relation lists, read-only, with the version's diff marks. The " +
          "history modal shows two of these side by side, the earlier " +
          "version left and the later one right.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["previous", "current"] },
  },
};

export default meta;
type Story = StoryObj<Args>;

const versionSetup = (variant: () => HistoryVariant) => {
  const forms = {
    previous: createHistoryForm("previous"),
    current: createHistoryForm("current"),
  };
  return {
    entity: computed(() => ({ id: forms[variant()] })),
    relationDiffs: computed(() => relationDiffsFor(variant())),
    wysiwygDiffs: computed(() => wysiwygDiffsFor(variant())),
  };
};

export const Default: Story = {
  args: { variant: "current" },
  render: (args) => ({
    components: { EntityHistoryElement },
    setup: () => ({
      elements: windowElements,
      ...versionSetup(() => args.variant),
    }),
    template: `
      <div style="max-width:480px">
        <entity-history-element
          :key="entity.id"
          :elements="elements"
          :entity="entity"
          :relation-diffs="relationDiffs"
          :wysiwyg-diffs="wysiwygDiffs"
        />
      </div>`,
  }),
};

export const Versions: Story = {
  render: () => ({
    components: { EntityHistoryElement },
    setup: () => ({
      elements: windowElements,
      previous: versionSetup(() => "previous"),
      current: versionSetup(() => "current"),
    }),
    template: `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:960px">
        <entity-history-element
          :elements="elements"
          :entity="previous.entity.value"
          :relation-diffs="previous.relationDiffs.value"
          :wysiwyg-diffs="previous.wysiwygDiffs.value"
        />
        <entity-history-element
          :elements="elements"
          :entity="current.entity.value"
          :relation-diffs="current.relationDiffs.value"
          :wysiwyg-diffs="current.wysiwygDiffs.value"
        />
      </div>`,
  }),
};
