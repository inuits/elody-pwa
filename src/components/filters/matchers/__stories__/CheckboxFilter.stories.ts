import type { Meta, StoryObj } from "@storybook/vue3-vite";
import CheckboxFilter from "../exactMatcher/CheckboxFilter.vue";

const meta: Meta<typeof CheckboxFilter> = {
  // Story id filters-filtersbase--default stays reserved for the rail; the
  // checkbox list is the piece of it that can mount without Apollo.
  title: "Filters/Matchers/CheckboxFilter",
  component: CheckboxFilter,
  parameters: {
    docs: {
      description: {
        component:
          "The checkbox-list matcher with its facet counts. The count is part " +
          "of the option, not decoration: it sits in the accessible name — " +
          "\"BOEK, 812 resultaten\" — while the visible numeral is a muted " +
          "chip on the right. An option the facets know nothing about simply " +
          "shows no number. Picking never applies; that stays with Pas toe.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CheckboxFilter>;

const option = (value: string, label: string) => ({ label, value });

export const WithCounts: Story = {
  render: () => ({
    components: { CheckboxFilter },
    setup() {
      return {
        options: [
          option("boek", "BOEK"),
          option("tijdschrift", "Tijdschrift"),
          option("dvd", "DVD"),
          option("bladmuziek", "Bladmuziek"),
        ],
        counts: new Map([
          ["boek", 812],
          ["tijdschrift", 64],
          ["dvd", 7],
        ]),
        filter: { inputFromState: { value: ["boek"] } },
      };
    },
    template: `
      <div style="max-width:250px;padding:14px;background:var(--color-surface);
                  border:1px solid var(--color-border-subtle);border-radius:var(--radius-card)">
        <checkbox-filter :options="options" :counts="counts" :filter="filter" />
      </div>`,
  }),
};
