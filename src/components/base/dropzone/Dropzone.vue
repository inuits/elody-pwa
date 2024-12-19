<template>
  <dropzone-view
    v-model="dropzoneView"
    :dropzone-label="dropzoneLabel"
    :isValidation="isValidationFile"
    :file-count="fileCount"
    :style="viewStyle"
    :template-csvs="templateCsvs"
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
    templateCsvs?: string | undefined;
  }>(),
  {
    viewStyle: "",
    isValidationFile: false,
    templateCsvs: undefined,
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
  dropzone.on("maxfilesexceeded", (file: DropzoneFile) => {
    dropzone.removeFile(file);
  });
  dropzone.on("maxfilesreached", () => {
    dropzone.removeEventListeners();
  });

  dropzone.on('dragleave', (event) => {
    event.preventDefault()
    dropzone.element.classList.remove('dropzone-highlight');
  });
  dropzone.on('drop', (event) => {
    event.preventDefault()
    dropzone.element.classList.remove('dropzone-highlight');
  });
  dropzone.on('dragover', (event) => {
    event.preventDefault()
    dropzone.element.classList.add('dropzone-highlight');
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

<style scoped>
.dropzone-highlight {
  border: 3px dashed #007bff;
  background-color: #e7f3ff;
}
</style>
