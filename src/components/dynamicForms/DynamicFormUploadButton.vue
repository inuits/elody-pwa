<template>
  <div data-cy="dynamic-form-upload-button">
    <div class="flex">
      <!-- upload.md: one banner from start to finish; its message is the
           role="status" so every count and the result are announced -->
      <div
        v-if="uploadStatus !== UploadStatus.NoUpload"
        class="w-full p-2 flex items-center gap-2"
        :class="toneClasses[tone]"
        :data-tone="tone"
      >
        <p role="status" class="w-full font-bold">{{ statusMessage }}</p>
        <progress-bar
          v-if="isUploading && mediafiles.length > 0"
          class="w-full"
          :progress="amountUploaded"
          progress-bar-type="steps"
          :total-amount-of-steps="mediafiles.length"
        />
        <template v-if="uploadStatus === UploadStatus.Finished">
          <div class="w-1/5 @max-6xl/modal:hidden">
            <base-button-new
              icon="Redo"
              :label="t('actions.labels.reset-upload')"
              button-style="commit"
              @click="resetUpload()"
            />
          </div>
          <div class="@6xl/modal:hidden">
            <base-button-new
              icon="Redo"
              :aria-label="t('actions.labels.reset-upload')"
              button-style="commit"
              @click="resetUpload()"
            />
          </div>
          <div class="w-1/5 ml-3 @max-lg/modal:hidden">
            <base-button-new
              icon="CheckCircle"
              :label="t('actions.labels.complete')"
              button-style="commit"
              @click="emit('closeAndDeleteForm')"
            />
          </div>
          <div class="ml-3 @lg/modal:hidden">
            <base-button-new
              icon="CheckCircle"
              :aria-label="t('actions.labels.complete')"
              button-style="commit"
              @click="emit('closeAndDeleteForm')"
            />
          </div>
        </template>
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
import useUpload from "@/composables/upload/useUpload";
import { UploadStatus } from "@/composables/upload/types";
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
  failedUploads,
  uploadFlow,
  csvOnlyUploadSFailed,
} = useUpload(config);

const isUploading = computed(
  () =>
    uploadStatus.value === UploadStatus.Uploading ||
    uploadStatus.value === UploadStatus.Paused,
);

const isCsvFlow = computed(
  () =>
    uploadFlow.value === UploadFlow.CsvOnly ||
    uploadFlow.value === UploadFlow.XmlMarc,
);

const uploadedOf = computed(() =>
  t("upload-fields.uploaded-of", {
    done: amountUploaded.value,
    total: mediafiles.value.length,
  }),
);

const statusMessage = computed(() => {
  if (uploadFlow.value === UploadFlow.CsvOnly) {
    if (csvOnlyUploadSFailed.value) return t("actions.labels.csv-errors");
    return t("actions.labels.csv-success");
  }
  if (uploadFlow.value === UploadFlow.XmlMarc) {
    return t("actions.labels.xml-success");
  }
  if (mediafiles.value.length > 0) return uploadedOf.value;
  if (failedUploads.value.length <= 0)
    return t("actions.labels.success", [amountUploaded.value]);
  return t("actions.upload.errors", [failedUploads.value.length]);
});

// feedback.md: success, warning for a partial success, danger when nothing went up
type Tone = "neutral" | "success" | "warning" | "danger";
const tone = computed<Tone>(() => {
  if (uploadStatus.value !== UploadStatus.Finished) return "neutral";
  if (isCsvFlow.value) return csvOnlyUploadSFailed.value ? "danger" : "success";
  if (!failedUploads.value.length) return "success";
  return amountUploaded.value > 0 ? "warning" : "danger";
});
const toneClasses: Record<Tone, string> = {
  neutral: "",
  success: "bg-success-bg text-success-ink",
  warning: "bg-warning-bg text-text-body",
  danger: "bg-danger-bg text-danger-ink",
};
</script>

<style scoped></style>
