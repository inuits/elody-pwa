<template>
  <div
    :class="[
      'flex flex-col w-full p-3 pb-2 overflow-y-scroll',
      `${getDropzoneSize(dropzoneSize)}`,
    ]"
    :key="uploadFieldType"
  >
    <dropzone
      :dropzone-helper="dropzoneHelper"
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
} from "@/generated-types/queries";
import { inject, watch, computed } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useI18n } from "vue-i18n";

const config = inject("config") as any;
const { closeModal, getModalInfo } = useBaseModal();
const { t } = useI18n();
const { upload, files, uploadType, resetUpload, isCsvRequired } = useUpload();
const dropzoneHelper = new useDropzone();
const isRequired = computed(() =>
  props.validation ? props.validation.includes("required") : false,
);

const props = withDefaults(
  defineProps<{
    dropzoneLabel: string;
    acceptedFileTypes?: string[];
    maxFileSize?: string;
    maxAmountOfFiles?: number;
    dropzoneSize?: "small" | "normal" | "big";
    isLinkedUpload?: boolean;
    dryRun: boolean;
    uploadFieldType: UploadFieldType;
    validation?: string;
    uploadMultiple: boolean;
  }>(),
  {
    dropzoneSize: "big",
    isLinkedUpload: false,
    dryRun: false,
    uploadMultiple: false,
  },
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
  uploadType.value = props.uploadFieldType as UploadFieldType;
  dropzoneHelper.dropzoneSettings.uploadMultiple = props.uploadMultiple;
  if (props.dryRun && isRequired.value) isCsvRequired.value = true;
  if (props.acceptedFileTypes)
    dropzoneHelper.dropzoneSettings.value.acceptedFiles =
      props.acceptedFileTypes.map((type: string) => `.${type}`).join(", ");
  if (props.maxFileSize)
    dropzoneHelper.dropzoneSettings.value.maxFileSize = props.maxFileSize;
  if (props.maxAmountOfFiles)
    dropzoneHelper.dropzoneSettings.value.maxFiles = props.maxAmountOfFiles;
};

watch(
  () => [
    props.uploadType,
    props.acceptedFileTypes,
    props.maxFileSize,
    props.uploadFieldType,
  ],
  () => {
    setUseUploadVariables();
  },
  { immediate: true },
);

watch(
  () => getModalInfo(TypeModals.DynamicForm).state,
  () => {
    if (getModalInfo(TypeModals.DynamicForm).state === ModalState.Hide) {
      dropzoneHelper.resetDropzone();
      resetUpload();
    }
  },
);
</script>

<style scoped></style>
