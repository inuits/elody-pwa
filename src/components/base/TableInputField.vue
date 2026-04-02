<template>
  <div
    v-if="subFields.length"
    class="relation-metadata-list-field flex flex-col gap-1"
  >
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
            'border-r border-r-[rgba(0,58,82,0.2)]': index < subFields.length - 1,
          }"
        >
          {{ t(subField.label) }}
        </div>
        <div
          v-if="!disabled"
          class="bg-background-normal border-b border-[rgba(0,58,82,0.2)] border-l border-l-[rgba(0,58,82,0.2)]"
        />
        <!-- Data rows -->
        <TableRowInputField
          v-for="(fieldEntry, rowIndex) in fields"
          :key="fieldEntry.key"
          :row-index="rowIndex"
          :item="(fieldEntry.value as Record<string, any>)"
          :sub-fields="subFields"
          :form-id="formId"
          :parent-field-key="parentFieldKey"
          :relation-type="isFlowRelationValues || undefined"
          :disabled="disabled"
          @update-value="handleUpdateValue"
          @remove-row="removeRow"
          @update-relation="handleUpdateRelation"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useFieldArray } from "vee-validate";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import {
  type SubField,
  type BaseRelationValuesInput,
  InputFieldTypes,
} from "@/generated-types/queries";
import { DamsIcons } from "@/generated-types/queries";
import { useFormHelper } from "@/composables/useFormHelper";
import TableRowInputField from "@/components/base/TableRowInputField.vue";

const { t } = useI18n();
const { getForm } = useFormHelper();

const props = defineProps<{
  modelValue?: Record<string, any>[];
  isFlowRelationValues?: string | boolean;
  subFields: SubField[];
  formId: string;
  parentFieldKey: string;
  disabled?: boolean;
}>();

const serializedRelations = ref<(BaseRelationValuesInput | null)[]>([]);
const { fields, push, remove } = useFieldArray<Record<string, any>>(`${props.parentFieldKey}`);

const gridStyle = computed(() => {
  const cols = props.subFields.map((sf) =>
    sf.inputField?.type === InputFieldTypes.Checkbox
      ? "max-content"
      : "minmax(max-content, 1fr)",
  );
  if (!props.disabled) cols.push("max-content");
  return { gridTemplateColumns: cols.join(" ") };
});

const handleUpdateRelation = (
  rowIndex: number,
  relation: BaseRelationValuesInput | null,
) => {
  serializedRelations.value[rowIndex] = relation;
  syncRelationsToForm();
};

const syncRelationsToForm = () => {
  if (!props.isFlowRelationValues) return;
  const validRelations = serializedRelations.value.filter(
    (rel): rel is BaseRelationValuesInput => rel !== null,
  );
  getForm(props.formId)?.setFieldValue(
    `relationValues.${props.isFlowRelationValues}`,
    validRelations,
  );
};

const addRow = () => {
  const emptyItem: Record<string, any> = {};
  for (const subField of props.subFields) {
    emptyItem[subField.key] =
      subField.inputField?.type === InputFieldTypes.Checkbox ? false : "";
  }
  push(emptyItem);
  if (props.isFlowRelationValues) {
    serializedRelations.value.push(null);
    syncRelationsToForm();
  }
};
const removeRow = (index: number) => {
  remove(index);
  if (props.isFlowRelationValues) {
    serializedRelations.value.splice(index, 1);
    syncRelationsToForm();
  }
};

// Pre-populate from modelValue on mount (e.g. copyValueFromParent with auto:true
// sets the form value before this component mounts; if it arrives after mount we
// watch for it below).
const syncRelationsFromFields = () => {
  serializedRelations.value = new Array(fields.value.length).fill(null);
};

watch(
  () => props.modelValue,
  (newVal) => {
    if (!Array.isArray(newVal) || newVal.length === 0) return;
    // Only sync when the FieldArray is still empty to avoid clobbering user edits.
    if (fields.value.length === 0) {
      newVal.forEach((item) => push(item));
      if (props.isFlowRelationValues) syncRelationsFromFields();
    }
  },
  { immediate: true },
);
</script>
