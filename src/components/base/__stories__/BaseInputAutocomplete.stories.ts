import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import BaseInputAutocomplete from "../BaseInputAutocomplete.vue";

const options = [
  { label: "avontuur", value: "avontuur" },
  { label: "detective", value: "detective" },
  { label: "fantasy", value: "fantasy" },
  { label: "griezel", value: "griezel" },
  { label: "historisch verhaal", value: "historisch" },
  { label: "sprookje", value: "sprookje" },
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
          "Bewaar. The create-option variant offers the typed value as a " +
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
        { label: "avontuur", value: "avontuur" },
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
          placeholder="Zoek een genre…"
        />
      </div>`,
  }),
};

/** Creating a tag from the typed value, for fields whose config allows it. */
export const CreateOption: Story = {
  render: () => ({
    components: { BaseInputAutocomplete },
    setup: () => ({
      value: ref([{ label: "avontuur", value: "avontuur" }]),
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
          placeholder="Typ om toe te voegen…"
        />
      </div>`,
  }),
};
