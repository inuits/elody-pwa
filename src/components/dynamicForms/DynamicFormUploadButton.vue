<template>
  <div class="rounded-md pb-2">
    <div class="flex">
      <div
        v-if="missingFileNames.length"
        class="w-full bg-red-light p-2 text-red-default font-bold flex"
      >
        <p>
          {{
            t("actions.upload.errors", [missingFileNames.length]) +
            t("actions.upload.missing", [missingFileNames.join(", ")])
          }}
        </p>
      </div>
      <div
        v-if="uploadStatus === 'upload-finished'"
        class="w-full bg-green-light p-2 font-bold flex"
        :class="[
          { 'text-green-default bg-green-light': !failedUploads.length },
          { 'text-red-default bg-red-light': failedUploads.length },
        ]"
      >
        <p class="w-full flex items-center">
          {{
            t(
              failedUploads.length
                ? "actions.upload.errors"
                : "actions.labels.success",
              [failedUploads.length ? failedUploads.length : amountUploaded]
            )
          }}
        </p>
        <div class="w-1/4">
          <base-button-new
            icon="Redo"
            :label="t('actions.labels.reset-upload')"
            button-style="accentAccent"
            @click="resetUpload"
          />
        </div>
      </div>
      <progress-bar
        v-else
        :progress="amountUploaded"
        progress-bar-type="steps"
        :total-amount-of-steps="mediafiles.length"
      />
      <button
        v-if="uploadStatus === 'no-upload'"
        type="button"
        :disabled="disabled"
        @click="emit('clickUploadButton')"
        class="flex justify-center items-center w-full p-2 rounded-md outline-none transition-colors duration-300 disabled:cursor-auto text-neutral-white bg-accent-accent hover:text-accent-accent hover:bg-neutral-lightest active:text-accent-accent active:bg-accent-light disabled:text-text-disabled disabled:bg-neutral-lightest"
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
      class="w-full flex items-center p-2 bg-neutral-white h-[48px]"
    >
      <div
        v-for="progressStep in uploadProgress"
        :key="progressStep.label"
        class="flex"
      >
        <base-progress-step
          :label="progressStep.label"
          :status="progressStep.status"
        />
        <unicon
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
} from "@/generated-types/queries";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import BaseProgressStep from "@/components/base/progressStep/BaseProgressStep.vue";
import useUpload from "@/composables/useUpload";
import ProgressBar from "@/components/ProgressBar.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";

const props = withDefaults(
  defineProps<{
    label: string;
    icon: DamsIcons;
    disabled: boolean;
    progressIndicatorType?: ActionProgressIndicatorType;
  }>(),
  { progressIndicatorType: ActionProgressIndicatorType.Spinner }
);

const emit = defineEmits<{
  (event: "resetUpload"): void;
  (event: "clickUploadButton"): void;
}>();

const { t } = useI18n();
const {
  uploadProgress,
  uploadStatus,
  amountUploaded,
  mediafiles,
  resetUpload,
  missingFileNames,
  failedUploads,
} = useUpload();
</script>

<style scoped></style>
