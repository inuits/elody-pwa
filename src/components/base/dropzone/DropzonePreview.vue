<template>
  <div class="hidden">
    <div
      data-dz-file-preview
      ref="dropzonePreview"
      class="dz-file-preview border border-border-subtle rounded-md w-full mb-2 hover:bg-surface-row-hover relative"
    >
      <div class="flex flex-row p-3">
        <div
          class="flex justify-center items-center bg-chip-neutral-bg rounded-lg w-10 h-8 mt-1 mr-2"
        >
          <unicon
            :name="Unicons.Image.name"
            class="fill-text-body"
            height="16"
          />
        </div>

        <div class="dz-filename text-table mt-2 ml-6 pr-6 w-full">
          <span class="break-words text-text-body" data-dz-name></span>
          <span
            class="ml-2 text-text-light [&_strong]:font-normal [&_strong]:text-current"
            data-dz-size
          ></span>
        </div>
        <upload-file-preview-progress
          :isValidationFile="isValidationFile"
          :hidePrepareStep="hidePrepareStep"
        />
        <div>
          <button
            type="button"
            data-dz-remove
            :aria-label="$t('upload-fields.remove-file')"
            :title="$t('upload-fields.remove-file')"
            class="cursor-pointer flex justify-center items-center bg-chip-neutral-bg rounded-lg w-10 h-8 mt-1 mr-2"
          >
            <unicon :name="Unicons.Trash.name" height="14" />
          </button>
        </div>
      </div>
      <div
        class="warning-message-container hidden bg-warning-bg text-text-body text-table px-5 py-1"
      ></div>
      <div
        role="alert"
        class="error-message-container hidden bg-danger-bg text-danger-ink text-table px-5 py-1"
      ></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { Unicons } from "@/types";
import UploadFilePreviewProgress from "@/components/dynamicForms/UploadFilePreviewProgress.vue";

const dropzonePreview = ref<HTMLDivElement>();

withDefaults(
  defineProps<{
    modelValue: HTMLDivElement | undefined;
    isValidationFile: boolean;
    hidePrepareStep?: boolean;
  }>(),
  {
    hidePrepareStep: false,
  },
);

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: HTMLDivElement | undefined): void;
}>();

onMounted(async () => {
  emit("update:modelValue", dropzonePreview.value);
});
</script>

<style></style>
