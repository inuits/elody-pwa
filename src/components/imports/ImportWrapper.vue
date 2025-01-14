<template>
  <import-from-network-drive
    v-if="inputFieldType === BaseFieldType.BaseFileSystemImportField"
    :close-and-delete-form="closeAndDeleteForm"
  />
  <import-items
    v-if="
      inputFieldType === BaseFieldType.BaseMagazineWithMetsImportField ||
      inputFieldType === BaseFieldType.BaseMagazineWithCsvImportField
    "
    :input-field-type="inputFieldType"
    :close-and-delete-form="closeAndDeleteForm"
  />
</template>

<script setup lang="ts">
import {
  BaseFieldType,
} from "@/generated-types/queries";
import ImportFromNetworkDrive from "@/components/imports/ImportFromNetworkDrive.vue";
import ImportItems from "@/components/imports/ImportItems.vue";

const props = defineProps<{
  inputFieldType: BaseFieldType;
  closeAndDeleteForm: Function;
}>();
</script>
