<template>
  <div class="flex flex-col w-full h-[90vh] p-3 mb-7 overflow-y-scroll">
    <dropzone
      view-style="p-3 h-full overflow-x-hidden mb-4"
      @update-files-in-dropzone="onUpdateFilesInDropzone"
    />
    <div
      v-if="uploadProgressPercentage"
      class="w-full h-[25px] mb-4 bg-neutral-0 rounded-md"
    >
      <div class="relative flex w-full justify-center">
        <p>{{ `Progress: ${Math.round(uploadProgressPercentage)}%` }}</p>
      </div>

      <div :class="`bg-accent-normal upload_bar h-full rounded-md`"></div>
    </div>
    <div class="p-3 bg-neutral-white rounded">
      <div>
        <BaseButtonNew
          :label="t('dropzone.upload')"
          :icon="DamsIcons.PlusCircle"
          button-style="accentAccent"
          :disabled="disabledUploadButton"
          @click="handleUpload"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { DropzoneFile } from "dropzone";
import {
  NotificationType,
  useNotification,
} from "@/components/base/BaseNotification.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import Dropzone from "@/components/base/dropzone/Dropzone.vue";
import useDropzoneHelper from "@/composables/useDropzoneHelper";
import useUpload from "@/composables/useUpload";
import useUploadModalDropzone from "@/composables/useUploadModalDropzone";
import { DamsIcons, TypeModals } from "@/generated-types/queries";
import { ref, watch, inject, onMounted } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useI18n } from "vue-i18n";

const config = inject("config") as any;
const disabledUploadButton = ref<boolean>(true);
const filesInDropzone = ref<DropzoneFile[]>([]);
const { closeModal, getModalInfo } = useBaseModal();
const { createNotificationOverwrite } = useNotification();
const { t } = useI18n();
const {
  uploadGenerator,
  validateFiles,
  toggleUploadStatus,
  setUploadProgressPercentage,
  calculateProgressPercentage,
  uploadProgressPercentage,
} = useUpload();
const { clearDropzoneCounters, clearDropzoneErrorMessages, dropzone } =
  useDropzoneHelper();
const { getEntityIdForLinkedUpload, getUploadType, setUploadStatus } =
  useUploadModalDropzone();

const onUpdateFilesInDropzone = (files: DropzoneFile[]) => {
  filesInDropzone.value = files;
  disabledUploadButton.value = !validateFiles(files, getUploadType());
};

const handleUpload = async () => {
  const totalAmountOfFiles: number = filesInDropzone.value.length;
  let amountUploaded = 0;
  toggleUploadStatus();
  const generator = uploadGenerator(
    filesInDropzone.value,
    getUploadType(),
    config,
    getEntityIdForLinkedUpload()
  );

  for await (const upload of generator) {
    if (!upload?.response.ok) {
      exceptionHandler(await upload?.response.text());
      continue;
    }

    setUploadProgressPercentage(
      calculateProgressPercentage(amountUploaded + 1, totalAmountOfFiles)
    );
    dropzone.value?.removeFile(upload.file);
    onUpdateFilesInDropzone(dropzone.value?.files ?? []);

    if (!dropzone.value?.files.find((file) => file.type !== "text/csv")) {
      createNotificationOverwrite(
        NotificationType.default,
        t("dropzone.successNotification.title"),
        t("dropzone.successNotification.description")
      );
      setUploadStatus("success");
      closeModal(TypeModals.Upload);
    }
    amountUploaded++;
  }
  toggleUploadStatus();
};

const exceptionHandler = (
  errorDescription: string = t("dropzone.errorNotification.description")
) => {
  createNotificationOverwrite(
    NotificationType.error,
    t("dropzone.errorNotification.title"),
    errorDescription,
    15
  );
};

watch(
  () => getModalInfo(TypeModals.Upload).state,
  () => {
    clearDropzoneCounters();
    clearDropzoneErrorMessages();
  }
);
</script>

<style scoped>
.upload_bar {
  width: var(--upload-width-percentage);
}
</style>
