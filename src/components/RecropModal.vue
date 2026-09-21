<template>
  <dialog
    ref="dialog"
    data-testid="recrop-modal"
    :class="[
      'relative flex-col rounded-lg border-0 p-0 w-[80vw] h-[90vh] m-auto overflow-hidden bg-neutral-white',
      { 'flex base-modal--opened': open },
    ]"
    @cancel.prevent="$emit('close')"
  >
    <div
      class="shrink-0 flex items-center justify-between px-6 py-4 border-b border-neutral-50 bg-neutral-white"
    >
      <h1 class="text-lg font-bold">
        {{ $t("media-viewer.recrop-modal.title") }}
      </h1>
      <button
        type="button"
        data-testid="recrop-modal-close"
        class="cursor-pointer p-1 rounded hover:bg-background-normal"
        @click="$emit('close')"
      >
        <unicon :name="Unicons.Close.name" height="20" />
      </button>
    </div>
    <div class="relative w-full flex-1 min-h-0">
      <IIIFViewer
        v-if="open"
        :image-filename="imageFilename ?? ''"
        :original-filename="originalFilename"
        :mediafile-id="mediafileId"
        :dimensions="dimensions"
        :enable-selection="true"
        :is-recrop-modal="true"
        @select-area="onSelectArea"
        @clear-selection="pendingCoordinates = undefined"
      />
    </div>
    <div
      class="shrink-0 flex justify-end gap-2 px-6 py-4 border-t border-neutral-50 bg-neutral-white"
    >
      <button
        type="button"
        data-testid="recrop-modal-save"
        :disabled="!pendingCoordinates || saving"
        class="px-4 py-2 rounded-md bg-accent-normal text-white hover:bg-accent-dark transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-accent-normal"
        @click="onSave"
      >
        {{ $t("media-viewer.recrop-modal.save") }}
      </button>
    </div>
    <BlockingOverlay :is-blocking="Boolean(saving) && open" />
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { Unicons } from "@/types";
import { useBaseModal } from "@/composables/useBaseModal";
import BlockingOverlay from "@/components/base/BlockingOverlay.vue";
import IIIFViewer from "@/components/IIIFViewer.vue";
import type { CropAreaCoordinates } from "@/composables/useMediafileCrop";

const props = defineProps<{
  open: boolean;
  imageFilename?: string;
  originalFilename?: string;
  mediafileId?: string;
  dimensions?: Record<string, any>;
  saving?: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", coordinates: CropAreaCoordinates, mediafileId: string): void;
}>();

const { registerOpenDialog, unregisterOpenDialog } = useBaseModal();

const dialog = ref<HTMLDialogElement>();
const pendingCoordinates = ref<CropAreaCoordinates>();

const onSelectArea = (coordinates: CropAreaCoordinates) => {
  pendingCoordinates.value = coordinates;
};

const onSave = () => {
  if (!pendingCoordinates.value || !props.mediafileId) return;
  emit("save", pendingCoordinates.value, props.mediafileId);
};

// Lock background scrolling while the dialog is open, matching BaseModal.
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      pendingCoordinates.value = undefined;
      dialog.value?.showModal?.();
      registerOpenDialog(dialog.value);
      document.body.classList.add("overflow-hidden");
      return;
    }
    unregisterOpenDialog(dialog.value);
    dialog.value?.close?.();
    document.body.classList.remove("overflow-hidden");
  },
);

onMounted(() => {
  if (!props.open) return;
  dialog.value?.showModal?.();
  registerOpenDialog(dialog.value);
  document.body.classList.add("overflow-hidden");
});

onBeforeUnmount(() => {
  unregisterOpenDialog(dialog.value);
  dialog.value?.close?.();
  document.body.classList.remove("overflow-hidden");
});
</script>
