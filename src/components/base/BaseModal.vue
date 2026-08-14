<template>
  <dialog
    ref="dialog"
    data-testid="modal-dialog"
    closedby="none"
    :aria-label="modalAriaLabel"
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
      `@container/modal relative`,
    ]"
  >
    <div
      v-if="!cancelButtonAvailabe"
      class="flex justify-end p-2"
      data-testid="modal-header"
    >
      <button
        type="button"
        data-testid="modal-close-button"
        :aria-label="closeLabel"
        class="flex cursor-pointer items-center rounded border-none bg-transparent p-0.5 hover:bg-accent-wash focus-visible:outline-2 focus-visible:outline-accent-accent"
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
import { ref, computed, watch, onUnmounted } from "vue";
import { type TypeModals, ModalStyle } from "@/generated-types/queries";
import { Unicons } from "@/types";
import { useBaseModal } from "@/composables/useBaseModal";
import { useI18n } from "vue-i18n";
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
  }>(),
  {
    modalHeightStyle: "max-h-[75vh] my-[12.5vh]",
    iconHeight: 18,
    modalColor: "bg-background-light",
    cancelButtonAvailabe: false,
  },
);

const emit = defineEmits(["update:modalState", "hideModal"]);

const { t, te } = useI18n();
const modalAriaLabel = computed<string>(() => {
  const info = getModalInfo(props.modalType) as any;
  const label = info?.formQuery || props.modalType;
  return te(String(label)) ? t(String(label)) : String(label);
});
const closeLabel = computed<string>(() =>
  te("preview-component.close") ? t("preview-component.close") : "Close",
);

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
  // A busy modal (blocking overlay up) never closes on Escape.
  if (isBlocking.value) return;
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
  if (isBlocking.value) return;
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
  box-shadow: var(--shadow-modal);
}

dialog::backdrop {
  background-color: var(--color-scrim);
}

dialog:focus {
  outline: none;
}
</style>
