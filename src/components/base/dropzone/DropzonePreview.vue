<template>
  <div class="hidden">
    <div
      ref="dropzonePreview"
      class="dz-file-preview border border-neutral-light rounded-md w-full mi-h-28 items-right mb-2 hover:bg-blue-default10 relative"
    >
      <div class="flex flex-row p-3">
        <div
          class="flex justify-center items-center bg-neutral-light rounded-lg w-10 h-8 mt-1 mr-2"
        >
          <unicon
            :name="Unicons.Image.name"
            class="fill-text-body"
            height="16"
          />
        </div>

        <div class="dz-filename text-blue text-sm mt-2 ml-6 pr-6 w-full">
          <span
            class="inline-block w-full break-words text-text-body"
            data-dz-name
          ></span>
        </div>
        <upload-file-preview-progress :isValidationFile="isValidationFile" />
        <div>
          <a
            data-dz-remove
            class="cursor-pointer flex justify-center items-center bg-neutral-light rounded-lg w-10 h-8 mt-1 mr-2"
          >
            <unicon :name="Unicons.Trash.name" height="14" />
          </a>
        </div>
      </div>
      <div
        class="error-message-container hidden bg-red-light text-red-default px-5 py-1"
      ></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { Unicons } from "@/types";
import UploadFilePreviewProgress from "@/components/dynamicForms/UploadFilePreviewProgress.vue";

const dropzonePreview = ref<HTMLDivElement>();

defineProps<{
  modelValue: HTMLDivElement | undefined;
  isValidationFile: boolean;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: HTMLDivElement | undefined): void;
}>();

onMounted(async () => {
  emit("update:modelValue", dropzonePreview.value);
});
</script>

<style></style>
