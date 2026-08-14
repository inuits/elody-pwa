import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseInputTextNumberDatetime from "./BaseInputTextNumberDatetime.vue";

const meta: Meta<typeof BaseInputTextNumberDatetime> = {
  title: "Base/BaseInputText",
  component: BaseInputTextNumberDatetime,
  tags: ["autodocs"],
  argTypes: {
    inputStyle: {
      control: "select",
      options: ["default", "defaultWithBorder", "defaultWithDarkBackgroundInput"],
    },
    type: {
      control: "select",
      options: [
        "text",
        "number",
        "date",
        "datetime-local",
        "textarea",
        "resizableTextarea",
        "checkbox",
        "color",
      ],
    },
  },
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof BaseInputTextNumberDatetime>;

export const Text: Story = {
  args: {
    modelValue: "Zelfportret met strohoed",
    inputStyle: "defaultWithBorder",
    type: "text",
    placeholder: "Titel van het object",
  },
};

export const Number: Story = {
  args: {
    modelValue: 1889,
    inputStyle: "defaultWithBorder",
    type: "number",
    min: 0,
    max: 2100,
  },
};

export const Textarea: Story = {
  args: {
    modelValue:
      "Olieverf op doek, verworven in 1954 uit de collectie van het Museum voor Schone Kunsten Gent.",
    inputStyle: "defaultWithBorder",
    type: "textarea",
  },
};

export const Disabled: Story = {
  args: {
    modelValue: "OBJ-2024-0157",
    inputStyle: "defaultWithBorder",
    type: "text",
    disabled: true,
  },
};

/** Manifest id `base-baseinputtext--states`: text / number (right-aligned,
 *  no spinners) / textarea, resting + disabled; one focus treatment
 *  everywhere (2px focus ring, 1px offset, on :focus-visible — tab through
 *  the fields to see it). */
export const States: Story = {
  render: () => ({
    components: { BaseInputTextNumberDatetime },
    template: `
      <div class="flex w-96 flex-col gap-3 p-4">
        <BaseInputTextNumberDatetime model-value="Zelfportret met strohoed" input-style="defaultWithBorder" type="text" placeholder="Titel van het object" />
        <BaseInputTextNumberDatetime :model-value="1889" input-style="defaultWithBorder" type="number" :min="0" :max="2100" />
        <BaseInputTextNumberDatetime model-value="Olieverf op doek, verworven in 1954." input-style="defaultWithBorder" type="textarea" />
        <BaseInputTextNumberDatetime model-value="OBJ-2024-0157" input-style="defaultWithBorder" type="text" disabled />
      </div>
    `,
  }),
};
