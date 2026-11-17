import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { computed } from "vue";
import EntityHistoryElement from "../EntityHistoryElement.vue";
import EntityHistoryColumn from "../EntityHistoryColumn.vue";
import {
  createHistoryForm,
  relationDiffsFor,
  values,
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
          "history page shows two of these side by side; by default the " +
          "current version is on the left and the version before it on " +
          "the right.",
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
    components: { EntityHistoryColumn },
    setup: () => {
      const column = (variant: HistoryVariant) => ({
        id: `story-history-column-${variant}`,
        entityView: { main: { elements: structuredClone(windowElements) } },
        intialValues: values[variant],
      });
      return {
        current: column("current"),
        previous: column("previous"),
        relationDiffsFor,
        wysiwygDiffsFor,
      };
    },
    template: `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:960px">
        <entity-history-column
          :entity="current"
          :relation-diffs="relationDiffsFor('current')"
          :wysiwyg-diffs="wysiwygDiffsFor('current')"
        />
        <entity-history-column
          :entity="previous"
          :relation-diffs="relationDiffsFor('previous')"
          :wysiwyg-diffs="wysiwygDiffsFor('previous')"
        />
      </div>`,
  }),
};
