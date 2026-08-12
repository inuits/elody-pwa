import type { Meta, StoryObj } from "@storybook/vue3-vite";
import AdvancedDropdown from "./AdvancedDropdown.vue";
import { DamsIcons, type DropdownOption } from "@/generated-types/queries";

const sortOptions = [
  { label: "Titel (A-Z)", value: "title_asc", icon: DamsIcons.SortUp },
  { label: "Titel (Z-A)", value: "title_desc", icon: DamsIcons.SortDown },
  { label: "Datum toegevoegd", value: "date_created", icon: DamsIcons.NoIcon },
  { label: "Laatst gewijzigd", value: "date_updated", icon: DamsIcons.NoIcon },
] as DropdownOption[];

const meta: Meta<typeof AdvancedDropdown> = {
  title: "Base/AdvancedDropdown",
  component: AdvancedDropdown,
  tags: ["autodocs"],
  argTypes: {
    styleType: {
      control: "select",
      options: ["default", "defaultWithBorder", "defaultWithLightBorder"],
    },
    labelPosition: { control: "select", options: ["above", "inline"] },
  },
  // Storybook freezes args; vue3-select-component mutates its option
  // objects, so hand the component a fresh copy of the options.
  render: (args) => ({
    components: { AdvancedDropdown },
    setup: () => ({
      args,
      options: args.options.map((option) => ({ ...option })),
    }),
    template:
      '<div class="w-96 p-4"><AdvancedDropdown v-bind="args" :options="options" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof AdvancedDropdown>;

export const Default: Story = {
  args: {
    modelValue: undefined,
    options: sortOptions,
    label: "Sorteer op",
    styleType: "defaultWithBorder",
  },
};

export const WithSelection: Story = {
  args: {
    modelValue: "title_asc",
    options: sortOptions,
    label: "Sorteer op",
    styleType: "defaultWithBorder",
  },
};

export const Multiple: Story = {
  args: {
    modelValue: ["title_asc", "date_created"],
    options: sortOptions,
    label: "Kolommen",
    multiple: true,
    styleType: "defaultWithLightBorder",
  },
};

export const Disabled: Story = {
  args: {
    modelValue: "title_asc",
    options: sortOptions,
    label: "Sorteer op",
    disable: true,
    styleType: "defaultWithBorder",
  },
};
