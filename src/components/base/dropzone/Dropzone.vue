<template>
  <dropzone-view
    v-model="dropzoneView"
    :dropzone-helper="dropzoneHelper"
    :dropzone-label="dropzoneLabel"
    :file-count="fileCount"
    :style="viewStyle"
  />
  <dropzone-preview
    v-model="dropzonePreview"
    :isValidationFile="isValidationFile"
  />
</template>

<script lang="ts" setup>
import type { DropzoneFile } from "dropzone";
import DropzonePreview from "@/components/base/dropzone/DropzonePreview.vue";
import DropzoneView from "@/components/base/dropzone/DropzoneView.vue";
import { onMounted, ref, watch } from "vue";
import useUpload from "@/composables/useUpload";

const dropzoneView = ref<HTMLDivElement>();
const dropzonePreview = ref<HTMLDivElement>();
const filesInDropzone = ref<DropzoneFile[]>([]);
const fileCount = ref<number>(0);

const props = withDefaults(
  defineProps<{
    dropzoneHelper: object;
    dropzoneLabel: string;
    viewStyle: string;
    isValidationFile: boolean;
  }>(),
  {
    viewStyle: "",
    isValidationFile: false,
  },
);

const emit = defineEmits<{
  (event: "updateFilesInDropzone", filesInDropzone: DropzoneFile[]): void;
}>();

const { addFileToUpload, removeFileToUpload, files, dryRunCsv } = useUpload();

onMounted(() => {
  const dropzone = props.dropzoneHelper.initDropzone(
    dropzoneView.value!,
    dropzonePreview.value!,
  );

  dropzone.on("addedfile", (file) => {
    addFileToUpload(file);
    if (props.isValidationFile) dryRunCsv();
  });
  dropzone.on("removedfile", (file) =>
    removeFileToUpload(file, props.isValidationFile),
  );

  watch(
    () => files.value.length,
    () => {
      filesInDropzone.value = dropzone.files;
      fileCount.value = dropzone.files.length;
    },
    { immediate: true },
  );
});
</script>
