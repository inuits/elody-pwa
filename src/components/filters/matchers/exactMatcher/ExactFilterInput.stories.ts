import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ExactFilterInput from "./ExactFilterInput.vue";
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

const meta: Meta<typeof ExactFilterInput> = {
  title: "Filters/Matchers/ExactFilterInput",
  component: ExactFilterInput,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof ExactFilterInput>;

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

export const DateTimeInput: Story = {
  args: {
    filter: makeFilter({
      type: AdvancedFilterTypes.Date,
      key: "date_updated",
      label: "Last updated",
      showTimeForDateFilter: true,
    }),
    lastTypedValue: "",
  },
};
