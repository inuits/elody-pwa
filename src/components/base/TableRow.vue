<template>
  <div
    v-for="(subField, colIndex) in subFields"
    :key="subField.key"
    class="flex items-center px-2 py-1 border-b border-[rgba(0,58,82,0.08)]"
    :class="{
      'border-r border-r-[rgba(0,58,82,0.15)]':
        colIndex < subFields.length - 1,
    }"
  >
    <CellInputField
      v-model:model-value="item[subField.key]"
      :input-field="subField.inputField"
      :field-key="`${props.parentFieldKey}[${props.rowIndex}].${subField.key}`"
      @update:model-value="emit('updateValue', rowIndex, subField.key, $event)"
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
      @click="emit('removeRow', index)"
    />
  </div>
</template>


<script setup lang="ts">
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import {
  DamsIcons,
  type SubField,
} from "@/generated-types/queries";
import { computed, ref, watch } from "vue";
import CellInputField from "@/components/base/CellInputField.vue";

const props = defineProps<{
  // modelValue: Record<string, any>[] | undefined;
  isFlowRelationValues?: boolean;
  rowIndex: number;
  item: Record<string, any>;
  subFields: SubField[];
  formId: string;
  parentFieldKey: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "updateValue", rowIndex: number, key: string, value: any): void;
  (e: "removeRow", index: number): void;
}>();

const item = ref<Record<string, any>>(props.modelValue ?? []);

</script>


<style scoped>
</style>