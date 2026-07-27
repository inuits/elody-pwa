<template>
  <div class="flex justify-between items-center px-2">
    <div v-if="!hidePrepareStep" class="px-1 file-validate-container">
      <base-progress-step
        :status="ProgressStepStatus.Empty"
        :show-label="false"
        label="actions.progress-steps.validate"
        class="file-validate-empty"
      />
      <base-progress-step
        :status="ProgressStepStatus.Loading"
        :show-label="false"
        label="actions.progress-steps.validate"
        class="file-validate-loading hidden"
      />
      <base-progress-step
        :status="ProgressStepStatus.Complete"
        :show-label="false"
        label="actions.progress-steps.validate"
        class="file-validate-complete hidden"
      />
      <base-progress-step
        :status="ProgressStepStatus.Failed"
        :show-label="false"
        label="actions.progress-steps.validate"
        class="file-validate-failed hidden"
      />
    </div>
    <div
      v-if="!isValidationFile && !hidePrepareStep"
      class="px-1 file-prepare-container"
    >
      <base-progress-step
        :status="ProgressStepStatus.Empty"
        :show-label="false"
        label="actions.progress-steps.prepare"
        class="file-prepare-empty"
      />
      <base-progress-step
        :status="ProgressStepStatus.Loading"
        :show-label="false"
        label="actions.progress-steps.prepare"
        class="file-prepare-loading hidden"
      />
      <base-progress-step
        :status="ProgressStepStatus.Complete"
        :show-label="false"
        label="actions.progress-steps.prepare"
        class="file-prepare-complete hidden"
      />
      <base-progress-step
        :status="ProgressStepStatus.Failed"
        :show-label="false"
        label="actions.progress-steps.prepare"
        class="file-prepare-failed hidden"
      />
    </div>
    <div v-if="!isValidationFile" class="px-1 file-upload-container">
      <base-progress-step
        :status="ProgressStepStatus.Empty"
        :show-label="false"
        label="actions.progress-steps.upload"
        class="file-upload-empty"
      />
      <base-progress-step
        :status="ProgressStepStatus.Loading"
        :show-label="false"
        label="actions.progress-steps.upload"
        class="file-upload-loading hidden"
      />
      <base-progress-step
        :status="ProgressStepStatus.Complete"
        :show-label="false"
        label="actions.progress-steps.upload"
        class="file-upload-complete hidden"
      />
      <base-progress-step
        :status="ProgressStepStatus.Failed"
        :show-label="false"
        label="actions.progress-steps.upload"
        class="file-upload-failed hidden"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseProgressStep from "@/components/base/progressStep/BaseProgressStep.vue";
import { ProgressStepStatus } from "@/generated-types/queries";

withDefaults(
  defineProps<{
    isValidationFile: boolean;
    hidePrepareStep?: boolean;
  }>(),
  {
    hidePrepareStep: false,
  },
);
</script>

<style scoped></style>
