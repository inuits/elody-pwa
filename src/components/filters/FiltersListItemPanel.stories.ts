import type { Meta, StoryObj } from "@storybook/vue3-vite";
import FiltersListItemPanel from "./FiltersListItemPanel.vue";
import { DamsIcons } from "@/generated-types/queries";

const matcherOptions = [
  { icon: DamsIcons.NoIcon, label: "Contains", value: "ContainsMatcher" },
  { icon: DamsIcons.NoIcon, label: "Is exactly", value: "ExactMatcher" },
  { icon: DamsIcons.NoIcon, label: "Has any value", value: "AnyMatcher" },
  { icon: DamsIcons.NoIcon, label: "Has no value", value: "NoneMatcher" },
];

const meta: Meta<typeof FiltersListItemPanel> = {
  title: "Filters/FiltersListItemPanel",
  component: FiltersListItemPanel,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-[28rem]"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof FiltersListItemPanel>;

export const NoMatcherSelected: Story = {
  args: {
    matchers: matcherOptions,
    selectedMatcher: undefined,
    defaultLabel: "Select filter type",
  },
};

// When a matcher is selected the panel renders its default slot: the matcher
// component with the actual filter input.
export const MatcherSelected: Story = {
  args: {
    matchers: matcherOptions,
    selectedMatcher: "ContainsMatcher",
    defaultLabel: "Select filter type",
  },
  render: (args) => ({
    components: { FiltersListItemPanel },
    setup: () => ({ args }),
    template: `
      <div class="w-[28rem]">
        <FiltersListItemPanel v-bind="args">
          <input
            class="w-full rounded border border-neutral-light p-2"
            placeholder="Keyword…"
          />
        </FiltersListItemPanel>
      </div>
    `,
  }),
};
