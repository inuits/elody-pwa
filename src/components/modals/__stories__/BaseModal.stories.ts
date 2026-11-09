import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { nextTick, onMounted } from "vue";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import { ModalStyle, TypeModals } from "@/generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";

const meta: Meta<typeof BaseModal> = {
  // Story id modals-basemodal--default, per MANIFEST.md.
  title: "Modals/BaseModal",
  component: BaseModal,
  parameters: {
    docs: {
      description: {
        component:
          "The base overlay dialog: the system scrim, a 10px radius, the " +
          "modal shadow, and a native <dialog> so the focus trap and Escape " +
          "come from the platform. The title names the dialog and wears the " +
          "panel-shell header; the close cross is a named button, and first " +
          "focus lands on the body's first interactive element, not on that " +
          "cross. Commit sits right, Annuleer ghost-left of it — one commit " +
          "per modal, and the verb is the label, never \"OK\".",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseModal>;

export const Default: Story = {
  render: () => ({
    components: { BaseModal, BaseButton },
    setup() {
      const { openModal, closeModal, getModalInfo } = useBaseModal();
      const open = () => openModal(TypeModals.DynamicForm, ModalStyle.Center);
      const close = () => closeModal(TypeModals.DynamicForm);
      // Open after mount: the dialog only reacts to state changes it can
      // watch, so opening before it exists would show nothing.
      onMounted(async () => {
        if (getModalInfo(TypeModals.DynamicForm).open) close();
        await nextTick();
        open();
      });
      return { TypeModals, open, close };
    },
    template: `
      <div style="min-height:340px">
        <base-button button-style="primary" label="Open modal" style="width:auto" @click="open" />
        <base-modal :modal-type="TypeModals.DynamicForm" title="Kies persoon" @hide-modal="close">
          <div style="padding:18px 22px;display:flex;flex-direction:column;gap:14px;min-width:380px">
            <label style="font-size:var(--text-label);font-weight:700;color:var(--color-text-field-label)">
              Zoek een persoon
              <input class="ds-input ds-input--defaultWithBorder" style="width:100%;font-size:var(--text-value)" placeholder="Zoek…" />
            </label>
            <div style="display:flex;justify-content:flex-end;gap:8px">
              <base-button button-style="ghost" button-size="sm" label="Annuleer" style="width:auto" @click="close" />
              <base-button button-style="commit" button-size="sm" label="Voeg toe" style="width:auto" />
            </div>
          </div>
        </base-modal>
      </div>`,
  }),
};
