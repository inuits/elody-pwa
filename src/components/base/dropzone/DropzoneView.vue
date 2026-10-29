<template>
  <div
    ref="dropzoneView"
    :class="[
      'bg-background-light w-full h-full border-2 border-dashed border-border-dashed rounded-card',
      { 'flex justify-center items-center': fileCount === 0 },
      style,
    ]"
  >
    <!-- Dropzone.js opens the file dialog for clicks inside .dz-message, so a
         real button here gives keyboard access; it stays above the file list -->
    <div
      class="dz-message"
      :class="fileCount === 0 ? 'text-center' : 'mb-2'"
      data-dz-message
    >
      <button
        type="button"
        class="text-text-body underline-offset-2 hover:underline cursor-pointer"
      >
        {{ $t(dropzoneLabel) }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

const dropzoneView = ref<HTMLDivElement>();

withDefaults(
  defineProps<{
    modelValue: HTMLDivElement | undefined;
    dropzoneLabel: string;
    isValidation: boolean;
    fileCount: number;
    style: string;
  }>(),
  {
    style: "",
    isValidation: false,
  },
);

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: HTMLDivElement | undefined): void;
}>();

onMounted(() => {
  emit("update:modelValue", dropzoneView.value);
});
</script>

<style></style>
