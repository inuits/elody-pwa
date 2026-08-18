<template>
  <dialog
    ref="dialog"
    data-testid="repetitive-step-modal"
    :aria-labelledby="title ? titleId : undefined"
    :class="[
      'repetitive-step-modal relative border-0 p-0 w-[80vw] max-h-[90vh] m-auto',
      // teleport target for tooltips/dropdowns while a modal is open
      // (see BaseTooltip/AdvancedDropdown '.base-modal--opened')
      { 'base-modal--opened': open },
    ]"
    @cancel.prevent="emit('close')"
  >
    <!-- The flow's dialog wears the same panel-shell header as every other
         modal (guided-flow.md; modal.md). -->
    <div
      class="repetitive-step-modal__header sticky top-0 z-guided-flow-header"
    >
      <h1
        :id="titleId"
        data-testid="repetitive-step-modal-title"
        class="repetitive-step-modal__title"
      >
        {{ title }}
      </h1>
      <button
        type="button"
        data-testid="repetitive-step-modal-close"
        class="repetitive-step-modal__close"
        :aria-label="$t('modal.close')"
        @click="emit('close')"
      >
        <unicon :name="Unicons.Close.name" height="20" />
      </button>
    </div>
    <div data-testid="repetitive-step-modal-content" class="p-6">
      <slot v-if="open" />
    </div>
    <BlockingOverlay :is-blocking="isBlocking && open" />
  </dialog>
</template>

<script setup lang="ts">
import { ref, useId, watch, onMounted, onBeforeUnmount } from "vue";
import { Unicons } from "@/types";
import BlockingOverlay from "@/components/base/BlockingOverlay.vue";
import { useBlockingLoader } from "@/composables/useBlockingLoader";

const { isBlocking } = useBlockingLoader();

const props = defineProps<{ open: boolean; title?: string }>();
const emit = defineEmits<{ (e: "close"): void }>();

const dialog = ref<HTMLDialogElement>();
const titleId = `repetitive-step-modal-${useId()}`;

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) dialog.value?.showModal?.();
    else dialog.value?.close?.();
  },
);

onMounted(() => {
  if (props.open) dialog.value?.showModal?.();
});

onBeforeUnmount(() => {
  // leave the top layer cleanly before the element is removed
  dialog.value?.close?.();
});
</script>

<style scoped>
.repetitive-step-modal {
  border-radius: var(--radius-overlay);
  box-shadow: var(--shadow-modal);
  background-color: var(--color-surface);
}

.repetitive-step-modal::backdrop {
  background-color: var(--color-scrim);
}

.repetitive-step-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-ds-6);
  padding: var(--spacing-ds-8) var(--spacing-ds-11);
  background-color: var(--color-surface-panel-header);
  border-radius: var(--radius-overlay) var(--radius-overlay) 0 0;
}

.repetitive-step-modal__title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--text-body);
  font-weight: 700;
  color: var(--color-text-panel-header);
}

.repetitive-step-modal__close {
  display: inline-flex;
  flex: none;
  padding: var(--spacing-ds-1);
  border-radius: var(--radius-input);
  color: var(--color-text-panel-header);
  cursor: pointer;
}

.repetitive-step-modal__close:hover {
  background-color: var(--color-surface-editable-hover);
  color: var(--color-text-body);
}

.repetitive-step-modal__close:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}
</style>
