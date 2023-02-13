<template>
  <div class="flex flex-col w-full h-full">
    <div
      ref="dropzoneDiv"
      class="bg-[var(--color-neutral-white)] w-full inline-block border-dashed border-[3px] border-text-light rounded-xl p-3 h-full mb-4"
      :class="{
        'flex justify-center items-center cursor-pointer':
          !finishedUploading && !fileCount,
        '': finishedUploading && fileCount,
      }"
    >
      <div v-show="fileCount === 0" class="inline-block w-9/12 text-center">
        <div class="dz-message" data-dz-message>
          <span v-if="total === 0" class="text-body">{{
            $t("dropzone.drag-add")
          }}</span>
        </div>
      </div>
      <div
        v-if="finishedUploading && total !== 0"
        class="w-full px-5 text-left border-4 border-neutral-500 py-5 rounded-md"
      >
        <div class="flex justify-between">
          <div class="text-lg text-center pb-8 text-red-dark">
            {{ failed }} {{ $t("dropzone.failed") }}
          </div>
          <div class="text-lg text-center pb-8 text-green-default">
            {{ success }} {{ $t("dropzone.success") }}
          </div>
        </div>
        <div
          class="text-red-dark truncate"
          v-for="errorMessage in errorMessages"
          :key="errorMessage.toString()"
        >
          - {{ errorMessage }}
        </div>
      </div>
    </div>
    <div class="p-3 bg-[var(--color-neutral-white)] rounded">
      <div class="flex">
        <div
          @click="() => (createAsset = !createAsset)"
          class="w-1/3 mr-2 flex rounded cursor-pointer"
          :class="[
            createAsset
              ? `bg-[var(--color-accent-light)] text-[var(--color-accent-normal)]`
              : `bg-[var(--color-neutral-lightest)] text-[var(--color-text-light)]`,
          ]"
        >
          <unicon
            :name="
              createAsset ? Unicons.CheckSquare.name : Unicons.SquareFull.name
            "
            height="16"
            class="inline"
            :fill="
              createAsset
                ? `var(--color-accent-normal)`
                : `var(--color-text-light)`
            "
          />
          <span class="inline text-sm ml-1 pt-0.5">creëer asset</span>
        </div>
        <div class="w-2/3">
          <InputField
            class="h-7"
            v-model="uploadedCsv"
            type="file"
            accept=".csv"
            :icon="Unicons.Link.name"
          />
        </div>
      </div>
      <div class="mt-3">
        <BaseButtonNew
          v-if="triggerUpload"
          class="w-full"
          :label="$t('dropzone.upload')"
          :disable="fileCount === 0"
          :icon="Unicons.PlusCircle.name"
          @click="triggerUpload"
        />
      </div>
    </div>
  </div>
  <div class="hidden">
    <div
      ref="dropzonePreviewDiv"
      class="flex dz-file-preview border border-[var(--color-neutral-light)] rounded-md w-full mi-h-28 flex flex-row items-right mb-2 hover:bg-blue-default10 p-3 rounded relative"
    >
      <div
        class="flex justify-center items-center bg-[var(--color-neutral-light)] rounded-lg w-10 h-8 mt-1 mr-2"
      >
        <unicon
          :name="Unicons.Image.name"
          class="fill-[var(--color-text-body)]"
          height="16"
        />
      </div>

      <div class="dz-filename text-blue text-sm mt-2 ml-6 pr-6 w-full">
        <span
          class="inline-block w-full break-words text-[var(--color-text-body)]"
          data-dz-name
        ></span>
      </div>

      <a
        data-dz-remove
        class="cursor-pointer flex justify-center items-center bg-[var(--color-neutral-light)] rounded-lg w-10 h-8 mt-1 mr-2"
      >
        <svg
          width="9"
          height="11"
          viewBox="0 0 7 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.5 3V8H1.5V3H5.5ZM4.75 0H2.25L1.75 0.5H0V1.5H7V0.5H5.25L4.75 0ZM6.5 2H0.5V8C0.5 8.55 0.95 9 1.5 9H5.5C6.05 9 6.5 8.55 6.5 8V2Z"
            class="fill-[var(--color-text-body)]"
          />
        </svg>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { PostMediaFileDocument } from "../generated-types/queries";
import type { PostMediaFileMutation } from "../generated-types/queries";
import useDropzoneHelper from "../composables/useDropzoneHelper";
import { onMounted, ref, defineComponent } from "vue";
import { useMutation } from "@vue/apollo-composable";
import Dropzone from "dropzone";
import { useUploadModal } from "./UploadModal.vue";
import useMediaAssetLinkHelper from "../composables/useMediaAssetLinkHelper";
import useMetaDataHelper from "../composables/useMetaDataHelper";
import {
  NotificationType,
  useNotification,
} from "../components/base/BaseNotification.vue";
import { useI18n } from "vue-i18n";
import BaseButtonNew from "./base/BaseButtonNew.vue";
import { Unicons } from "@/types";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import InputField from "../components/base/InputField.vue";

export default defineComponent({
  name: "DropZone",
  components: {
    BaseButtonNew,
    InputField,
  },
  setup() {
    const {
      myDropzone,
      isUploading,
      selectedFiles,
      errorMessages,
      total,
      failed,
      success,
      finishedUploading,
      increaseSuccessCounter,
      clearDropzoneErrorMessages,
      clearDropzoneCounters,
      getDropzoneSettings,
      setSelectedMediafiles,
    } = useDropzoneHelper();
    const { onDone, mutate } = useMutation<PostMediaFileMutation>(
      PostMediaFileDocument
    );
    const dropzonePreviewDiv = ref<HTMLDivElement | undefined>(undefined);
    const dropzoneDiv = ref<HTMLDivElement | undefined>(undefined);
    const triggerUpload = ref<() => void | undefined>();
    const fileCount = ref<number>(0);
    const { closeUploadModal } = useUploadModal();
    const { addMediaFileToLinkList } = useMediaAssetLinkHelper();
    const { mediafiles } = useMetaDataHelper();
    const { createNotification } = useNotification();
    const { t } = useI18n();
    const createAsset = ref<boolean>(false);
    const uploadedCsv = ref<any>();

    clearDropzoneErrorMessages();

    onMounted(async () => {
      if (dropzoneDiv.value && dropzonePreviewDiv) {
        myDropzone.value = new Dropzone(
          dropzoneDiv.value,
          getDropzoneSettings(dropzonePreviewDiv)
        );

        const updateFileCount = () => {
          if (myDropzone.value) {
            fileCount.value = myDropzone.value?.files.length;
          }
        };

        myDropzone.value.on("removedfile", () => {
          updateFileCount();
        });

        myDropzone.value.on("addedfile", () => {
          clearDropzoneCounters();
          clearDropzoneErrorMessages();
          updateFileCount();
        });

        onDone((value) => {
          if (value.data && value.data.postMediaFile) {
            mediafiles.value.push(value.data.postMediaFile);
            addMediaFileToLinkList(value.data.postMediaFile);
          }
          increaseSuccessCounter();
        });

        const uploadFiles = () => {
          selectedFiles.value.forEach(async (file: any) => {
            await mutate({
              mediaFileInput: { filename: file.name, mimetype: file.type },
              file,
            });
          });
          isUploading.value = false;
          if (!errorMessages.value.length) {
            createNotification({
              displayTime: 10,
              type: NotificationType.default,
              title: t("dropzone.successNotification.title"),
              description: t("dropzone.successNotification.description"),
              shown: true,
            });
            closeUploadModal();
          }
        };

        triggerUpload.value = () => {
          isUploading.value = true;
          setSelectedMediafiles(myDropzone.value.files);
          uploadFiles();
        };
      }
    });

    return {
      Unicons,
      dropzonePreviewDiv,
      errorMessages,
      dropzoneDiv,
      fileCount,
      triggerUpload,
      success,
      failed,
      total,
      finishedUploading,
      getDropzoneSettings,
      createAsset,
      uploadedCsv,
    };
  },
});
</script>
<style scoped>
.dz-preview a {
  display: none;
}

.dz-preview:hover a {
  display: flex;
}
</style>
