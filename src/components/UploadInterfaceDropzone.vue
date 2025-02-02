<template>
  <div
    :class="['flex flex-col w-full', `${getDropzoneSize(dropzoneSize)}`]"
    :key="uploadFieldType"
  >
    <dropzone
      :dropzone="dropzone"
      :dropzone-label="dropzoneLabel"
      view-style="p-3 h-full overflow-x-hidden mb-4 flex-grow"
      :isValidationFile="dryRun"
      :template-csvs="templateCsvs"
      :extra-mediafile-type="extraMediafileType"
    />
  </div>
</template>

<script lang="ts" setup>
import Dropzone from "@/components/base/dropzone/Dropzone.vue";
import { useDropzone } from "@/composables/useDropzone";
import useUpload from "@/composables/useUpload";
import type { UploadFieldType, UploadFlow } from "@/generated-types/queries";
import { watch } from "vue";

const { initializeUpload } = useUpload();
const dropzone = new useDropzone();

const props = withDefaults(
  defineProps<{
    uploadFlow: UploadFlow;
    dropzoneLabel: string;
    acceptedFileTypes?: string[];
    maxFileSize?: string;
    maxAmountOfFiles?: number;
    dropzoneSize?: "small" | "normal" | "big";
    isLinkedUpload?: boolean;
    dryRun: boolean;
    uploadFieldType: UploadFieldType;
    validation?: string;
    templateCsvs?: string | undefined;
    extraMediafileType?: string;
  }>(),
  {
    dropzoneSize: "normal",
    isLinkedUpload: false,
    dryRun: false,
    templateCsvs: undefined,
    extraMediafileType: undefined,
  },
);

const getDropzoneSize = (size: "small" | "normal" | "big") => {
  const sizeObject = {
    small: "min-h-[15vh]",
    normal: "min-h-[50vh]",
    big: "min-h-[85vh]",
  };
  return sizeObject[size];
};

const setUseUploadVariables = () => {
  initializeUpload({
    uploadType: props.uploadFieldType,
    uploadFlow: props.uploadFlow,
    extraMediafileType: props.extraMediafileType
  });
  if (props.acceptedFileTypes)
    dropzone.dropzoneSettings.value.acceptedFiles = props.acceptedFileTypes
      .map((type: string) => `.${type}`)
      .join(", ");
  if (props.maxFileSize)
    dropzone.dropzoneSettings.value.maxFileSize = props.maxFileSize;
  if (props.maxAmountOfFiles)
    dropzone.dropzoneSettings.value.maxFiles = props.maxAmountOfFiles;
};

watch(
  () => [props.acceptedFileTypes, props.maxFileSize, props.uploadFieldType, props.extraMediafileType],
  () => {
    setUseUploadVariables();
  },
  { immediate: true },
);
</script>

<style scoped></style>
