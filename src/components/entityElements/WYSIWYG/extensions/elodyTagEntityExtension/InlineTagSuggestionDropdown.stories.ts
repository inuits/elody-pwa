import type { Meta, StoryObj } from "@storybook/vue3-vite";
import InlineTagSuggestionDropdown from "./InlineTagSuggestionDropdown.vue";
import type { InlineSuggestionState } from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/inlineTagSuggestion";

// The dropdown anchors at the trigger character's viewport coordinates and
// searches entities matching the typed query. The mock Apollo client returns
// empty data, so the story shows the "no results" state of the typeahead.
const suggestion = {
  configurations: [
    {
      tag: "@",
      taggableEntityType: "person",
      metadataFilterForTagContent: "type|metadata.name.value",
      inlineTrigger: { minCharacters: 2 },
    },
  ],
  query: "verhulst",
  range: { from: 12, to: 21 },
  anchor: { left: 48, bottom: 96 },
} as unknown as NonNullable<InlineSuggestionState>;

const meta: Meta<typeof InlineTagSuggestionDropdown> = {
  title: "EntityElements/Wysiwyg/InlineTagSuggestionDropdown",
  component: InlineTagSuggestionDropdown,
  tags: ["autodocs"],
  decorators: [
    () => ({ template: '<div class="h-96 p-4"><story /></div>' }),
  ],
};
export default meta;

type Story = StoryObj<typeof InlineTagSuggestionDropdown>;

export const NoResults: Story = {
  args: {
    suggestion,
  },
};
