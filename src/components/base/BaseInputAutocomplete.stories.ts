import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseInputAutocomplete from "./BaseInputAutocomplete.vue";
import type { DropdownOption } from "@/generated-types/queries";

const keywordOptions = [
  { label: "impressionisme", value: "kw-impressionisme" },
  { label: "landschap", value: "kw-landschap" },
  { label: "portret", value: "kw-portret" },
  { label: "stilleven", value: "kw-stilleven" },
  { label: "zeezicht", value: "kw-zeezicht" },
] as DropdownOption[];

const meta: Meta<typeof BaseInputAutocomplete> = {
  title: "Base/BaseInputAutocomplete",
  component: BaseInputAutocomplete,
  tags: ["autodocs"],
  argTypes: {
    autocompleteStyle: {
      control: "select",
      options: ["default", "defaultWithBorder", "readOnly", "readOnlyAsPlainText"],
    },
    selectType: { control: "select", options: ["multi", "single"] },
  },
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof BaseInputAutocomplete>;

export const Empty: Story = {
  args: {
    modelValue: [],
    options: keywordOptions,
    autocompleteStyle: "defaultWithBorder",
    placeholder: "Zoek een trefwoord…",
  },
};

export const WithTags: Story = {
  args: {
    modelValue: [keywordOptions[0], keywordOptions[2]],
    options: keywordOptions,
    autocompleteStyle: "defaultWithBorder",
  },
};

export const Loading: Story = {
  args: {
    modelValue: [],
    options: [],
    autocompleteStyle: "defaultWithBorder",
    loading: true,
    placeholder: "Zoek een persoon…",
  },
};

export const ReadOnly: Story = {
  args: {
    modelValue: [keywordOptions[0], keywordOptions[1]],
    options: keywordOptions,
    autocompleteStyle: "readOnly",
    disabled: true,
  },
};
