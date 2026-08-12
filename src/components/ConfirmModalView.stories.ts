import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ConfirmModalView from "./ConfirmModalView.vue";
import { useConfirmModal } from "@/composables/useConfirmModal";

// ConfirmModalView renders the pending confirmation from useConfirmModal
// (normally shown inside the ConfirmModal host); the stories trigger a
// confirm() so there is something to render.
const meta: Meta<typeof ConfirmModalView> = {
  title: "Components/ConfirmModalView",
  component: ConfirmModalView,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof ConfirmModalView>;

export const DeleteConfirmation: Story = {
  render: () => ({
    components: { ConfirmModalView },
    setup() {
      const { confirm } = useConfirmModal();
      confirm({
        title: "Delete asset?",
        message:
          "Are you sure you want to delete asset 'Portret van een dame (1902-C-14)'? This cannot be undone.",
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
      });
    },
    template:
      '<div class="w-[32rem] h-64 border rounded-lg bg-background-light"><ConfirmModalView /></div>',
  }),
};

export const DiscardEditWithSecondaryAction: Story = {
  render: () => ({
    components: { ConfirmModalView },
    setup() {
      const { confirm } = useConfirmModal();
      confirm({
        title: "Unsaved changes",
        message:
          "You have unsaved metadata changes for 'Stilleven met bloemen'. Discard them or save first?",
        confirmLabel: "Discard",
        cancelLabel: "Keep editing",
        secondaryLabel: "Save and continue",
        secondaryButtonStyle: "accentAccent",
      });
    },
    template:
      '<div class="w-[32rem] h-64 border rounded-lg bg-background-light"><ConfirmModalView /></div>',
  }),
};
