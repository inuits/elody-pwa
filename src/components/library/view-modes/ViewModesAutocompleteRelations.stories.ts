import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ViewModesAutocompleteRelations from "./ViewModesAutocompleteRelations.vue";
import type { AdvancedFilterInput } from "@/generated-types/queries";

// Minimal filter fixtures: in the app these come from the GraphQL form
// definition and drive the option queries. Storybook's Apollo mock resolves
// those queries to empty data, so the option list stays empty; the read-only
// story pre-selects values through the metadata path, which needs no backend.
const searchFilter = {
  type: "text",
  key: ["elody:1|metadata.name.value"],
  value: "",
  match_exact: false,
} as unknown as AdvancedFilterInput;

const retrieveFilter = {
  type: "type",
  key: null,
  value: "genre",
  match_exact: true,
} as unknown as AdvancedFilterInput;

const meta: Meta<typeof ViewModesAutocompleteRelations> = {
  title: "Library/ViewModes/ViewModesAutocompleteRelations",
  component: ViewModesAutocompleteRelations,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
  args: {
    formId: "storybook-form",
    relationType: "hasGenre",
    fromRelationType: "isGenreFor",
    advancedFilterInputForSearchingOptions: searchFilter,
    relationFilter: undefined as unknown as AdvancedFilterInput,
    autoSelectable: false,
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<typeof ViewModesAutocompleteRelations>;

export const ReadOnlyWithValues: Story = {
  args: {
    modelValue: ["portrait", "still life"],
    mode: "edit",
    isReadOnly: true,
    isMetadataField: true,
    disabled: true,
    advancedFilterInputForRetrievingOptions: [retrieveFilter] as [
      AdvancedFilterInput,
    ],
  },
};

// No live-edit variant: the editable path resolves its options through the
// shared dropdown-options state, which on a first isolated mount hands the
// template a non-unwrapped computed (options?.map crashes). The read-only
// metadata path below covers the component's rendering without that state.
export const ReadOnlyEmpty: Story = {
  args: {
    modelValue: [],
    mode: "edit",
    isReadOnly: true,
    isMetadataField: true,
    disabled: true,
    advancedFilterInputForRetrievingOptions: [retrieveFilter] as [
      AdvancedFilterInput,
    ],
  },
};
