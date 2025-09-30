<template>
  <dialog
    ref="dialog"
    data-testid="modal-dialog"
    closedby="none"
    @close="hideModal"
    @cancel="handleCancel"
    :class="[
      {
        'grid grid-rows-[max-content_1fr] base-modal--opened': getModalInfo(
          props.modalType,
        ).open,
        'rounded-xl':
          currentModalStyle === ModalStyle.Center ||
          currentModalStyle === ModalStyle.CenterWide,
      },
      modalStyle,
      `@container/modal`,
    ]"
  >
    <div
      v-if="!cancelButtonAvailabe"
      class="flex justify-end p-2"
      data-testid="modal-header"
    >
      <unicon
        :name="Unicons.Close.name"
        :height="iconHeight"
        class="cursor-pointer"
        data-testid="modal-close-button"
        @click="hideModal"
      />
    </div>
    <div data-testid="modal-content">
      <slot />
    </div>
  </dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onUnmounted } from "vue";
import { type TypeModals, ModalStyle } from "@/generated-types/queries";
import { Unicons } from "@/types";
import { useBaseModal } from "@/composables/useBaseModal";
import { useModalActions } from "@/composables/useModalActions";

const props = withDefaults(
  defineProps<{
    modalType: TypeModals;
    modalHeightStyle?: string;
    iconHeight?: number;
    modalColor?: string;
    cancelButtonAvailabe?: boolean;
  }>(),
  {
    modalHeightStyle: "max-h-[75vh] my-[12.5vh]",
    iconHeight: 18,
    modalColor: "bg-background-light",
    cancelButtonAvailabe: false,
  },
);

const emit = defineEmits(["update:modalState", "hideModal"]);

const { getModalInfo } = useBaseModal();
const dialog = ref<HTMLDialogElement>();
const currentModalStyle = computed(
  () => getModalInfo(props.modalType).modalStyle,
);
const modalStyle = computed(() => modalStyles[currentModalStyle.value]);

const handleDocumentEsc = (event: KeyboardEvent) => {
  if (event.key !== "Escape") return;
  if (!getModalInfo(props.modalType).open) return;

  event.preventDefault();
  event.stopPropagation();
  handleCancel(event);
};

const modalStyles: { [key: string]: string } = {
  right: `min-w-[40vw] w-fit h-screen max-h-screen mr-0 my-0`,
  rightWide: `min-w-[80vw] w-fit h-screen max-h-screen mr-0 my-0`,
  center: `min-w-[50vw] w-fit m-auto ${props.modalHeightStyle}`,
  centerWide: `min-w-[80vw] w-fit m-auto max-h-[90vh]`,
  left: "",
};

watch(
  () => getModalInfo(props.modalType).open,
  (isModalOpen: boolean) => {
    if (isModalOpen) {
      dialog.value?.showModal();
      document.body.classList.add("overflow-hidden");
      document.addEventListener("keydown", handleDocumentEsc, true);
      return;
    }

    document.removeEventListener("keydown", handleDocumentEsc, true);
    dialog.value?.close();
    document.body.classList.remove("overflow-hidden");
  },
);

const handleCancel = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  hideModal();
};

const hideModal = () => {
  if (!getModalInfo(props.modalType).open) {
    return;
  }

  emit("update:modalState", "hide");
  emit("hideModal", "hide");
  useModalActions().resetAllProperties();
};

onUnmounted(() => {
  document.removeEventListener("keydown", handleDocumentEsc, true);
});
</script>

<style scoped>
dialog {
  max-width: 100vw;
  border: 0;
}

dialog::backdrop {
  background-color: var(--color-accent-normal);
  opacity: 0.3;
}

dialog:focus {
  outline: none;
}
</style>
