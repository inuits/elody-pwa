<template>
  <div class="flex flex-col">

    <div class="flex flex-col">
      <div
        v-if="infoLabelUrl"
        class="flex items-center text-neutral-white bg-accent-normal text-sm font-bold px-4 py-3 mb-2 rounded-[0.5vw]"
        role="alert"
      >
        <svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"/></svg>
        <p>
          <a :href="infoLabelUrl" target="_blank" class="underline">Link to Elody CSV documentation</a>
        </p>
      </div>
      <div
        v-if="templateCsvs"
        class="flex items-center text-neutral-white bg-accent-normal text-sm font-bold px-4 py-3 mb-4 rounded-[0.5vw]"
        role="alert"
        @click.stop
      >
        <svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"/></svg>
        <p
          class="fill-current underline pr-4 cursor-pointer"
          @click="
            downloadCsvTemplate(`/${selectedItem.value}`)
          "
        >
          {{ $t("upload-fields.csv-template-link") }}
        </p>
        <base-dropdown-new
          v-model:model-value="selectedItem"
          :options="mapModelValueToDropdownOptions(templateCsvs)"
          dropdown-style="default"
        />
      </div>
    </div>

    <div
      :class="['flex flex-col w-full', `${getDropzoneSize(dropzoneSize)}`]"
      :key="uploadFieldType"
    >
      <dropzone
        :dropzone="dropzone"
        :dropzone-label="dropzoneLabel"
        view-style="p-3 h-full overflow-x-hidden mb-4 flex-grow"
        :isValidationFile="dryRun"
        :extra-mediafile-type="extraMediafileType"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Dropzone from "@/components/base/dropzone/Dropzone.vue";
import { useDropzone } from "@/composables/useDropzone";
import useUpload from "@/composables/useUpload";
import type { DropdownOption, UploadFieldType, UploadFlow } from "@/generated-types/queries";
import Papa from "papaparse";
import { ref, watch } from "vue";
import { downloadCsv, mapModelValueToDropdownOptions } from "@/helpers";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";

enum csvHeaders {
  file_identifier = "file_identifier",
  filename = "filename",
  file_source ="file_source",
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
  }>(),
  {
    dropzoneSize: "normal",
    isLinkedUpload: false,
    dryRun: false,
    templateCsvs: undefined,
    infoLabelUrl: undefined,
    extraMediafileType: undefined,
  },
);

const { initializeUpload } = useUpload();
const { files } = useUpload();

const dropzone = new useDropzone();
const selectedItem = ref<DropdownOption[] | undefined>(
  props.templateCsvs ? mapModelValueToDropdownOptions(props.templateCsvs[0]) : undefined,
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
    let columnToAddFilename =
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
  () => [props.acceptedFileTypes, props.maxFileSize, props.uploadFieldType, props.extraMediafileType],
  () => {
    setUseUploadVariables();
  },
  { immediate: true },
);
</script>

<style scoped></style>
