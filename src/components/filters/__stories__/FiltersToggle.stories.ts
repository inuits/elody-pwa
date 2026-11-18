import type { Meta, StoryObj } from "@storybook/vue3-vite";
import FiltersToggle from "../FiltersToggle.vue";

const meta: Meta<typeof FiltersToggle> = {
  title: "Filters/FiltersToggle",
  component: FiltersToggle,
  parameters: {
    docs: {
      description: {
        component:
          "The Filters button in the list band. It opens and closes the " +
          "filter pane and shows how many filters are active. While the " +
          "pane is closed, an applied saved search shows beside it as a " +
          "removable chip.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FiltersToggle>;

const rows = [
  { note: "No filters", activeCount: 0, expanded: false },
  { note: "Two active filters", activeCount: 2, expanded: false },
  { note: "Pane open", activeCount: 2, expanded: true },
  {
    note: "Saved search applied",
    activeCount: 3,
    expanded: false,
    savedSearchTitle: "Comics published after 2000",
  },
  {
    note: "Saved search changed since it was applied",
    activeCount: 4,
    expanded: false,
    savedSearchTitle: "Comics published after 2000",
    savedSearchModified: true,
  },
];

export const States: Story = {
  render: () => ({
    components: { FiltersToggle },
    setup: () => ({ rows }),
    template: `
      <div style="display:grid;grid-template-columns:max-content 1fr;gap:12px 24px;align-items:center">
        <template v-for="row in rows" :key="row.note">
          <span style="font-size:var(--text-label);color:var(--color-text-secondary)">{{ row.note }}</span>
          <filters-toggle v-bind="row" controls="story-rail" />
        </template>
      </div>`,
  }),
};
