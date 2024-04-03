<template>
  <div class="flex justify-between items-center px-2">
    <div class="px-1 file-validate-container">
      <base-progress-step
        :status="ProgressStepStatus.Empty"
        class="file-validate-empty"
      />
      <base-progress-step
        :status="ProgressStepStatus.Loading"
        class="file-validate-loading hidden"
      />
      <base-progress-step
        :status="ProgressStepStatus.Complete"
        class="file-validate-complete hidden"
      />
      <base-progress-step
        :status="ProgressStepStatus.Failed"
        class="file-validate-failed hidden"
      />
    </div>
    <div v-if="!isValidationFile" class="px-1 file-prepare-container">
      <base-progress-step
        :status="ProgressStepStatus.Empty"
        class="file-prepare-empty"
      />
      <base-progress-step
        :status="ProgressStepStatus.Loading"
        class="file-prepare-loading hidden"
      />
      <base-progress-step
        :status="ProgressStepStatus.Complete"
        class="file-prepare-complete hidden"
      />
      <base-progress-step
        :status="ProgressStepStatus.Failed"
        class="file-prepare-failed hidden"
      />
    </div>
    <div v-if="!isValidationFile" class="px-1 file-upload-container">
      <base-progress-step
        :status="ProgressStepStatus.Empty"
        class="file-upload-empty"
      />
      <base-progress-step
        :status="ProgressStepStatus.Loading"
        class="file-upload-loading hidden"
      />
      <base-progress-step
        :status="ProgressStepStatus.Complete"
        class="file-upload-complete hidden"
      />
      <base-progress-step
        :status="ProgressStepStatus.Failed"
        class="file-upload-failed hidden"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseProgressStep from "@/components/base/progressStep/BaseProgressStep.vue";
import { ProgressStepStatus } from "@/generated-types/queries";

defineProps<{
  isValidationFile: boolean;
}>();
</script>

<style scoped></style>
