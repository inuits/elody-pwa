import type { Meta, StoryObj } from "@storybook/vue3-vite";
import InBetweenMatcher from "./InBetweenMatcher.vue";
import type { FilterListItem } from "@/composables/useStateManagement";
import { AdvancedFilterTypes } from "@/generated-types/queries";

const makeFilter = (
  overrides: Record<string, unknown> = {},
  inputFromState?: { value: unknown },
): FilterListItem =>
  ({
    isActive: false,
    isDisplayed: true,
    inputFromState,
    selectedMatcher: undefined,
    advancedFilter: {
      type: AdvancedFilterTypes.Number,
      key: "width",
      label: "Image width",
      defaultValue: undefined,
      hidden: false,
      isDisplayedByDefault: true,
      options: [],
      ...overrides,
    },
  }) as unknown as FilterListItem;

const meta: Meta<typeof InBetweenMatcher> = {
  title: "Filters/Matchers/InBetweenMatcher",
  component: InBetweenMatcher,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-[28rem] p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof InBetweenMatcher>;

export const NumberRange: Story = {
  args: {
    filter: makeFilter(),
  },
};

export const DateRange: Story = {
  args: {
    filter: makeFilter({
      type: AdvancedFilterTypes.Date,
      key: "date_created",
      label: "Creation date",
    }),
  },
};

export const DateTimeRange: Story = {
  args: {
    filter: makeFilter({
      type: AdvancedFilterTypes.Date,
      key: "date_updated",
      label: "Last updated",
      showTimeForDateFilter: true,
    }),
  },
};

export const RestoredFromState: Story = {
  args: {
    filter: makeFilter({}, { value: { min: 800, max: 1920 } }),
  },
};
