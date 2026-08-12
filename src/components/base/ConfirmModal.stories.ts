import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ConfirmModal from "./ConfirmModal.vue";
import BaseButtonNew from "./BaseButtonNew.vue";
import InlineConfirmButtons from "./InlineConfirmButtons.vue";
import { useConfirmModal } from "@/composables/useConfirmModal";

const meta: Meta<typeof ConfirmModal> = {
  title: "Base/ConfirmModal",
  component: ConfirmModal,
  tags: ["autodocs"],
  // ConfirmModal is driven by the useConfirmModal composable: confirm()
  // opens the modal and returns a promise resolved by resolveConfirm().
  render: () => ({
    components: { ConfirmModal, BaseButtonNew, InlineConfirmButtons },
    setup() {
      const { confirm, resolveConfirm } = useConfirmModal();
      const ask = () =>
        confirm({
          title: "Object verwijderen",
          confirmLabel: "Verwijder",
          cancelLabel: "Annuleer",
        });
      return { ask, resolveConfirm };
    },
    template: `
      <div class="p-4">
        <BaseButtonNew
          label="Verwijder object"
          button-style="redDefault"
          :force-show-label="true"
          @click="ask"
        />
        <ConfirmModal>
          <div class="p-6 min-w-96">
            <h2 class="subtitle mb-2">Object verwijderen</h2>
            <p class="text-sm text-text-body">
              Weet je zeker dat je dit object wil verwijderen?
            </p>
            <InlineConfirmButtons
              confirm-label="Verwijder"
              cancel-label="Annuleer"
              @confirm="resolveConfirm('confirm')"
              @cancel="resolveConfirm('cancel')"
            />
          </div>
        </ConfirmModal>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<typeof ConfirmModal>;

export const Default: Story = {};
