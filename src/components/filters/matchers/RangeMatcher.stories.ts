import type { Meta, StoryObj } from "@storybook/vue3-vite";
import RangeMatcher from "./RangeMatcher.vue";
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
      key: "year",
      label: "Publication year",
      defaultValue: undefined,
      hidden: false,
      isDisplayedByDefault: true,
      options: [],
      min: 1900,
      max: 2026,
      ...overrides,
    },
  }) as unknown as FilterListItem;

// Slider over the min/max bounds declared on the advanced filter itself.
const meta: Meta<typeof RangeMatcher> = {
  title: "Filters/Matchers/RangeMatcher",
  component: RangeMatcher,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-[28rem] p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof RangeMatcher>;

export const Default: Story = {
  args: {
    filter: makeFilter(),
  },
};

export const WithUnit: Story = {
  args: {
    filter: makeFilter({
      key: "filesize",
      label: "File size",
      min: 0,
      max: 500,
      unit: "MB",
    }),
  },
};

export const RestoredFromState: Story = {
  args: {
    filter: makeFilter({}, { value: { min: 1960, max: 1990 } }),
  },
};
