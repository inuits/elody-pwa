<template>
  <div class="flex flex-col w-full h-full p-3 mb-7">
    <dropzone
      view-style="p-3 h-full overflow-x-hidden mb-4"
      @update-files-in-dropzone="onUpdateFilesInDropzone"
    />
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
import { ref, watch, inject } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useI18n } from "vue-i18n";

const config = inject("config") as any;
const disabledUploadButton = ref<boolean>(true);
const filesInDropzone = ref<DropzoneFile[]>([]);
const { closeModal, getModalInfo } = useBaseModal();
const { createNotificationOverwrite } = useNotification();
const { t } = useI18n();
const { uploadGenerator, validateFiles } = useUpload();
const { clearDropzoneCounters, clearDropzoneErrorMessages, dropzone } =
  useDropzoneHelper();
const { getEntityIdForLinkedUpload, getUploadType, setUploadStatus } =
  useUploadModalDropzone();

const onUpdateFilesInDropzone = (files: DropzoneFile[]) => {
  filesInDropzone.value = files;
  disabledUploadButton.value = !validateFiles(files, getUploadType());
};

const handleUpload = async () => {
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
  }
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
