import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ExactMatcher from "./ExactMatcher.vue";
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

// Dispatches on the filter type: boolean → checkbox pair, selection →
// option list (GraphQL-backed), anything else → exact-value input.
const meta: Meta<typeof ExactMatcher> = {
  title: "Filters/Matchers/ExactMatcher",
  component: ExactMatcher,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof ExactMatcher>;

export const Text: Story = {
  args: {
    filter: makeFilter(),
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
