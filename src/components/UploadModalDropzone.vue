<template>
  <div class="flex flex-col w-full h-full p-3">
    <dropzone-new
      :view-style="'p-3 h-full mb-4'"
      @update-files-in-dropzone="onUpdateFilesInDropzone"
    />

    <div class="p-3 bg-neutral-white rounded">
      <div v-if="!modifyMetadata" class="flex mb-3">
        <!-- START should be a separate base component -->
        <div
          @click="() => (createAsset = !createAsset)"
          class="w-1/3 mr-2 flex rounded cursor-pointer"
          :class="[
            createAsset
              ? `bg-accent-light text-accent-normal`
              : `bg-neutral-lightest text-text-light`,
          ]"
        >
          <unicon
            :name="
              createAsset ? Unicons.CheckSquare.name : Unicons.SquareFull.name
            "
            class="inline"
            :class="createAsset ? `fill-accent-normal` : `fill-text-light`"
            height="16"
          />
          <span class="inline text-sm ml-1 pt-0.5">
            {{ $t("dropzone.createAsset") }}
          </span>
        </div>
        <!-- END -->

        <div class="w-2/3">
          <BaseDropdownNew
            v-model="selectedImportMethod"
            :options="importMethods"
          />
        </div>
      </div>

      <div>
        <BaseButtonNew
          v-if="!modifyMetadata"
          class="w-full"
          :label="$t('dropzone.upload')"
          :icon="Unicons.PlusCircle.name"
          :button-style="'blue'"
          :disabled="isDisabledUploadButton"
          @click="uploadFiles"
        />
        <BaseButtonNew
          v-if="modifyMetadata"
          class="w-full"
          :label="$t('dropzone.modifyMetadata')"
          :icon="Unicons.EditAlt.name"
          :button-style="'blue'"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { DropzoneFile } from "dropzone";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import DropzoneNew from "@/components/base/dropzone/DropzoneNew.vue";
import useDropzoneHelper from "@/composables/useDropzoneHelper";
import { ref, watch } from "vue";
import { Unicons } from "@/types";
import { uploadModalState } from "@/composables/useUploadModal";

const {
  isUploading,
  setSelectedMediafiles,
  clearDropzoneCounters,
  clearDropzoneErrorMessages,
} = useDropzoneHelper();
const createAsset = ref<boolean>(false);
const filesInDropzone = ref<DropzoneFile[]>([]);
const isDisabledUploadButton = ref<boolean>(true);
const modifyMetadata = ref<boolean>(false);

const initialImportMethods: string[] = [];
const importMethods = ref<string[]>(initialImportMethods);
const selectedImportMethod = ref<string>();

const onUpdateFilesInDropzone = (files: DropzoneFile[]) => {
  filesInDropzone.value = files;
  isDisabledUploadButton.value = files.length === 0;

  const csvFiles = files.filter((file) => file.type === "text/csv");
  modifyMetadata.value = csvFiles.length === 1 && files.length === 1;
  importMethods.value = [
    ...csvFiles.map((file) => file.name),
    ...initialImportMethods,
  ];
  selectedImportMethod.value = csvFiles[csvFiles.length - 1]?.name;
};

const uploadFiles = () => {
  isUploading.value = true;
  setSelectedMediafiles(filesInDropzone.value);
  callUploadEndpoint();
};

const callUploadEndpoint = () => {};

watch(
  () => uploadModalState.value.state,
  () => {
    clearDropzoneCounters();
    clearDropzoneErrorMessages();
  }
);
</script>
