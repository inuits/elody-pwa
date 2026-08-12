import type { Meta, StoryObj } from "@storybook/vue3-vite";
import InlineConfirmButtons from "./InlineConfirmButtons.vue";

const meta: Meta<typeof InlineConfirmButtons> = {
  title: "Base/InlineConfirmButtons",
  component: InlineConfirmButtons,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof InlineConfirmButtons>;

export const Destructive: Story = {
  args: {
    confirmLabel: "Verwijder",
    cancelLabel: "Annuleer",
  },
};

export const AccentConfirm: Story = {
  args: {
    confirmLabel: "Opslaan",
    cancelLabel: "Annuleer",
    confirmButtonStyle: "accentAccent",
  },
};

export const Loading: Story = {
  args: {
    confirmLabel: "Verwijderen…",
    cancelLabel: "Annuleer",
    confirmLoading: true,
  },
};
