import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ContainsNotMatcher from "./ContainsNotMatcher.vue";
import type { FilterListItem } from "@/composables/useStateManagement";
import { AdvancedFilterTypes } from "@/generated-types/queries";

const descriptionFilter = (
  inputFromState?: { value: unknown },
): FilterListItem =>
  ({
    isActive: false,
    isDisplayed: true,
    inputFromState,
    selectedMatcher: undefined,
    advancedFilter: {
      type: AdvancedFilterTypes.Text,
      key: "description",
      label: "Description",
      defaultValue: undefined,
      hidden: false,
      isDisplayedByDefault: true,
      options: [],
    },
  }) as unknown as FilterListItem;

const meta: Meta<typeof ContainsNotMatcher> = {
  title: "Filters/Matchers/ContainsNotMatcher",
  component: ContainsNotMatcher,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof ContainsNotMatcher>;

export const Empty: Story = {
  args: {
    filter: descriptionFilter(),
    lastTypedValue: "",
  },
};

export const RestoredFromState: Story = {
  args: {
    filter: descriptionFilter({ value: "draft" }),
    lastTypedValue: "",
  },
};
