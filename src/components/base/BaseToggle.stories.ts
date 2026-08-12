import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseToggle from "./BaseToggle.vue";
import { DamsIcons } from "@/generated-types/queries";

const meta: Meta<typeof BaseToggle> = {
  title: "Base/BaseToggle",
  component: BaseToggle,
  tags: ["autodocs"],
  argTypes: {
    iconOn: { control: "select", options: Object.values(DamsIcons) },
    iconOff: { control: "select", options: Object.values(DamsIcons) },
  },
  decorators: [() => ({ template: '<div class="w-fit p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof BaseToggle>;

export const Off: Story = {
  args: {
    modelValue: false,
    iconOn: DamsIcons.ListUl,
    iconOff: DamsIcons.ListUl,
  },
};

export const On: Story = {
  args: {
    modelValue: true,
    iconOn: DamsIcons.Apps,
    iconOff: DamsIcons.Apps,
  },
};

export const InToggleGroup: Story = {
  args: {
    modelValue: false,
    iconOn: DamsIcons.Table,
    iconOff: DamsIcons.Table,
    isPartOfToggleGroup: true,
  },
};
