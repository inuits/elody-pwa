import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SavedSearches from "./SavedSearches.vue";
import { Entitytyping } from "@/generated-types/queries";
import { useRoute } from "vue-router";

const activeFilters = [
  {
    type: "text",
    key: ["elody:1|metadata.title.value"],
    value: "portret",
    match_exact: false,
  },
];

// Rendered as the content of the saved-searches context menu; the last-used
// filters come from local storage for the current route.
const meta: Meta<typeof SavedSearches> = {
  title: "Components/SavedSearches",
  component: SavedSearches,
  tags: ["autodocs"],
  render: (args) => ({
    components: { SavedSearches },
    setup() {
      const route = useRoute();
      return { args, route };
    },
    template: `
      <div class="w-80 p-4 border rounded-lg bg-background-light">
        <SavedSearches v-bind="args" :route="route" />
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<typeof SavedSearches>;

export const WithActiveFilters: Story = {
  args: {
    activeFilters,
    hasActiveFilters: true,
    entityType: Entitytyping.Work,
  } as any,
};

export const WithoutActiveFilters: Story = {
  args: {
    activeFilters: [],
    hasActiveFilters: false,
    entityType: Entitytyping.Work,
  } as any,
};
