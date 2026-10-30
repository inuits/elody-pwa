<template>
  <dialog
    ref="dialog"
    data-testid="repetitive-step-modal"
    :class="[
      'relative rounded-overlay border-0 p-0 w-[80vw] max-h-[90vh] m-auto bg-surface shadow-modal backdrop:bg-scrim',
      // teleport target for tooltips/dropdowns while a modal is open
      // (see BaseTooltip/AdvancedDropdown '.base-modal--opened')
      { 'base-modal--opened': open },
    ]"
    :aria-labelledby="titleId"
    @cancel.prevent="emit('close')"
  >
    <div
      class="flex items-center justify-between gap-2 p-(--panel-header-pad) border-b border-border-panel sticky top-0 bg-surface-panel-header z-guided-flow-header"
    >
      <!-- modal.md: the same header band as BaseModal -->
      <h2
        :id="titleId"
        data-testid="repetitive-step-modal-title"
        class="m-0 text-(length:--text-panel-title) font-bold text-text-panel-header"
      >
        {{ title }}
      </h2>
      <button
        type="button"
        data-testid="repetitive-step-modal-close"
        :aria-label="t('actions.labels.close')"
        class="flex cursor-pointer rounded-button p-1 hover:bg-surface-muted"
        @click="emit('close')"
      >
        <unicon :name="Unicons.Close.name" height="18" />
      </button>
    </div>
    <div data-testid="repetitive-step-modal-content" class="p-6">
      <slot v-if="open" />
    </div>
    <BlockingOverlay :is-blocking="isBlocking && open" />
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, useId } from "vue";
import { Unicons } from "@/types";
import BlockingOverlay from "@/components/base/BlockingOverlay.vue";
import { useBlockingLoader } from "@/composables/useBlockingLoader";
import { useBaseModal } from "@/composables/useBaseModal";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const titleId = useId();

const { isBlocking } = useBlockingLoader();
const { registerOpenDialog, unregisterOpenDialog } = useBaseModal();

const props = defineProps<{ open: boolean; title?: string }>();
const emit = defineEmits<{ (e: "close"): void }>();

const dialog = ref<HTMLDialogElement>();

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      dialog.value?.showModal?.();
      registerOpenDialog(dialog.value);
      return;
    }
    unregisterOpenDialog(dialog.value);
    dialog.value?.close?.();
  },
);

onMounted(() => {
  if (!props.open) return;
  dialog.value?.showModal?.();
  registerOpenDialog(dialog.value);
});

onBeforeUnmount(() => {
  // leave the top layer cleanly before the element is removed
  unregisterOpenDialog(dialog.value);
  dialog.value?.close?.();
});
</script>
