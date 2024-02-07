<template>
  <div
    :class="[
      'flex flex-col w-full p-3 pb-2 overflow-y-scroll',
      `${dropzoneSize === 'small' ? 'h-[25vh]' : dropzoneSize === 'normal' ? 'h-[60vh]' : 'h-[90vh]'}`,
    ]"
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
import { useDropzoneHelper } from "@/composables/useDropzoneHelper";
import useUpload from "@/composables/useUpload";
import { TypeModals, UploadFieldType } from "@/generated-types/queries";
import { watch, inject } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useI18n } from "vue-i18n";

const config = inject("config") as any;
const { closeModal, getModalInfo } = useBaseModal();
const { t } = useI18n();
const { dryRunCsv, upload, files, uploadType, resetUpload, dryRunStatus } =
  useUpload();
let dropzoneHelper = new useDropzoneHelper();

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
  }>(),
  {
    dropzoneSize: "big",
    isLinkedUpload: false,
    dryRun: false,
  },
);

const setUseUploadVariables = () => {
  uploadType.value = props.uploadFieldType;
  if (props.acceptedFileTypes)
    dropzoneHelper.dropzoneSettings.value.acceptedFiles =
      props.acceptedFileTypes.map((type: string) => `.${type}`).join(", ");
  if (props.maxFileSize)
    dropzoneHelper.dropzoneSettings.value.maxFileSize = props.maxFileSize;
  if (props.maxAmountOfFiles)
    dropzoneHelper.dropzoneSettings.value.maxFiles = props.maxAmountOfFiles;
};

watch(
  () => [props.acceptedFileTypes, props.maxFileSize],
  () => {
    setUseUploadVariables();
  },
  { immediate: true },
);

watch(
  () => files.value.length,
  () => {
    if (dryRunStatus.value !== "correctly-verified" && props.dryRun)
      dryRunCsv();
  },
);

watch(
  () => getModalInfo(TypeModals.DynamicForm).state,
  () => {
    dropzoneHelper.resetDropzone();
    resetUpload();
  },
);
</script>

<style scoped>
.upload_bar {
  width: var(--upload-width-percentage);
}
</style>
