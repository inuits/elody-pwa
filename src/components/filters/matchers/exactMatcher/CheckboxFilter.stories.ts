import type { Meta, StoryObj } from "@storybook/vue3-vite";
import CheckboxFilter from "./CheckboxFilter.vue";
import type { FilterListItem } from "@/composables/useStateManagement";
import { AdvancedFilterTypes } from "@/generated-types/queries";

const licenseOptions = [
  { label: "Public domain", value: "public_domain" },
  { label: "CC BY 4.0", value: "cc_by" },
  { label: "CC BY-SA 4.0", value: "cc_by_sa" },
  { label: "All rights reserved", value: "copyright" },
];

const makeFilter = (inputFromState?: { value: unknown }): FilterListItem =>
  ({
    isActive: false,
    isDisplayed: true,
    inputFromState,
    selectedMatcher: undefined,
    advancedFilter: {
      type: AdvancedFilterTypes.Selection,
      key: "license",
      label: "License",
      defaultValue: undefined,
      hidden: false,
      isDisplayedByDefault: true,
      options: [],
    },
  }) as unknown as FilterListItem;

const meta: Meta<typeof CheckboxFilter> = {
  title: "Filters/Matchers/CheckboxFilter",
  component: CheckboxFilter,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof CheckboxFilter>;

export const Default: Story = {
  args: {
    filter: makeFilter(),
    options: licenseOptions,
  },
};

export const RestoredFromState: Story = {
  args: {
    filter: makeFilter({ value: ["public_domain", "cc_by"] }),
    options: licenseOptions,
  },
};
