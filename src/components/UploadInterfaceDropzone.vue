<template>
  <div class="flex flex-col">
    <div class="flex flex-col">
      <div
        v-if="infoLabelUrl"
        class="flex items-center bg-info-bg text-text-body text-table px-4 py-3 mb-2 rounded-card"
      >
        <unicon
          :name="Unicons.InfoCircle.name"
          height="16"
          class="mr-2 shrink-0"
        />
        <p>
          <a :href="infoLabelUrl" target="_blank" class="underline">
            {{ $t("upload-fields.link-to-documentation") }}
          </a>
        </p>
      </div>
      <div
        v-if="templateCsvs"
        class="flex items-center bg-info-bg text-text-body text-table px-4 py-3 mb-4 rounded-card"
        @click.stop
      >
        <unicon
          :name="Unicons.InfoCircle.name"
          height="16"
          class="mr-2 shrink-0"
        />
        <button
          type="button"
          class="underline pr-4 cursor-pointer"
          @click="downloadCsvTemplate(`/${selectedItem}`)"
        >
          {{ $t("upload-fields.csv-template-link") }}
        </button>
        <AdvancedDropdown
          v-model:model-value="selectedItem"
          :options="mapModelValueToDropdownOptions(templateCsvs)"
          :clearable="false"
        />
      </div>
    </div>

    <div
      :class="['flex flex-col w-full', `${getDropzoneSize(dropzoneSize)}`]"
      :key="uploadFieldType"
    >
      <Dropzone
        :dropzone="dropzone"
        :dropzone-label="dropzoneLabel"
        view-style="p-3 h-full overflow-x-hidden mb-4 grow"
        :isValidationFile="dryRun"
        :hidePrepareStep="uploadFieldType === UploadFieldType.ReorderEntities"
        :extra-mediafile-type="extraMediafileType"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Dropzone from "@/components/base/dropzone/Dropzone.vue";
import { useDropzone } from "@/composables/useDropzone";
import useUpload from "@/composables/upload/useUpload";
import { UploadFieldType } from "@/generated-types/queries";
import type { DropdownOption, UploadFlow } from "@/generated-types/queries";
import Papa from "papaparse";
import { ref, watch, inject } from "vue";
import { downloadCsv, mapModelValueToDropdownOptions } from "@/helpers";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";
import { Unicons } from "@/types";

enum csvHeaders {
  file_identifier = "file_identifier",
  filename = "filename",
  file_source = "file_source",
}

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
    templateCsvs?: string[] | undefined;
    infoLabelUrl?: string | undefined;
    extraMediafileType?: string;
    shouldIncludeTypeInUrl?: boolean;
    typeToIncludeInUrl?: string;
  }>(),
  {
    dropzoneSize: "normal",
    isLinkedUpload: false,
    dryRun: false,
    templateCsvs: undefined,
    infoLabelUrl: undefined,
    extraMediafileType: undefined,
    shouldIncludeTypeInUrl: false,
    typeToIncludeInUrl: undefined,
  },
);
const config: any = inject("config");
const { initializeUpload, files } = useUpload(config);

const dropzone = new useDropzone();
const selectedItem = ref<DropdownOption | undefined>(
  props.templateCsvs
    ? mapModelValueToDropdownOptions(props.templateCsvs[0])[0]?.value
    : undefined,
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
    extraMediafileType: props.extraMediafileType,
    shouldIncludeTypeInUrl: props.shouldIncludeTypeInUrl,
    typeToIncludeInUrl: props.typeToIncludeInUrl,
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

const downloadCsvTemplate = async (filePath: any) => {
  const response = await fetch(filePath);
  const text = await response.text();
  const results = Papa.parse(text, {
    header: true,
    dynamicTyping: true,
  });

  if (files.value.length > 0) {
    const header = results.meta.fields as string[];
    const filenameIndex = header.indexOf(csvHeaders.filename);
    const columnToAddFilename =
      filenameIndex === -1 ? csvHeaders.file_identifier : csvHeaders.filename;
    const type = results.data[0]["type"];

    files.value.forEach((file: any, index: number) => {
      results.data.push({});
      results.data[index]["type"] = type;
      results.data[index][columnToAddFilename] = file.name;
      if (columnToAddFilename === csvHeaders.file_identifier)
        results.data[index][csvHeaders.file_source] = "File";
    });
  }
  const csv = Papa.unparse(results.data);
  downloadCsv(filePath, csv);
};

watch(
  () => [
    props.acceptedFileTypes,
    props.maxFileSize,
    props.uploadFieldType,
    props.extraMediafileType,
    props.shouldIncludeTypeInUrl,
    props.typeToIncludeInUrl,
  ],
  () => {
    setUseUploadVariables();
  },
  { immediate: true },
);
</script>

<style scoped></style>
