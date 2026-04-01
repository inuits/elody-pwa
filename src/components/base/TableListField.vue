<template>
  <div
    v-if="subFields.length"
    class="relation-metadata-list-field flex flex-col gap-1"
  >
    <!-- Add button – aligned with the field label in MetadataWrapper (absolute top-right) -->
    <div v-if="!disabled" class="absolute top-0 right-0">
      <BaseButtonNew
        class="!w-auto"
        :icon="DamsIcons.Plus"
        :label="t('actions.labels.add-entry')"
        button-style="accentNormal"
        button-size="verySmall"
        @click="addRow"
      />
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-lg border border-[rgba(0,58,82,0.2)]">
      <div class="grid" :style="gridStyle">
        <!-- Header row -->
        <div
          v-for="(subField, index) in subFields"
          :key="`header-${subField.key}`"
          class="flex items-center bg-background-normal px-2 py-1.5 text-xs font-medium text-text-body border-b border-[rgba(0,58,82,0.2)]"
          :class="{
            'border-r border-r-[rgba(0,58,82,0.2)]':
              index < subFields.length - 1,
          }"
        >
          {{ t(subField.label) }}
        </div>
        <div
          v-if="!disabled"
          class="bg-background-normal border-b border-[rgba(0,58,82,0.2)] border-l border-l-[rgba(0,58,82,0.2)]"
        />
        <!-- Data rows -->
        <TableRow
          v-for="(item, rowIndex) in items"
          :key="rowIndex"
          :is-flow-relation-values="isFlowRelationValues"
          :row-index="rowIndex"
          :item="item"
          :sub-fields="subFields"
          :form-id="formId"
          :parent-field-key="parentFieldKey"
          :disabled="disabled"
          @remove-row="(index: number) => removeRow(index)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import {
  type SubField,
  InputFieldTypes,
} from "@/generated-types/queries";
import { DamsIcons } from "@/generated-types/queries";
import TableRow from "@/components/base/TableRow.vue";

const { t } = useI18n();

const props = defineProps<{
  modelValue: Record<string, any>[] | undefined;
  isFlowRelationValues?: boolean;
  subFields: SubField[];
  formId: string;
  parentFieldKey: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Record<string, any>[]): void;
}>();
const emitUpdate = () => {
  emit("update:modelValue", items.value);
};

const items = ref<Record<string, any>[]>(props.modelValue ?? []);
const gridStyle = computed(() => {
  const cols = props.subFields.map((sf) =>
    sf.type === InputFieldTypes.Checkbox
      ? "max-content"
      : "minmax(max-content, 1fr)",
  );
  if (!props.disabled) cols.push("max-content");
  return { gridTemplateColumns: cols.join(" ") };
});

const updateValue = (rowIndex: number, key: string, value: any) => {
  items.value[rowIndex] = { ...items.value[rowIndex], [key]: value };
  emitUpdate();
};

const addRow = () => {
  const emptyItem: Record<string, any> = {};
  for (const subField of props.subFields) {
    emptyItem[subField.key] =
      subField.type === InputFieldTypes.Checkbox ? false : "";
  }
  items.value.push(emptyItem);
  emitUpdate();
};

const removeRow = (index: number) => {
  items.value.splice(index, 1);
  emitUpdate();
};

watch(
  () => props.modelValue,
  (newValue) => {
    items.value = newValue ?? [];
  },
  { deep: true },
);
</script>
