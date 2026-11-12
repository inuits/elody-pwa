import type { Meta, StoryObj } from "@storybook/vue3-vite";
import InlineConfirmButtons from "../InlineConfirmButtons.vue";

const buttonStyles = ["primary", "commit", "secondary", "ghost", "danger"];
const buttonSizes = ["md", "sm"];

const meta: Meta<typeof InlineConfirmButtons> = {
  title: "Base/InlineConfirmButtons",
  component: InlineConfirmButtons,
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
          "Cancel and confirm button pair shown inline, for example under " +
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
    confirmButtonSize: "md",
    cancelButtonSize: "md",
    confirmLoading: false,
  },
};

export const Loading: Story = {
  args: { ...Default.args, confirmLoading: true },
};
