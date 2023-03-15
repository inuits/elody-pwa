<template>
  <div class="flex flex-col w-full h-full p-3">
    <dropzone-new
      view-style="p-3 h-full mb-4"
      @update-files-in-dropzone="onUpdateFilesInDropzone"
    />

    <div class="p-3 bg-neutral-white rounded">
      <div v-if="!modifyMetadata" class="flex mb-3">
        <BaseCheckDropdown
          v-model="selectedEntityToCreate"
          :options="entityToCreateOptions"
          :check-option="createEntity"
          label="creëer"
          @check-option="handleCheckOptionEvent"
        />

        <div class="w-2/3">
          <BaseDropdownNew
            v-model="selectedImportMethod"
            :options="importMethods"
            :disabled="!createEntity"
          />
        </div>
      </div>

      <div>
        <BaseButtonNew
          v-if="!modifyMetadata"
          class="w-full"
          :label="$t('dropzone.upload')"
          icon="PlusCircle"
          button-style="blue"
          :disabled="isDisabledUploadButton"
          @click="uploadFiles"
        />
        <BaseButtonNew
          v-if="modifyMetadata"
          class="w-full"
          :label="$t('dropzone.modifyMetadata')"
          icon="EditAlt"
          button-style="blue"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { DropzoneEntityToCreate } from "../generated-types/queries";
import type { DropzoneFile } from "dropzone";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseCheckDropdown from "@/components/base/BaseCheckDropdown.vue";
import BaseDropdownNew, {
  type DropdownOption,
} from "@/components/base/BaseDropdownNew.vue";
import DropzoneNew from "@/components/base/dropzone/DropzoneNew.vue";
import useDropzoneHelper from "@/composables/useDropzoneHelper";
import useUploadModal, { uploadModalState } from "@/composables/useUploadModal";
import {
  NotificationType,
  useNotification,
} from "@/components/base/BaseNotification.vue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

type UploadRequestData = {
  body: object | Array<object>;
  uri: string;
};

const {
  dropzone,
  isUploading,
  setSelectedMediafiles,
  increaseSuccessCounter,
  clearDropzoneCounters,
  clearDropzoneErrorMessages,
} = useDropzoneHelper();
const { closeUploadModal } = useUploadModal();
const { createNotificationOverwrite } = useNotification();
const { t } = useI18n();

const props = defineProps<{
  entityToCreate: DropzoneEntityToCreate;
}>();

const createEntity = ref<boolean>(false);
const entityToCreateOptions = ref<DropdownOption[]>(
  props.entityToCreate.options
);
const selectedEntityToCreate = ref<DropdownOption>(
  entityToCreateOptions.value[0]
);
const initialImportMethods: DropdownOption[] = [];
const importMethods = ref<DropdownOption[]>(initialImportMethods);
const selectedImportMethod = ref<DropdownOption>(initialImportMethods[0]);

const filesInDropzone = ref<DropzoneFile[]>([]);
const isDisabledUploadButton = ref<boolean>(true);
const modifyMetadata = ref<boolean>(false);

const onUpdateFilesInDropzone = (files: DropzoneFile[]) => {
  filesInDropzone.value = files;
  isDisabledUploadButton.value = files.length === 0;

  const csvFiles = files.filter((file) => file.type === "text/csv");
  modifyMetadata.value = csvFiles.length === 1 && files.length === 1;
  importMethods.value = [
    ...csvFiles.map((file) => {
      return { label: file.name, value: file.name };
    }),
    ...initialImportMethods,
  ];

  const mostRecentlyAddedCsvFileName = csvFiles[csvFiles.length - 1]?.name;
  selectedImportMethod.value = {
    label: mostRecentlyAddedCsvFileName,
    value: mostRecentlyAddedCsvFileName,
  };
};

const uploadFiles = async () => {
  isUploading.value = true;
  setSelectedMediafiles(filesInDropzone.value);
  const uploadRequestData = await getUploadRequestData();
  await callUploadEndpoint(uploadRequestData);
};

const getUploadRequestData = async (): Promise<UploadRequestData> => {
  const csvToBeParsedToEntityBodies = filesInDropzone.value.find(
    (file) => file.name === selectedImportMethod.value.value
  );

  let blob: Blob | undefined;
  if (csvToBeParsedToEntityBodies)
    blob = new Blob([csvToBeParsedToEntityBodies], {
      type: csvToBeParsedToEntityBodies.type,
    });

  const response = await fetch(
    `/api/upload/request-data?filetype=${
      csvToBeParsedToEntityBodies ? csvToBeParsedToEntityBodies.type : ""
    }&entityToCreate=${
      createEntity.value ? selectedEntityToCreate.value.value : ""
    }`,
    {
      headers: { "Content-Type": "text/csv" },
      method: "POST",
      body: blob,
    }
  );

  return JSON.parse(await response.text());
};

const linkUploadRequestDataWithFile = (
  uploadRequestData: UploadRequestData,
  file: DropzoneFile
): UploadRequestData | undefined => {
  if (!Array.isArray(uploadRequestData.body)) return uploadRequestData;
  if (uploadRequestData.body.length === 0) return undefined;

  const body = uploadRequestData.body.find((entity) =>
    entity.metadata.find(
      (metadata: any) =>
        metadata.key === "title" && metadata.value === file.name.split(".")[0]
    )
  );
  if (!body) return undefined;

  return { body, uri: uploadRequestData.uri };
};

const callUploadEndpoint = async (uploadRequestData: UploadRequestData) => {
  const filesToBeUploaded = filesInDropzone.value.filter(
    (file) => file.type !== "text/csv"
  );
  for (const file of filesToBeUploaded) {
    const body = linkUploadRequestDataWithFile(uploadRequestData, file);
    if (!body) {
      if (createEntity.value)
        exceptionHandler(
          `File ${file.name} could not be linked to an entity from import method.`
        );
      else exceptionHandler();
      continue;
    }

    await fetch(`/api/upload?filename=${file.name}`, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify(body),
    })
      .then((response: Response) => {
        if (!response.ok) throw response;
        return response.json();
      })
      .then(async (json: { url: string }) => {
        const formUploadData = new FormData();
        formUploadData.append("file", file);

        await fetch(
          json.url.replace(
            "storage-api:5000/",
            "storage-api.digipolis-dams.localhost:8100"
          ),
          {
            method: "POST",
            body: formUploadData,
          }
        )
          .then((response: Response) => {
            if (!response.ok) throw response;

            increaseSuccessCounter();
            dropzone.value?.removeFile(file);
            onUpdateFilesInDropzone(dropzone.value?.files ?? []);

            if (
              !dropzone.value?.files.find((file) => file.type !== "text/csv")
            ) {
              createNotificationOverwrite(
                NotificationType.default,
                t("dropzone.successNotification.title"),
                t("dropzone.successNotification.description")
              );
              closeUploadModal();
            }
          })
          .catch(async (response: Response) =>
            exceptionHandler(await response.text())
          );
      });
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

const handleCheckOptionEvent = () => (createEntity.value = !createEntity.value);
watch(
  () => uploadModalState.value.state,
  () => {
    createEntity.value = false;
    clearDropzoneCounters();
    clearDropzoneErrorMessages();
  }
);
</script>
