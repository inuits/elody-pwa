<template>
  <dialog
    ref="dialog"
    data-testid="repetitive-step-modal"
    :class="[
      'rounded-lg border-0 p-0 w-[80vw] max-h-[90vh] m-auto bg-neutral-white',
      // teleport target for tooltips/dropdowns while a modal is open
      // (see BaseTooltip/AdvancedDropdown '.base-modal--opened')
      { 'base-modal--opened': open },
    ]"
    @cancel.prevent="emit('close')"
  >
    <div
      class="flex items-center justify-between px-6 py-4 border-b border-neutral-50 sticky top-0 bg-neutral-white z-guided-flow-header"
    >
      <h1 data-testid="repetitive-step-modal-title" class="text-lg font-bold">
        {{ title }}
      </h1>
      <button
        type="button"
        data-testid="repetitive-step-modal-close"
        class="cursor-pointer p-1 rounded hover:bg-background-normal"
        @click="emit('close')"
      >
        <unicon :name="Unicons.Close.name" height="20" />
      </button>
    </div>
    <div data-testid="repetitive-step-modal-content" class="p-6">
      <slot v-if="open" />
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { Unicons } from "@/types";

const props = defineProps<{ open: boolean; title?: string }>();
const emit = defineEmits<{ (e: "close"): void }>();

const dialog = ref<HTMLDialogElement>();

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
