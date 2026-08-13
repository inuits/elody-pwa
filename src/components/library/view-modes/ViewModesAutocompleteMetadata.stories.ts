import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ViewModesAutocompleteMetadata from "./ViewModesAutocompleteMetadata.vue";

const metadataDropdownOptions = [
  { label: "Painting", value: "painting" },
  { label: "Sculpture", value: "sculpture" },
  { label: "Drawing", value: "drawing" },
  { label: "Photograph", value: "photograph" },
];

const meta: Meta<typeof ViewModesAutocompleteMetadata> = {
  title: "Library/ViewModes/ViewModesAutocompleteMetadata",
  component: ViewModesAutocompleteMetadata,
  tags: ["autodocs"],
  argTypes: {
    selectType: { control: "select", options: ["multi", "single"] },
    mode: { control: "select", options: ["view", "edit"] },
  },
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
  args: {
    metadataDropdownOptions,
    formId: "storybook-form",
  },
};
export default meta;

type Story = StoryObj<typeof ViewModesAutocompleteMetadata>;

export const EditMultiSelect: Story = {
  args: {
    modelValue: ["painting", "drawing"],
    mode: "edit",
    selectType: "multi",
  },
};

export const EditSingleSelect: Story = {
  args: {
    modelValue: "sculpture",
    mode: "edit",
    selectType: "single",
  },
};

export const ViewWithValues: Story = {
  args: {
    modelValue: ["painting"],
    mode: "view",
    disabled: true,
  },
};

export const ViewEmpty: Story = {
  args: {
    modelValue: [],
    mode: "view",
  },
};
