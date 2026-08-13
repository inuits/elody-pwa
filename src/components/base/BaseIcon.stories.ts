import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseIcon from "./BaseIcon.vue";
import { Unicons } from "@/types";

const iconNames = Object.values(Unicons).map((icon: any) => icon.name);

const meta: Meta<typeof BaseIcon> = {
  title: "Base/BaseIcon",
  component: BaseIcon,
  tags: ["autodocs"],
  argTypes: {
    name: { control: "select", options: iconNames },
  },
  decorators: [
    () => ({ template: '<div class="w-12 h-12 p-2"><story /></div>' }),
  ],
};
export default meta;

type Story = StoryObj<typeof BaseIcon>;

export const Default: Story = {
  args: {
    name: Unicons.Check.name,
  },
};

export const Download: Story = {
  args: {
    name: Unicons.Download.name,
  },
};

export const Trash: Story = {
  args: {
    name: Unicons.Trash.name,
  },
};
