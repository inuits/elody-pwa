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
        'rounded-xl':
          currentModalStyle === ModalStyle.Center ||
          currentModalStyle === ModalStyle.CenterWide,
      },
      modalStyle,
      `@container/modal relative`,
    ]"
  >
    <div
      v-if="!cancelButtonAvailabe"
      class="base-modal__header"
      :class="{ 'base-modal__header--titled': title }"
      data-testid="modal-header"
    >
      <h2 v-if="title" :id="titleId" class="base-modal__title">
        {{ title }}
      </h2>
      <button
        type="button"
        class="base-modal__close"
        data-testid="modal-close-button"
        :aria-label="t('modal.close')"
        @click="hideModal"
      >
        <unicon :name="Unicons.Close.name" :height="iconHeight" />
      </button>
    </div>
    <div ref="contentRef" data-testid="modal-content">
      <slot />
    </div>
    <BlockingOverlay
      :is-blocking="isBlocking && getModalInfo(props.modalType).open"
    />
  </dialog>
</template>

<script lang="ts" setup>
import { nextTick, ref, computed, useId, watch, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
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
    /** Names the dialog (modal.md: title = the task, "Kies persoon"). */
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

const { t } = useI18n();
const { getModalInfo } = useBaseModal();
const dialog = ref<HTMLDialogElement>();
const contentRef = ref<HTMLElement>();
const titleId = `base-modal-title-${useId()}`;

/**
 * showModal() focuses the first focusable element, which is the close cross
 * in the header; the docs put first focus on the first interactive element of
 * the body instead (modal.md).
 */
const focusFirstInteractive = async () => {
  await nextTick();
  contentRef.value
    ?.querySelector<HTMLElement>(
      'a[href], button:not(:disabled), input:not(:disabled), select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    ?.focus();
};
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
      focusFirstInteractive();
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
  border-radius: var(--radius-overlay);
  box-shadow: var(--shadow-modal);
}

dialog::backdrop {
  /* The one scrim in the system; the mint accent at 0.3 is retired. */
  background-color: var(--color-scrim);
}

dialog:focus {
  outline: none;
}

.base-modal__header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-ds-6);
  padding: var(--spacing-ds-3);
}

/* With a title the header wears the panel shell, like every other panel. */
.base-modal__header--titled {
  justify-content: space-between;
  padding: var(--spacing-ds-8) var(--spacing-ds-11);
  background-color: var(--color-surface-panel-header);
  border-radius: var(--radius-overlay) var(--radius-overlay) 0 0;
}

.base-modal__title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--text-body);
  font-weight: 700;
  color: var(--color-text-panel-header);
}

.base-modal__close {
  display: inline-flex;
  flex: none;
  padding: var(--spacing-ds-1);
  border-radius: var(--radius-input);
  cursor: pointer;
}

.base-modal__header--titled .base-modal__close {
  color: var(--color-text-panel-header);
}

.base-modal__close:hover {
  background-color: var(--color-surface-editable-hover);
  color: var(--color-text-body);
}

.base-modal__close:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}
</style>
