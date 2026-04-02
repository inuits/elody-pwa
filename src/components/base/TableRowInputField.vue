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
      :model-value="item[subField.key]"
      :input-field="subField.inputField"
      :field-key="`${parentFieldKey}[${rowIndex}].${subField.key}`"
      :form-id="formId"
      :disabled="disabled"
      @update:model-value="emit('update-value', rowIndex, subField.key, $event)"
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
import { computed, watch } from "vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import TableCellInputField from "@/components/base/TableCellInputField.vue";
import {
  DamsIcons,
  EditStatus,
  type SubField,
  type BaseRelationValuesInput,
  type MetadataInput,
} from "@/generated-types/queries";

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
  (e: "update-value", rowIndex: number, key: string, value: any): void;
  (e: "remove-row", index: number): void;
  (e: "update-relation", rowIndex: number, relation: BaseRelationValuesInput | null): void;
}>();

// Identifies the sub-field that provides the relation key (entity ID).
// It is the sub-field whose inputField.isMetadataField === false.
const relationKeySubField = computed(() =>
  props.subFields.find((sf) => sf.inputField?.isMetadataField === false),
);

const serializeRow = (): BaseRelationValuesInput | null => {
  if (!props.relationType) return null;

  const keyField = relationKeySubField.value;
  if (!keyField) return null;

  const entityId = props.item[keyField.key];
  if (!entityId) return null;

  const metadata: MetadataInput[] = props.subFields
    .filter((sf) => sf.inputField?.isMetadataField === true)
    .map((sf) => ({ key: sf.key, value: props.item[sf.key] }));

  return {
    key: entityId,
    type: props.relationType,
    editStatus: EditStatus.New,
    metadata,
  };
};

watch(
  () => props.item,
  () => {
    if (!props.relationType) return;
    emit("update-relation", props.rowIndex, serializeRow());
  },
  { deep: true, immediate: true },
);
</script>
