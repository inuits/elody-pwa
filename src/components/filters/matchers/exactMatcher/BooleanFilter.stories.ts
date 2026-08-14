import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BooleanFilter from "./BooleanFilter.vue";
import type { FilterListItem } from "@/composables/useStateManagement";
import { AdvancedFilterTypes } from "@/generated-types/queries";

const makeFilter = (inputFromState?: { value: unknown }): FilterListItem =>
  ({
    isActive: false,
    isDisplayed: true,
    inputFromState,
    selectedMatcher: undefined,
    advancedFilter: {
      type: AdvancedFilterTypes.Boolean,
      key: "is_published",
      label: "Published",
      defaultValue: undefined,
      hidden: false,
      isDisplayedByDefault: true,
      options: [],
    },
  }) as unknown as FilterListItem;

// Yes/no checkbox pair; selecting one disables the other.
const meta: Meta<typeof BooleanFilter> = {
  title: "Filters/Matchers/BooleanFilter",
  component: BooleanFilter,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof BooleanFilter>;

export const Default: Story = {
  args: {
    filter: makeFilter(),
  },
};

export const PreselectedYes: Story = {
  args: {
    filter: makeFilter({ value: true }),
  },
};

export const PreselectedNo: Story = {
  args: {
    filter: makeFilter({ value: false }),
  },
};
