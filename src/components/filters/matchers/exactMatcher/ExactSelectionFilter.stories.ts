import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ExactSelectionFilter from "./ExactSelectionFilter.vue";
import type { FilterListItem } from "@/composables/useStateManagement";
import {
  AdvancedFilterTypes,
  AutocompleteSelectionOptions,
} from "@/generated-types/queries";

// Options are declared on the advanced filter itself (predefined options),
// so no GraphQL round-trip is needed to render them in isolation.
const makeFilter = (
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
      options: [
        { label: "Image", value: "image" },
        { label: "Video", value: "video" },
        { label: "Audio", value: "audio" },
      ],
      ...overrides,
    },
  }) as unknown as FilterListItem;

const meta: Meta<typeof ExactSelectionFilter> = {
  title: "Filters/Matchers/ExactSelectionFilter",
  component: ExactSelectionFilter,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof ExactSelectionFilter>;

const commonArgs = {
  lastTypedValue: "",
  isOpen: true,
  getNormalizedActiveFilters: () => [],
  refetchFilterOptions: false,
};

// Few options (≤ 10) → checkbox list.
export const CheckboxList: Story = {
  args: {
    ...commonArgs,
    filter: makeFilter(),
  },
};

// Forced autocomplete rendering via the filter's selectionOption.
export const Autocomplete: Story = {
  args: {
    ...commonArgs,
    filter: makeFilter({
      selectionOption: AutocompleteSelectionOptions.Autocomplete,
    }),
  },
};
