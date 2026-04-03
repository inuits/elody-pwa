<template>
  <div
    v-for="(subField, colIndex) in subFields"
    :key="subField.key"
    class="flex items-center px-2 py-1 border-b border-[rgba(0,58,82,0.08)]"
    :class="{
      'border-r border-r-[rgba(0,58,82,0.15)]': colIndex < subFields.length - 1,
    }"
  >
    <TableCellInputField
      :model-value="getCellModelValue(subField)"
      :sub-field="subField"
      :field-key="getCellFieldKey(subField)"
      :form-id="formId"
      :disabled="disabled"
    />
  </div>
  <div
    v-if="!disabled"
    class="flex items-center justify-center px-1 py-1 border-b border-[rgba(0,58,82,0.08)] border-l border-l-[rgba(0,58,82,0.2)]"
  >
    <BaseButtonNew
      class="!w-auto"
      :icon="DamsIcons.Trash"
      button-style="redDefault"
      button-size="verySmall"
      @click="emit('remove-row', rowIndex)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import TableCellInputField from "@/components/tableInputFields/TableCellInputField.vue";
import { DamsIcons, type SubField } from "@/generated-types/queries";

const props = defineProps<{
  rowIndex: number;
  item: Record<string, any>;
  subFields: SubField[];
  formId: string;
  parentFieldKey: string;
  relationType?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "remove-row", index: number): void;
}>();

const metadataSubFields = computed(() =>
  props.subFields.filter((sf) => sf.inputField?.isMetadataField === true),
);

const getCellFieldKey = (subField: SubField): string => {
  if (!props.relationType) {
    return `${props.parentFieldKey}[${props.rowIndex}].${subField.key}`;
  }
  if (!subField.inputField?.isMetadataField) {
    return `${props.parentFieldKey}[${props.rowIndex}].key`;
  }
  const metaIdx = metadataSubFields.value.findIndex((sf) => sf.key === subField.key);
  return `${props.parentFieldKey}[${props.rowIndex}].metadata[${metaIdx}].value`;
};

const getCellModelValue = (subField: SubField): any => {
  if (!props.relationType) {
    return props.item[subField.key];
  }
  if (!subField.inputField?.isMetadataField) {
    return props.item.key;
  }
  const metaIdx = metadataSubFields.value.findIndex((sf) => sf.key === subField.key);
  return props.item.metadata?.[metaIdx]?.value;
};
</script>
