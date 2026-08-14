import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ContainsMatcher from "./ContainsMatcher.vue";
import type { FilterListItem } from "@/composables/useStateManagement";
import { AdvancedFilterTypes } from "@/generated-types/queries";

const titleFilter = (inputFromState?: { value: unknown }): FilterListItem =>
  ({
    isActive: false,
    isDisplayed: true,
    inputFromState,
    selectedMatcher: undefined,
    advancedFilter: {
      type: AdvancedFilterTypes.Text,
      key: "title",
      label: "Title",
      defaultValue: undefined,
      hidden: false,
      isDisplayedByDefault: true,
      options: [],
    },
  }) as unknown as FilterListItem;

const meta: Meta<typeof ContainsMatcher> = {
  title: "Filters/Matchers/ContainsMatcher",
  component: ContainsMatcher,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof ContainsMatcher>;

export const Empty: Story = {
  args: {
    filter: titleFilter(),
    lastTypedValue: "",
  },
};

// Value restored from saved route state (e.g. user navigates back to a list).
export const RestoredFromState: Story = {
  args: {
    filter: titleFilter({ value: "sunset over the harbour" }),
    lastTypedValue: "",
  },
};

// Value the user typed before switching matchers is carried over.
export const WithLastTypedValue: Story = {
  args: {
    filter: titleFilter(),
    lastTypedValue: "lighthouse",
  },
};
