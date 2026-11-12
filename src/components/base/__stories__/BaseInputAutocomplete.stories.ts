import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref, watch } from "vue";
import BaseInputAutocomplete from "../BaseInputAutocomplete.vue";

const options = [
  { label: "adventure", value: "adventure" },
  { label: "detective", value: "detective" },
  { label: "fantasy", value: "fantasy" },
  { label: "horror", value: "horror" },
  { label: "historical fiction", value: "historical" },
  { label: "fairy tale", value: "fairy-tale" },
];

const meta: Meta<typeof BaseInputAutocomplete> = {
  // Story id base-baseinputautocomplete--tags, embedded by
  // autocomplete-tag-input.md.
  title: "Base/BaseInputAutocomplete",
  component: BaseInputAutocomplete,
  parameters: {
    docs: {
      description: {
        component:
          "Tag input over @vueform/multiselect: picked values render as " +
          "removable chips in the field, typing filters the option list. " +
          "Selection is staged — committing stays with the row or form " +
          "Save. The create-option variant offers the typed value as a " +
          "new tag when the config allows it.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseInputAutocomplete>;

export const Tags: Story = {
  render: () => ({
    components: { BaseInputAutocomplete },
    setup: () => ({
      value: ref([
        { label: "adventure", value: "adventure" },
        { label: "fantasy", value: "fantasy" },
      ]),
      options,
    }),
    template: `
      <div style="max-width:420px">
        <p style="font-size:var(--text-label);font-weight:700;color:var(--color-text-field-label)">Genres</p>
        <base-input-autocomplete
          v-model="value"
          :options="options"
          autocomplete-style="defaultWithBorder"
          placeholder="Search for a genre…"
        />
      </div>`,
  }),
};

/** Creating a tag from the typed value, for fields whose config allows it. */
export const CreateOption: Story = {
  render: () => ({
    components: { BaseInputAutocomplete },
    setup: () => ({
      value: ref([{ label: "adventure", value: "adventure" }]),
      options,
      createOptionConfig: {
        canCreateOption: true,
        createPromptTranslationKey: "dropdown.create-option",
      },
    }),
    template: `
      <div style="max-width:420px">
        <base-input-autocomplete
          v-model="value"
          :options="options"
          autocomplete-style="defaultWithBorder"
          :create-option-config="createOptionConfig"
          placeholder="Type to add…"
        />
      </div>`,
  }),
};

export const Playground: Story = {
  args: {
    modelValue: [{ label: "adventure", value: "adventure" }],
    options,
    autocompleteStyle: "defaultWithBorder",
    selectType: "multi",
    placeholder: "Search for a genre…",
    disabled: false,
    loading: false,
    relation: false,
    tagsAreLinks: false,
    displayInputForTag: false,
    noOptionsText: "No options",
    createOptionConfig: { canCreateOption: false },
  },
  argTypes: {
    autocompleteStyle: {
      control: "select",
      options: ["default", "defaultWithBorder", "readOnly", "readOnlyAsPlainText"],
    },
    selectType: { control: "inline-radio", options: ["multi", "single"] },
    "onUpdate:modelValue": { action: "update:modelValue" },
    onAddOption: { action: "addOption" },
    onHandleTagClick: { action: "handleTagClick" },
    onSearchChange: { action: "searchChange" },
  },
  render: (args) => ({
    components: { BaseInputAutocomplete },
    setup() {
      const value = ref(args.modelValue);
      watch(
        () => args.modelValue,
        (v) => (value.value = v),
      );
      return { args, value };
    },
    template: `
      <div style="max-width:420px;padding-bottom:260px">
        <base-input-autocomplete v-bind="args" v-model="value" />
      </div>`,
  }),
};
