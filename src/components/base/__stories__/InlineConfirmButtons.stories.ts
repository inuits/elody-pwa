import type { Meta, StoryObj } from "@storybook/vue3-vite";
import InlineConfirmButtons from "../InlineConfirmButtons.vue";

const buttonStyles = ["primary", "commit", "secondary", "ghost", "danger"];
const buttonSizes = ["md", "sm"];

const meta: Meta<typeof InlineConfirmButtons> = {
  title: "Base/InlineConfirmButtons",
  component: InlineConfirmButtons,
  decorators: [
    () => ({
      template: `
        <div style="max-width:480px;padding:0 16px 16px;background:var(--color-surface);border:1px solid var(--color-border-panel);border-radius:var(--radius-overlay)">
          <story />
        </div>`,
    }),
  ],
  argTypes: {
    confirmLabel: { control: "text" },
    cancelLabel: { control: "text" },
    confirmButtonStyle: { control: "select", options: buttonStyles },
    cancelButtonStyle: { control: "select", options: buttonStyles },
    confirmButtonSize: { control: "inline-radio", options: buttonSizes },
    cancelButtonSize: { control: "inline-radio", options: buttonSizes },
    confirmLoading: { control: "boolean" },
    onConfirm: { action: "confirm" },
    onCancel: { action: "cancel" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Confirm and cancel button pair shown inline, for example under " +
          "the question in the delete modal. Confirm can show a loading " +
          "state while the action runs.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof InlineConfirmButtons>;

export const Default: Story = {
  args: {
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
    confirmButtonStyle: "danger",
    cancelButtonStyle: "secondary",
    confirmButtonSize: "sm",
    cancelButtonSize: "sm",
    confirmLoading: false,
  },
};

export const Loading: Story = {
  args: { ...Default.args, confirmLoading: true },
};
