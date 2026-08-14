import type { Meta, StoryObj } from "@storybook/vue3-vite";
import CustomIcon from "./CustomIcon.vue";

const meta: Meta<typeof CustomIcon> = {
  title: "Components/CustomIcon",
  component: CustomIcon,
  tags: ["autodocs"],
  argTypes: {
    icon: { control: "select", options: ["Anpr", "Iot", "Police", "Iiif"] },
  },
  decorators: [() => ({ template: '<div class="p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof CustomIcon>;

export const Iiif: Story = {
  args: { icon: "Iiif", size: 48 },
};

export const Iot: Story = {
  args: { icon: "Iot", size: 48, color: "accent-accent" },
};

export const Anpr: Story = {
  args: { icon: "Anpr", size: 48 },
};

export const Police: Story = {
  args: { icon: "Police", size: 48 },
};
