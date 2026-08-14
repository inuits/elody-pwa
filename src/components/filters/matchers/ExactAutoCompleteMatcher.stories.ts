import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ExactAutoCompleteMatcher from "./ExactAutoCompleteMatcher.vue";
import type { FilterListItem } from "@/composables/useStateManagement";
import {
  AdvancedFilterTypes,
  AutocompleteSelectionOptions,
} from "@/generated-types/queries";

const selectionFilter = (
  overrides: Record<string, unknown> = {},
): FilterListItem =>
  ({
    isActive: false,
    isDisplayed: true,
    inputFromState: undefined,
    selectedMatcher: undefined,
    advancedFilter: {
      type: AdvancedFilterTypes.Selection,
      key: "asset_type",
      label: "Asset type",
      defaultValue: undefined,
      hidden: false,
      isDisplayedByDefault: true,
      // Predefined options: rendered without hitting GraphQL for facets.
      options: [
        { label: "Image", value: "image" },
        { label: "Video", value: "video" },
        { label: "Audio", value: "audio" },
      ],
      ...overrides,
    },
  }) as unknown as FilterListItem;

const meta: Meta<typeof ExactAutoCompleteMatcher> = {
  title: "Filters/Matchers/ExactAutoCompleteMatcher",
  component: ExactAutoCompleteMatcher,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof ExactAutoCompleteMatcher>;

// The component only declares `filter`/`lastTypedValue`; the extra keys fall
// through as attrs to the inner ExactSelectionFilter, which declares them as
// props (isOpen triggers loading the options).
export const CheckboxList: Story = {
  args: {
    filter: selectionFilter(),
    lastTypedValue: "",
    isOpen: true,
    getNormalizedActiveFilters: () => [],
    refetchFilterOptions: false,
  } as any,
};

export const Autocomplete: Story = {
  args: {
    filter: selectionFilter({
      selectionOption: AutocompleteSelectionOptions.Autocomplete,
    }),
    lastTypedValue: "",
    isOpen: true,
    getNormalizedActiveFilters: () => [],
    refetchFilterOptions: false,
  } as any,
};
