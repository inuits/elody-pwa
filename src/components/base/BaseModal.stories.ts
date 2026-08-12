import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseModal from "./BaseModal.vue";
import BaseButtonNew from "./BaseButtonNew.vue";
import { ModalStyle, TypeModals } from "@/generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";

const meta: Meta<typeof BaseModal> = {
  title: "Base/BaseModal",
  component: BaseModal,
  tags: ["autodocs"],
  // Modal visibility lives in the useBaseModal store, keyed by modalType.
  // The story opens/closes that store entry with a button.
  render: (args, { name }) => ({
    components: { BaseModal, BaseButtonNew },
    setup() {
      const { openModal, closeModal } = useBaseModal();
      const modalStyle =
        name === "RightSlideIn" ? ModalStyle.Right : ModalStyle.Center;
      const open = () => openModal(TypeModals.Confirm, modalStyle);
      const close = () => closeModal(TypeModals.Confirm);
      return { args, open, close };
    },
    template: `
      <div class="p-4">
        <BaseButtonNew
          label="Open modal"
          button-style="accentAccent"
          :force-show-label="true"
          @click="open"
        />
        <BaseModal v-bind="args" @hide-modal="close">
          <div class="p-6">
            <h2 class="subtitle mb-2">Object verwijderen</h2>
            <p class="text-sm text-text-body">
              Weet je zeker dat je "Zelfportret met strohoed" (OBJ-2024-0157)
              wil verwijderen? Deze actie kan niet ongedaan gemaakt worden.
            </p>
          </div>
        </BaseModal>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<typeof BaseModal>;

export const Center: Story = {
  args: {
    modalType: TypeModals.Confirm,
  },
};

export const RightSlideIn: Story = {
  args: {
    modalType: TypeModals.Confirm,
  },
};
