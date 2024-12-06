<template>
  <div
    ref="dropzoneView"
    class="bg-neutral-white w-full inline-block border-dashed border-[3px] border-text-light rounded-xl"
    :class="[
      fileCount === 0 ? 'flex justify-center items-center cursor-pointer' : '',
      `${style}`,
    ]"
  >
    <div v-show="fileCount === 0" class="inline-block w-9/12 text-center">
      <div class="dz-message" data-dz-message>
        <div class="text-body">
          {{ $t(dropzoneLabel) }}
        </div>
        <div v-if="isValidation" @click.stop>
          <p
            class="underline text-accent-accent"
            @click="downloadCsvTemplate(`/upload-csv-template-${selectedItem}.csv`)"
            >{{ $t("upload-fields.csv-template-link") }}
          </p>
          <select
            v-if="entityTypesForUpload"
            v-model="selectedItem"
            class="inline-block min-w-0 max-w-full pl-2 pr-8 border-none border-b underline text-accent-accent"
          >
            <option
              v-for="entityType in entityTypesForUpload"
              :key="entityType"
              :value="entityType"
            >
              {{ entityType }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import useUpload from "@/composables/useUpload";
// import Papa from 'papaparse';
import { downloadCsv } from "@/helpers";

const { files } = useUpload();
const dropzoneView = ref<HTMLDivElement>();

const props = withDefaults(
  defineProps<{
    modelValue: HTMLDivElement | undefined;
    dropzoneLabel: string;
    isValidation: boolean;
    fileCount: number;
    style: string;
    entityTypesForUpload?: string | undefined;
  }>(),
  {
    style: "",
    isValidation: false,
    entityTypesForUpload: undefined,
  }
);

const selectedItem = ref<string | undefined>(
  props.entityTypesForUpload ? props.entityTypesForUpload[0] : undefined
);

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: HTMLDivElement | undefined): void;
}>();

const downloadCsvTemplate = async (filePath: any) => {
  const response = await fetch(filePath);
  const text = await response.text();
  const results = Papa.parse(text, {
    header: true,
    dynamicTyping: true,
  });

  if (files.value.length > 0) {
    const header = results.meta.fields as string[];
    const filenameIndex = header.indexOf('filename');
    let columnToAddFilename = filenameIndex === -1 ? 'file_identifier' : 'filename';

    files.value.forEach((file: any, index: number) => {
      results.data.push({});
      results.data[index][columnToAddFilename] = file.name;
    });
  }
  const csv = Papa.unparse(results.data);
  downloadCsv(filePath, csv);
}

onMounted(() => {
  emit("update:modelValue", dropzoneView.value);
});
</script>

<style></style>
