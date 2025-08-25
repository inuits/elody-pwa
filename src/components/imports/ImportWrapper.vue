<template>
  <import-from-network-drive
    v-if="
      inputFieldType === BaseFieldType.BaseFileSystemImportField ||
      inputFieldType === BaseFieldType.BaseMagazineWithCsvImportField ||
      inputFieldType === BaseFieldType.BaseMagazineWithMetsImportField
    "
    :form-id="formId"
    :input-field-type="inputFieldType"
    :close-and-delete-form="closeAndDeleteForm"
    @set-show-errors="(value) => emit('setShowErrors', value)"
  />
</template>

<script setup lang="ts">
import { BaseFieldType } from "@/generated-types/queries";
import ImportFromNetworkDrive from "@/components/imports/ImportFromNetworkDrive.vue";

const emit = defineEmits(["setShowErrors"]);

defineProps<{
  formId: string;
  inputFieldType: BaseFieldType;
  closeAndDeleteForm: () => void;
}>();
</script>
