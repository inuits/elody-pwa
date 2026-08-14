import type { Meta, StoryObj } from "@storybook/vue3-vite";
import AutocompleteFilter from "./AutocompleteFilter.vue";
import type { FilterListItem } from "@/composables/useStateManagement";
import { AdvancedFilterTypes } from "@/generated-types/queries";

const assetTypeOptions = [
  { label: "Image", value: "image" },
  { label: "Video", value: "video" },
  { label: "Audio", value: "audio" },
  { label: "Document", value: "document" },
];

const makeFilter = (inputFromState?: { value: unknown }): FilterListItem =>
  ({
    isActive: false,
    isDisplayed: true,
    inputFromState,
    selectedMatcher: undefined,
    advancedFilter: {
      type: AdvancedFilterTypes.Selection,
      key: "asset_type",
      label: "Asset type",
      defaultValue: undefined,
      hidden: false,
      isDisplayedByDefault: true,
      options: [],
      minDropdownSearchCharacters: 1,
    },
  }) as unknown as FilterListItem;

const meta: Meta<typeof AutocompleteFilter> = {
  title: "Filters/Matchers/AutocompleteFilter",
  component: AutocompleteFilter,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof AutocompleteFilter>;

export const Default: Story = {
  args: {
    filter: makeFilter(),
    options: assetTypeOptions,
  },
};

export const Loading: Story = {
  args: {
    filter: makeFilter(),
    options: [],
    isLoading: true,
  },
};

// Selection restored from saved route state: matching options are
// pre-selected as tags.
export const RestoredFromState: Story = {
  args: {
    filter: makeFilter({ value: ["image", "video"] }),
    options: assetTypeOptions,
  },
};
