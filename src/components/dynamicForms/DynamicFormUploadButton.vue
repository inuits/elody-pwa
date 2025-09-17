<template>
  <div data-cy="dynamic-form-upload-button">
    <div class="flex">
      <div
        v-if="uploadStatus === 'upload-finished'"
        class="w-full bg-green-light p-2 font-bold flex"
        :class="[
          { 'text-green-default bg-green-light': !failedUploads.length },
          { 'text-red-default bg-red-light': failedUploads.length },
        ]"
      >
        <p class="w-full flex items-center">
          {{ finishedStatusMessage }}
        </p>
        <div class="w-1/5 @max-6xl/modal:hidden">
          <base-button-new
            icon="Redo"
            :label="t('actions.labels.reset-upload')"
            button-style="accentAccent"
            @click="resetUpload()"
          />
        </div>
        <div class="@6xl/modal:hidden">
          <base-button-new
            icon="Redo"
            button-style="accentAccent"
            @click="resetUpload()"
          />
        </div>
        <div class="w-1/5 ml-5 @max-lg/modal:hidden">
          <base-button-new
            icon="CheckCircle"
            :label="t('actions.labels.complete')"
            button-style="accentAccent"
            @click="emit('closeAndDeleteForm')"
          />
        </div>
        <div class="ml-5 @lg/modal:hidden">
          <base-button-new
            icon="CheckCircle"
            button-style="accentAccent"
            @click="emit('closeAndDeleteForm')"
          />
        </div>
      </div>
      <div
        v-if="
          uploadStatus === UploadStatus.Uploading ||
          uploadStatus === UploadStatus.Paused
        "
        class="w-full flex"
      >
        <progress-bar
          v-if="mediafiles.length > 0"
          :progress="amountUploaded"
          progress-bar-type="steps"
          :total-amount-of-steps="mediafiles.length"
        />
        <div class="w-1/4 px-2" v-if="uploadFlow === UploadFlow.MediafilesOnly">
          <base-button-new
            v-if="uploadStatus === UploadStatus.Uploading"
            icon="Pause"
            :label="t('actions.labels.pause-upload')"
            button-style="accentAccent"
            @click="pauseUpload()"
          />
          <base-button-new
            v-if="uploadStatus === UploadStatus.Paused"
            icon="Play"
            :label="t('actions.labels.resume-upload')"
            button-style="accentAccent"
            @click="resumeUpload()"
          />
        </div>
      </div>
      <button
        v-if="uploadStatus === 'no-upload'"
        type="button"
        :disabled="disabled"
        @click="emit('clickUploadButton')"
        class="flex h-max self-center justify-center items-center w-full p-2 rounded-md cursor-pointer outline-none transition-colors duration-300 disabled:cursor-auto text-neutral-white bg-accent-accent hover:text-accent-accent hover:bg-background-normal active:text-accent-accent active:bg-accent-light disabled:text-text-disabled disabled:bg-background-normal"
      >
        <unicon
          v-if="props.icon !== DamsIcons.NoIcon"
          :class="{ '-ml-1': label }"
          :name="Unicons[props.icon].name"
          :height="18"
        />
        <span v-if="label" class="ml-0.5 leading-4">{{ label }}</span>
      </button>
    </div>
    <div
      v-if="progressIndicatorType === ActionProgressIndicatorType.ProgressSteps"
      class="w-full flex items-center p-2 bg-background-light h-[48px]"
    >
      <div
        v-for="(progressStep, index) in uploadProgress"
        :key="progressStep.label"
        class="flex items-center"
      >
        <base-progress-step
          :label="progressStep.label"
          :status="progressStep.status"
        />
        <unicon
          v-if="index !== uploadProgress.length - 1"
          :name="Unicons.EllipsisH.name"
          fill="text-neutral-black"
          :height="18"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ActionProgressIndicatorType,
  DamsIcons,
  UploadFlow,
} from "@/generated-types/queries";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import { computed, inject } from "vue";
import BaseProgressStep from "@/components/base/progressStep/BaseProgressStep.vue";
import useUpload, { UploadStatus } from "@/composables/upload/useUpload";
import ProgressBar from "@/components/ProgressBar.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";

const props = withDefaults(
  defineProps<{
    label: string;
    icon: DamsIcons;
    disabled: boolean;
    progressIndicatorType?: ActionProgressIndicatorType;
  }>(),
  { progressIndicatorType: ActionProgressIndicatorType.Spinner },
);

const emit = defineEmits<{
  (event: "resetUpload"): void;
  (event: "resetUpload"): void;
  (event: "closeAndDeleteForm"): void;
  (event: "clickUploadButton"): void;
}>();

const { t } = useI18n();
const config: any = inject("config");
const {
  uploadProgress,
  uploadStatus,
  amountUploaded,
  mediafiles,
  resetUpload,
  pauseUpload,
  resumeUpload,
  failedUploads,
  uploadFlow,
  csvOnlyUploadSFailed,
} = useUpload(config);

const finishedStatusMessage = computed(() => {
  if (uploadFlow.value === UploadFlow.CsvOnly) {
    if (csvOnlyUploadSFailed.value) return t("actions.labels.csv-errors");
    return t("actions.labels.csv-success");
  }
  if (uploadFlow.value === UploadFlow.XmlMarc) {
    return t("actions.labels.xml-success");
  }
  const amountSuccess: number = amountUploaded.value;
  if (failedUploads.value.length <= 0)
    return t("actions.labels.success", [amountSuccess]);
  const amountFailed: number = failedUploads.value.length;
  return t("actions.upload.errors", [amountFailed]);
});
</script>

<style scoped></style>
