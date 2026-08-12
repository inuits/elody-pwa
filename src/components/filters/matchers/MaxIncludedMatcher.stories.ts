import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MaxIncludedMatcher from "./MaxIncludedMatcher.vue";
import type { FilterListItem } from "@/composables/useStateManagement";
import { AdvancedFilterTypes } from "@/generated-types/queries";

const makeFilter = (
  overrides: Record<string, unknown> = {},
): FilterListItem =>
  ({
    isActive: false,
    isDisplayed: true,
    inputFromState: undefined,
    selectedMatcher: undefined,
    advancedFilter: {
      type: AdvancedFilterTypes.Number,
      key: "filesize",
      label: "File size (MB)",
      defaultValue: undefined,
      hidden: false,
      isDisplayedByDefault: true,
      options: [],
      ...overrides,
    },
  }) as unknown as FilterListItem;

// "Less than or equal" bound; renders a number or date input based on the
// filter type.
const meta: Meta<typeof MaxIncludedMatcher> = {
  title: "Filters/Matchers/MaxIncludedMatcher",
  component: MaxIncludedMatcher,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof MaxIncludedMatcher>;

export const NumberInput: Story = {
  args: {
    filter: makeFilter(),
  },
};

export const DateInput: Story = {
  args: {
    filter: makeFilter({
      type: AdvancedFilterTypes.Date,
      key: "date_created",
      label: "Creation date",
    }),
  },
};
