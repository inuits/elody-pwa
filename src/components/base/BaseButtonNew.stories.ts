import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseButtonNew from "./BaseButtonNew.vue";
import { DamsIcons } from "@/generated-types/queries";

const meta: Meta<typeof BaseButtonNew> = {
  title: "Base/BaseButtonNew",
  component: BaseButtonNew,
  tags: ["autodocs"],
  argTypes: {
    icon: { control: "select", options: Object.values(DamsIcons) },
    buttonStyle: {
      control: "select",
      options: ["default", "accentAccent", "accentNormal", "redDefault"],
    },
    buttonSize: { control: "select", options: ["normal", "small", "verySmall"] },
  },
  decorators: [
    () => ({ template: '<div class="max-w-56 p-4"><story /></div>' }),
  ],
};
export default meta;

type Story = StoryObj<typeof BaseButtonNew>;

export const Default: Story = {
  args: {
    label: "Save",
    icon: DamsIcons.Check,
    buttonStyle: "accentAccent",
    forceShowLabel: true,
  },
};

export const Loading: Story = {
  args: {
    label: "Saving…",
    loading: true,
    buttonStyle: "accentAccent",
    forceShowLabel: true,
  },
};

export const Destructive: Story = {
  args: {
    label: "Delete",
    icon: DamsIcons.Trash,
    buttonStyle: "redDefault",
    forceShowLabel: true,
  },
};

export const Disabled: Story = {
  args: {
    label: "Save",
    disabled: true,
    forceShowLabel: true,
  },
};
