import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ExactInputMatcher from "./ExactInputMatcher.vue";
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
      type: AdvancedFilterTypes.Text,
      key: "title",
      label: "Title",
      defaultValue: undefined,
      hidden: false,
      isDisplayedByDefault: true,
      options: [],
      ...overrides,
    },
  }) as unknown as FilterListItem;

// Renders a plain input for text/number/date filters and a yes/no checkbox
// pair for boolean filters.
const meta: Meta<typeof ExactInputMatcher> = {
  title: "Filters/Matchers/ExactInputMatcher",
  component: ExactInputMatcher,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof ExactInputMatcher>;

export const Text: Story = {
  args: {
    filter: makeFilter(),
    lastTypedValue: "",
  },
};

export const NumberInput: Story = {
  args: {
    filter: makeFilter({
      type: AdvancedFilterTypes.Number,
      key: "width",
      label: "Image width",
    }),
    lastTypedValue: "",
  },
};

export const DateInput: Story = {
  args: {
    filter: makeFilter({
      type: AdvancedFilterTypes.Date,
      key: "date_created",
      label: "Creation date",
    }),
    lastTypedValue: "",
  },
};

export const BooleanInput: Story = {
  args: {
    filter: makeFilter({
      type: AdvancedFilterTypes.Boolean,
      key: "is_published",
      label: "Published",
    }),
    lastTypedValue: "",
  },
};
