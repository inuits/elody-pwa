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
  // "Components/…" so the manifest id
  // `components-advanceddropdown--multi-search` resolves.
  title: "Components/AdvancedDropdown",
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

const languageOptions = [
  "Nederlands",
  "Engels",
  "Frans",
  "Duits",
  "Spaans",
  "Italiaans",
  "Portugees",
  "Zweeds",
  "Noors",
  "Deens",
  "Fins",
  "Pools",
].map((label, index) => ({
  label,
  value: `lang_${index}`,
  icon: DamsIcons.NoIcon,
})) as DropdownOption[];

/** Manifest id `components-advanceddropdown--multi-search`: multi-select with
 *  checks and, because there are >10 options, the search-in-list input.
 *  Loading state shows option-shaped skeletons (see the `loading` arg). */
export const MultiSearch: Story = {
  args: {
    modelValue: ["lang_0", "lang_2"],
    options: languageOptions,
    label: "Talen",
    multiple: true,
    styleType: "defaultWithLightBorder",
  },
};

/** Async options: option-shaped skeletons, never per-option spinners. */
export const LoadingSkeletons: Story = {
  args: {
    modelValue: undefined,
    options: [],
    label: "Talen",
    loading: true,
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
