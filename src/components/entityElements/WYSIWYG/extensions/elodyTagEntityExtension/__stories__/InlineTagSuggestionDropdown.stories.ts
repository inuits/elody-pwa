import type { Meta, StoryObj } from "@storybook/vue3-vite";
import InlineTagSuggestionDropdown from "../InlineTagSuggestionDropdown.vue";
import { registerQueryFixture } from "@/main";
import { Entitytyping } from "@/generated-types/queries";

const user = (id: string, name: string) => ({
  __typename: "User",
  id,
  intialValues: { __typename: "IntialValues", name },
});

const users = [
  user("p1", "Nora Vandamme"),
  user("p2", "Noah Peeters"),
  user("p3", "Norbert De Smet"),
  user("p4", "Nour El Amrani"),
];

const suggestion = (query: string) => ({
  configurations: [
    {
      tag: "@",
      taggableEntityType: Entitytyping.User,
      metadataFilterForTagContent: "elody:1|metadata.name.value",
    },
  ],
  query,
  range: { from: 1, to: 1 + query.length },
  anchor: { left: 32, bottom: 72 },
});

const withResults = (results: unknown[]) => (story: () => unknown) => {
  registerQueryFixture("getEntities", {
    Entities: { __typename: "EntitiesResults", results, count: results.length },
  });
  return story();
};

const meta: Meta<typeof InlineTagSuggestionDropdown> = {
  title: "EntityElements/InlineTagSuggestionDropdown",
  component: InlineTagSuggestionDropdown,
  argTypes: { onPick: { action: "pick" } },
  parameters: {
    docs: {
      description: {
        component:
          "The typeahead that opens under a WYSIWYG field when a tag trigger such as @ is typed. " +
          "It searches the configured entity types, highlights with the arrow keys and picks with Enter, Tab or a click.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof InlineTagSuggestionDropdown>;

const render: Story["render"] = (args) => ({
  components: { InlineTagSuggestionDropdown },
  setup: () => ({ args }),
  template: `
    <div>
      <p style="margin:0;padding:8px;border:1px solid var(--color-border-default);border-radius:var(--radius-input);background:var(--color-surface);max-width:480px">
        Reviewed by @{{ args.suggestion?.query }}
      </p>
      <inline-tag-suggestion-dropdown v-bind="args" />
    </div>`,
});

export const Default: Story = {
  args: { suggestion: suggestion("no") as never, customQuery: null },
  decorators: [withResults(users) as never],
  render,
};

export const NoResults: Story = {
  args: { suggestion: suggestion("xyz") as never, customQuery: null },
  decorators: [withResults([]) as never],
  render,
};
