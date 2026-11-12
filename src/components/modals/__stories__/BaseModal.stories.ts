import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { nextTick, onMounted, watch } from "vue";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseButton from "@/components/base/BaseButtonNew.vue";
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
          "cross. Commit sits right, Cancel ghost-left of it — one commit " +
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
        <base-modal :modal-type="TypeModals.DynamicForm" title="Choose person" @hide-modal="close">
          <div style="padding:18px 22px;display:flex;flex-direction:column;gap:14px;min-width:380px">
            <label style="font-size:var(--text-label);font-weight:700;color:var(--color-text-field-label)">
              Search for a person
              <input class="ds-input ds-input--defaultWithBorder" style="width:100%;font-size:var(--text-value)" placeholder="Search…" />
            </label>
            <div style="display:flex;justify-content:flex-end;gap:8px">
              <base-button button-style="ghost" button-size="sm" label="Cancel" style="width:auto" @click="close" />
              <base-button button-style="commit" button-size="sm" label="Add" style="width:auto" />
            </div>
          </div>
        </base-modal>
      </div>`,
  }),
};

type PlaygroundArgs = InstanceType<typeof BaseModal>["$props"] & {
  open: boolean;
  modalStyle: ModalStyle;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    open: true,
    modalStyle: ModalStyle.Center,
    modalType: TypeModals.DynamicForm,
    title: "Choose person",
    cancelButtonAvailabe: false,
    iconHeight: 18,
    modalColor: "bg-background-light",
    modalHeightStyle: "max-h-[75vh] my-[12.5vh]",
  },
  argTypes: {
    modalStyle: { control: "select", options: Object.values(ModalStyle) },
    modalType: { control: false },
    onHideModal: { action: "hideModal" },
    "onUpdate:modalState": { action: "update:modalState" },
  },
  render: (args) => ({
    components: { BaseModal, BaseButton },
    setup() {
      const { openModal, closeModal, getModalInfo } = useBaseModal();
      const sync = async () => {
        if (getModalInfo(args.modalType).open) closeModal(args.modalType);
        await nextTick();
        if (args.open) openModal(args.modalType, args.modalStyle);
      };
      onMounted(sync);
      watch(() => [args.open, args.modalStyle], sync);
      return { args, close: () => closeModal(args.modalType) };
    },
    template: `
      <div style="min-height:340px">
        <base-modal
          :modal-type="args.modalType"
          :title="args.title"
          :cancel-button-availabe="args.cancelButtonAvailabe"
          :icon-height="args.iconHeight"
          :modal-color="args.modalColor"
          :modal-height-style="args.modalHeightStyle"
          @hide-modal="args.onHideModal?.(); close()"
        >
          <div style="padding:18px 22px;min-width:380px">Modal body</div>
        </base-modal>
      </div>`,
  }),
};
