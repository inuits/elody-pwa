import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { nextTick, onMounted, onUnmounted, provide, watch } from "vue";
import { useRouter } from "vue-router";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseButton from "@/components/base/BaseButtonNew.vue";
import DynamicForm from "@/components/dynamicForms/DynamicForm.vue";
import {
  ActionType,
  DamsIcons,
  InputFieldTypes,
  ModalStyle,
  TypeModals,
  ValidationRules,
} from "@/generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";
import { useBlockingLoader } from "@/composables/useBlockingLoader";

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
          "panel-shell header; the close cross is a named button and, as the " +
          "first focusable element, takes focus on open.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseModal>;

const createFields = {
  title: {
    __typename: "PanelMetaData",
    key: "title",
    label: "Title",
    inputField: {
      __typename: "InputField",
      type: InputFieldTypes.Text,
      validation: { __typename: "Validation", value: [ValidationRules.Required] },
    },
  },
  description: {
    __typename: "PanelMetaData",
    key: "description",
    label: "Description",
    inputField: { __typename: "InputField", type: InputFieldTypes.Textarea },
  },
  create: {
    __typename: "FormAction",
    label: "Create",
    icon: DamsIcons.Create,
    actionType: ActionType.Submit,
    actionQuery: "CreateEntity",
    creationType: "asset",
  },
};

/** A centred modal with a form inside, as the app opens a create form. */
export const Default: Story = {
  render: () => ({
    components: { BaseModal, BaseButton, DynamicForm },
    setup() {
      provide("config", { features: {} });
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
      return { TypeModals, open, close, router: useRouter(), fields: createFields };
    },
    template: `
      <div style="min-height:340px">
        <base-button button-style="primary" label="Open modal" style="width:auto" @click="open" />
        <base-modal
          :modal-type="TypeModals.DynamicForm"
          :cancel-button-availabe="false"
          modal-color="bg-background-light"
          modal-height-style="max-h-[90vh]"
          title="Create asset"
          @hide-modal="close"
        >
          <div class="flex flex-col w-full pt-4">
            <dynamic-form dynamic-form-query="StoryCreateForm" :router="router" :modal-form-fields="fields" :show-form-title="false" />
          </div>
        </base-modal>
      </div>`,
  }),
};

/** Busy: a long operation blocks the dialog behind a spinner and its message. */
export const Busy: Story = {
  render: () => ({
    components: { BaseModal },
    setup() {
      const { openModal, closeModal, getModalInfo } = useBaseModal();
      const { startBlocking, stopBlocking } = useBlockingLoader();
      onMounted(async () => {
        if (getModalInfo(TypeModals.DynamicForm).open)
          closeModal(TypeModals.DynamicForm);
        await nextTick();
        openModal(TypeModals.DynamicForm, ModalStyle.Center);
        startBlocking("Applying your changes, this may take a while...");
      });
      onUnmounted(stopBlocking);
      return { TypeModals, close: () => closeModal(TypeModals.DynamicForm) };
    },
    template: `
      <div style="min-height:340px">
        <base-modal :modal-type="TypeModals.DynamicForm" title="Edit selected records" @hide-modal="close">
          <div style="padding:18px 22px;min-width:380px;min-height:180px">Fields of the form</div>
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
