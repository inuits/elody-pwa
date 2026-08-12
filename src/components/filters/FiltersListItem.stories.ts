import type { Meta, StoryObj } from "@storybook/vue3-vite";
import FiltersListItem from "./FiltersListItem.vue";
import type { FilterListItem } from "@/composables/useStateManagement";
import {
  AdvancedFilterTypes,
  DamsIcons,
  Matchers,
} from "@/generated-types/queries";

// Matcher dropdown options: `value` must be a Matchers enum name because the
// component dynamically imports `matchers/<value>.vue`.
const matcherOption = (label: string, value: Matchers) => ({
  icon: DamsIcons.NoIcon,
  label,
  value,
});

const textMatchers = [
  matcherOption("Contains", Matchers.ContainsMatcher),
  matcherOption("Does not contain", Matchers.ContainsNotMatcher),
  matcherOption("Is exactly", Matchers.ExactMatcher),
  matcherOption("Has any value", Matchers.AnyMatcher),
  matcherOption("Has no value", Matchers.NoneMatcher),
];

const dateMatchers = [
  matcherOption("On date", Matchers.ExactInputMatcher),
  matcherOption("Between", Matchers.InBetweenMatcher),
  matcherOption("After (included)", Matchers.MinIncludedMatcher),
  matcherOption("Before (included)", Matchers.MaxIncludedMatcher),
];

const makeFilter = (
  advancedFilterOverrides: Record<string, unknown>,
  itemOverrides: Record<string, unknown> = {},
): FilterListItem =>
  ({
    isActive: true,
    isDisplayed: true,
    inputFromState: undefined,
    selectedMatcher: undefined,
    advancedFilter: {
      type: AdvancedFilterTypes.Text,
      key: "title",
      label: "Title",
      defaultValue: undefined,
      hidden: false,
      isDisplayedByDefault: true,
      options: [],
      ...advancedFilterOverrides,
    },
    ...itemOverrides,
  }) as unknown as FilterListItem;

const meta: Meta<typeof FiltersListItem> = {
  title: "Filters/FiltersListItem",
  component: FiltersListItem,
  tags: ["autodocs"],
  decorators: [
    () => ({
      template: '<div class="w-[28rem] bg-background-light"><story /></div>',
    }),
  ],
};
export default meta;

type Story = StoryObj<typeof FiltersListItem>;

const commonArgs = {
  clearAllActiveFilters: false,
  getNormalizedActiveFilters: () => [],
  refetchFilterOptions: false,
};

export const TextFilter: Story = {
  args: {
    ...commonArgs,
    filter: makeFilter({ key: "title", label: "Title" }),
    matchers: textMatchers,
  },
};

export const DateFilter: Story = {
  args: {
    ...commonArgs,
    filter: makeFilter({
      type: AdvancedFilterTypes.Date,
      key: "date_created",
      label: "Creation date",
    }),
    matchers: dateMatchers,
  },
};

export const NumberFilter: Story = {
  args: {
    ...commonArgs,
    filter: makeFilter({
      type: AdvancedFilterTypes.Number,
      key: "width",
      label: "Image width",
    }),
    matchers: [
      matcherOption("Is exactly", Matchers.ExactInputMatcher),
      matcherOption("Between", Matchers.InBetweenMatcher),
      matcherOption("Minimum", Matchers.MinIncludedMatcher),
      matcherOption("Maximum", Matchers.MaxIncludedMatcher),
    ],
  },
};

export const BooleanFilter: Story = {
  args: {
    ...commonArgs,
    filter: makeFilter({
      type: AdvancedFilterTypes.Boolean,
      key: "is_published",
      label: "Published",
    }),
    matchers: [matcherOption("Is", Matchers.ExactInputMatcher)],
  },
};

// Inactive filters render collapsed: only the header row is visible until
// the user toggles it open.
export const CollapsedInactive: Story = {
  args: {
    ...commonArgs,
    filter: makeFilter(
      { key: "title", label: "Title" },
      { isActive: false },
    ),
    matchers: textMatchers,
  },
};
