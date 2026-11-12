import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { nextTick, onMounted, onUnmounted, watch } from "vue";
import ConfirmModal from "../ConfirmModal.vue";
import ConfirmModalView from "@/components/ConfirmModalView.vue";
import { useConfirmModal } from "@/composables/useConfirmModal";

type ConfirmArgs = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  secondaryLabel: string;
  confirmButtonStyle: string;
  onChoice?: (choice: string) => void;
};

const buttonStyles = ["primary", "commit", "secondary", "ghost", "danger"];

const meta: Meta<ConfirmArgs> = {
  title: "Base/ConfirmModal",
  component: ConfirmModal,
  argTypes: {
    confirmButtonStyle: { control: "select", options: buttonStyles },
    onChoice: { action: "choice" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "The app-wide confirm dialog. Code calls useConfirmModal().confirm() " +
          "and awaits the choice (confirm, secondary or cancel); closing the " +
          "dialog counts as cancel.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<ConfirmArgs>;

export const Default: Story = {
  args: {
    open: true,
    title: "Delete this asset?",
    message: "The asset and its relations are removed. This cannot be undone.",
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
    secondaryLabel: "",
    confirmButtonStyle: "danger",
  },
  render: (args) => ({
    components: { ConfirmModal, ConfirmModalView },
    setup() {
      const { confirm, pendingConfirm, resolveConfirm } = useConfirmModal();
      const ask = async () => {
        const choice = await confirm({
          title: args.title,
          message: args.message,
          confirmLabel: args.confirmLabel,
          cancelLabel: args.cancelLabel,
          secondaryLabel: args.secondaryLabel || undefined,
          confirmButtonStyle: args.confirmButtonStyle as never,
        });
        args.onChoice?.(choice);
      };
      onMounted(async () => {
        await nextTick();
        if (args.open) ask();
        watch(
          () => [args.open, args.title, args.message, args.confirmLabel, args.cancelLabel, args.secondaryLabel, args.confirmButtonStyle],
          () => (args.open ? ask() : resolveConfirm("cancel")),
        );
      });
      onUnmounted(() => pendingConfirm.value && resolveConfirm("cancel"));
    },
    template: `<div style="min-height:360px"><confirm-modal><confirm-modal-view /></confirm-modal></div>`,
  }),
};
