<template>
  <dialog
    ref="dialog"
    data-testid="modal-dialog"
    closedby="none"
    :aria-labelledby="title ? titleId : undefined"
    @close="hideModal"
    @cancel="handleCancel"
    :class="[
      {
        'grid grid-rows-[max-content_1fr] base-modal--opened': getModalInfo(
          props.modalType,
        ).open,
        'rounded-overlay':
          currentModalStyle === ModalStyle.Center ||
          currentModalStyle === ModalStyle.CenterWide,
      },
      modalStyle,
      `@container/modal relative shadow-modal backdrop:bg-scrim`,
    ]"
  >
    <div
      v-if="!cancelButtonAvailabe"
      :class="[
        'flex items-center gap-2',
        title
          ? 'justify-between p-(--panel-header-pad) bg-surface-panel-header border-b border-border-panel'
          : 'justify-end p-2',
      ]"
      data-testid="modal-header"
    >
      <h2
        v-if="title"
        :id="titleId"
        data-testid="modal-title"
        class="m-0 text-(length:--text-panel-title) font-bold text-text-panel-header"
      >
        {{ title }}
      </h2>
      <button
        type="button"
        data-testid="modal-close-button"
        :aria-label="$t('actions.labels.close')"
        class="flex cursor-pointer rounded-button p-1 hover:bg-surface-muted"
        @click="hideModal"
      >
        <unicon :name="Unicons.Close.name" :height="iconHeight" />
      </button>
    </div>
    <div data-testid="modal-content">
      <slot />
    </div>
    <BlockingOverlay
      :is-blocking="isBlocking && getModalInfo(props.modalType).open"
    />
  </dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onUnmounted, useId } from "vue";
import { type TypeModals, ModalStyle } from "@/generated-types/queries";
import { Unicons } from "@/types";
import { useBaseModal } from "@/composables/useBaseModal";
import { useModalActions } from "@/composables/useModalActions";
import { useBlockingLoader } from "@/composables/useBlockingLoader";
import BlockingOverlay from "@/components/base/BlockingOverlay.vue";

const { isBlocking } = useBlockingLoader();

const props = withDefaults(
  defineProps<{
    modalType: TypeModals;
    modalHeightStyle?: string;
    iconHeight?: number;
    modalColor?: string;
    cancelButtonAvailabe?: boolean;
    // panel-shell header title; also names the dialog
    title?: string;
  }>(),
  {
    modalHeightStyle: "max-h-[75vh] my-[12.5vh]",
    iconHeight: 18,
    modalColor: "bg-background-light",
    cancelButtonAvailabe: false,
  },
);

const emit = defineEmits(["update:modalState", "hideModal"]);
const titleId = useId();

const { getModalInfo, registerOpenDialog, unregisterOpenDialog } =
  useBaseModal();
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
      registerOpenDialog(dialog.value);
      document.body.classList.add("overflow-hidden");
      document.addEventListener("keydown", handleDocumentEsc, true);
      return;
    }

    document.removeEventListener("keydown", handleDocumentEsc, true);
    unregisterOpenDialog(dialog.value);
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
  unregisterOpenDialog(dialog.value);
});
</script>

<style scoped>
dialog {
  max-width: 100vw;
  border: 0;
}

dialog:focus {
  outline: none;
}
</style>
