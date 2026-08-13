import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseDatePicker from "./BaseDatePicker.vue";

const meta: Meta<typeof BaseDatePicker> = {
  title: "Base/BaseDatePicker",
  component: BaseDatePicker,
  tags: ["autodocs"],
  argTypes: {
    type: { control: "select", options: ["date", "datetime", "datetime-local"] },
  },
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof BaseDatePicker>;

export const DateOnly: Story = {
  args: {
    type: "date",
    modelValue: "2024-05-17",
  },
};

export const DateTime: Story = {
  args: {
    type: "datetime",
    modelValue: "2024-05-17T10:30:00+00:00",
  },
};

export const Empty: Story = {
  args: {
    type: "date",
    modelValue: undefined,
    placeholder: "Datum van verwerving",
  },
};

export const Disabled: Story = {
  args: {
    type: "date",
    modelValue: "2024-05-17",
    disabled: true,
  },
};
