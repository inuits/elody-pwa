import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseButton from "./BaseButton.vue";

const meta: Meta<typeof BaseButton> = {
  title: "Base/BaseButton",
  component: BaseButton,
  tags: ["autodocs"],
  decorators: [
    () => ({ template: '<div class="max-w-56 p-4"><story /></div>' }),
  ],
};
export default meta;

type Story = StoryObj<typeof BaseButton>;

export const Default: Story = {
  args: {
    label: "Save",
  },
};

export const WithIcon: Story = {
  args: {
    label: "Download",
    icon: "download-alt",
  },
};

export const Loading: Story = {
  args: {
    label: "Saving…",
    loading: true,
  },
};

export const IconOnly: Story = {
  args: {
    icon: "trash-alt",
  },
};
