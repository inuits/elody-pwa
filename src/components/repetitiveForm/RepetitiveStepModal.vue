<template>
  <dialog
    ref="dialog"
    data-testid="repetitive-step-modal"
    class="rounded-xl border-0 p-0 min-w-[80vw] max-h-[90vh] m-auto"
  >
    <div class="flex justify-end p-2">
      <button
        type="button"
        data-testid="repetitive-step-modal-close"
        class="cursor-pointer"
        @click="emit('close')"
      >
        ✕
      </button>
    </div>
    <div data-testid="repetitive-step-modal-content" class="p-2">
      <slot v-if="open" />
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";

const props = defineProps<{ open: boolean }>();
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
</script>
