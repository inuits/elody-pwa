<template>
  <div
    :class="[
      'flex flex-col w-full overflow-y-auto',
      `${getDropzoneSize(dropzoneSize)}`,
    ]"
    :key="uploadFieldType"
  >
    <dropzone
      :dropzone="dropzone"
      :dropzone-label="dropzoneLabel"
      view-style="p-3 h-full overflow-x-hidden mb-4"
      :isValidationFile="dryRun"
    />
  </div>
</template>

<script lang="ts" setup>
import Dropzone from "@/components/base/dropzone/Dropzone.vue";
import { useDropzone } from "@/composables/useDropzone";
import useUpload from "@/composables/useUpload";
import {
  ModalState,
  TypeModals,
  UploadFieldType,
  UploadFlow,
} from "@/generated-types/queries";
import { inject, watch } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useI18n } from "vue-i18n";
import type { FormContext } from "vee-validate";

const config = inject("config") as any;
const { getModalInfo } = useBaseModal();
const { t } = useI18n();
const { resetUpload, initializeUpload, standaloneFileType } = useUpload();
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
  }>(),
  {
    dropzoneSize: "big",
    isLinkedUpload: false,
    dryRun: false,
  }
);

const getDropzoneSize = (size: "small" | "normal" | "big") => {
  const sizeObject = {
    small: "h-[20vh]",
    normal: "h-[60vh]",
    big: "h-[85vh]",
  };
  return sizeObject[size];
};

const setUseUploadVariables = () => {
  initializeUpload({
    uploadType: props.uploadFieldType,
    uploadFlow: props.uploadFlow,
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
  () => [props.acceptedFileTypes, props.maxFileSize, props.uploadFieldType],
  () => {
    setUseUploadVariables();
  },
  { immediate: true }
);

watch(
  () => getModalInfo(TypeModals.DynamicForm).state,
  () => {
    if (getModalInfo(TypeModals.DynamicForm).state === ModalState.Hide) {
      dropzone.resetDropzone();
      resetUpload();
    }
  }
);
</script>

<style scoped></style>
