<template>
  <dropzone-view
    v-model="dropzoneView"
    :dropzone-label="dropzoneLabel"
    :isValidation="isValidationFile"
    :file-count="fileCount"
    :style="viewStyle"
  />
  <dropzone-preview
    v-model="dropzonePreview"
    :isValidationFile="isValidationFile"
  />
</template>

<script lang="ts" setup>
import DropzonePreview from "@/components/base/dropzone/DropzonePreview.vue";
import DropzoneView from "@/components/base/dropzone/DropzoneView.vue";
import { onMounted, ref, watch } from "vue";
import useUpload from "@/composables/useUpload";
import { useDynamicForm } from "@/components/dynamicForms/useDynamicForm";
import type { DropzoneFile } from "dropzone";

const dropzoneView = ref<HTMLDivElement>();
const dropzonePreview = ref<HTMLDivElement>();
const filesInDropzone = ref<DropzoneFile[]>([]);
const fileCount = ref<number>(0);

const props = withDefaults(
  defineProps<{
    dropzone: object;
    dropzoneLabel: string;
    viewStyle: string;
    isValidationFile: boolean;
  }>(),
  {
    viewStyle: "",
    isValidationFile: false,
  }
);

const emit = defineEmits<{
  (event: "updateFilesInDropzone", filesInDropzone: DropzoneFile[]): void;
}>();
const { dynamicFormUploadFields } = useDynamicForm();

const { addFileToUpload, removeFileToUpload, files, uploadStatus } =
  useUpload();

onMounted(() => {
  const dropzone = props.dropzone.initDropzone(
    dropzoneView.value!,
    dropzonePreview.value!
  );

  dropzone.on("addedfile", (file: DropzoneFile) => {
    addFileToUpload(file, props.isValidationFile);
  });
  dropzone.on("removedfile", (file: DropzoneFile) => {
    removeFileToUpload(file, props.isValidationFile);
    dropzone.setupEventListeners();
  });
  dropzone.on("maxfilesreached", () => {
    dropzone.removeEventListeners();
  });

  dynamicFormUploadFields.value.push(dropzone);

  watch(
    () => files.value.length,
    () => {
      filesInDropzone.value = dropzone.files;
      fileCount.value = dropzone.files.length;
    },
    { immediate: true }
  );

  watch(
    () => uploadStatus.value,
    () => {
      if (uploadStatus.value !== "upload-finished") {
        dropzone.setupEventListeners();
        return;
      }
      dropzone.removeEventListeners();
    },
    { immediate: true }
  );
});
</script>
