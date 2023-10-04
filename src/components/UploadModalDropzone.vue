<template>
  <div class="flex flex-col w-full h-[93vh] p-3">
    <dropzone-new
      view-style="p-3 h-full overflow-x-hidden mb-4"
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
            :disable="!createEntity"
            dropdown-style="defaultWithBorder"
          />
        </div>
      </div>

      <div>
        <BaseButtonNew
          v-if="!modifyMetadata"
          :label="t('dropzone.upload')"
          :icon="DamsIcons.PlusCircle"
          button-style="accentAccent"
          :disabled="isDisabledUploadButton"
          @click="uploadFiles"
        />
        <BaseButtonNew
          v-if="modifyMetadata"
          :label="t('dropzone.modifyMetadata')"
          :icon="DamsIcons.EditAlt"
          button-style="accentAccent"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { DropzoneFile } from "dropzone";
import {
  DamsIcons,
  TypeModals,
  type DropdownOption,
  type DropzoneEntityToCreate,
} from "@/generated-types/queries";
import {
  NotificationType,
  useNotification,
} from "@/components/base/BaseNotification.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseCheckDropdown from "@/components/base/BaseCheckDropdown.vue";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import DropzoneNew from "@/components/base/dropzone/DropzoneNew.vue";
import useDropzoneHelper from "@/composables/useDropzoneHelper";
import useUploadModalDropzone from "@/composables/useUploadModalDropzone";
import { ref, watch, inject } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  entityToCreate: DropzoneEntityToCreate;
}>();

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
const { t } = useI18n();
const { createNotificationOverwrite } = useNotification();
const { setUploadStatus } = useUploadModalDropzone();
const { closeModal, getModalInfo } = useBaseModal();
const config = inject("config") as any;

const createEntity = ref<boolean>(true);
const entityToCreateOptions = ref<DropdownOption[]>(
  props.entityToCreate.options
);
const selectedEntityToCreate = ref<DropdownOption>(
  entityToCreateOptions.value[0]
);
const initialImportMethods: DropdownOption[] = [];
const importMethods = ref<DropdownOption[]>(initialImportMethods);
const selectedImportMethod = ref<DropdownOption>();

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
      return {
        icon: DamsIcons.NoIcon,
        label: file.name,
        value: file.name,
      };
    }),
    ...initialImportMethods,
  ];

  const mostRecentlyAddedCsvFileName = csvFiles[csvFiles.length - 1]?.name;
  if (mostRecentlyAddedCsvFileName)
    selectedImportMethod.value = {
      icon: DamsIcons.NoIcon,
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
    (file) => file.name === selectedImportMethod.value?.value
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
            "http://storage-api:5000/",
            config.api.storageApiUrl
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
              setUploadStatus("success");
              closeModal(TypeModals.Upload);
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
  () => getModalInfo(TypeModals.Upload).state,
  () => {
    createEntity.value = true;
    selectedImportMethod.value = undefined;
    clearDropzoneCounters();
    clearDropzoneErrorMessages();
  }
);
</script>
