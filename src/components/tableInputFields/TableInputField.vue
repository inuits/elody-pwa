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
    <div class="overflow-x-auto rounded-lg border border-[rgba(0,58,82,0.2)]">
      <div class="grid w-max min-w-full" :style="gridStyle">
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
          :relation-type="relationType || undefined"
          :disabled="disabled"
          @remove-row="removeRow"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useFieldArray } from "vee-validate";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import {
  type SubField,
  InputFieldTypes,
  EditStatus,
} from "@/generated-types/queries";
import { DamsIcons, MetadataInput } from "@/generated-types/queries";
import TableRowInputField from "@/components/tableInputFields/TableRowInputField.vue";

const { t } = useI18n();

const props = defineProps<{
  modelValue?: Record<string, any>[];
  isFlowRelationValues?: boolean;
  subFields: SubField[];
  formId: string;
  parentFieldKey: string;
  relationType?: string;
  disabled?: boolean;
}>();

const { fields, push, remove, replace } = useFieldArray<Record<string, any>>(`${props.parentFieldKey}`);

const gridStyle = computed(() => {
  const cols = props.subFields.map((sf) =>
    sf.inputField?.type === InputFieldTypes.Checkbox
      ? "max-content"
      : "minmax(max-content, 1fr)",
  );
  if (!props.disabled) cols.push("max-content");
  return { gridTemplateColumns: cols.join(" ") };
});

const addRow = () => {
  if (props.relationType) {
    const metadata = props.subFields
      .filter((sf) => sf.inputField?.isMetadataField === true)
      .map((sf) => ({
        key: sf.key,
        value: sf.inputField?.type === InputFieldTypes.Checkbox ? false : "",
      }));
    push({ key: "", type: props.relationType, editStatus: EditStatus.New, metadata });
  } else {
    const emptyItem: Record<string, any> = {};
    for (const sf of props.subFields) {
      emptyItem[sf.key] = sf.inputField?.type === InputFieldTypes.Checkbox ? false : "";
    }
    push(emptyItem);
  }
};

const removeRow = (index: number) => {
  remove(index);
};

const relationKeySubField = computed(() =>
  props.subFields.find((sf) => sf.inputField?.isMetadataField === false),
);

const metadataSubFields = computed(() =>
  props.subFields.filter((sf) => sf.inputField?.isMetadataField === true),
);

const normalizeRelationRow = (
  item: Record<string, any>,
): Record<string, any> => {
  const existing: Record<string, any>[] = Array.isArray(item.metadata)
    ? item.metadata
    : [];
  const subFieldKeys = metadataSubFields.value.map((sf) => sf.key);
  const metadata = metadataSubFields.value.map((sf) => {
    const match = existing.find((entry) => entry?.key === sf.key);
    if (match?.key) return match;
    return {
      key: sf.key,
      value: sf.inputField?.type === InputFieldTypes.Checkbox ? false : "",
    };
  });
  const extras = existing.filter(
    (entry) => entry?.key && !subFieldKeys.includes(entry.key),
  );
  return { ...item, metadata: [...metadata, ...extras] };
};

const isRelationRowNormalized = (item: Record<string, any>): boolean => {
  if (item?.type !== props.relationType) return false;
  const md: Record<string, any>[] = Array.isArray(item.metadata)
    ? item.metadata
    : [];
  const aligned = metadataSubFields.value.every(
    (sf, index) => md[index]?.key === sf.key,
  );
  const noKeyless = md.every((entry) => !!entry?.key);
  return aligned && noKeyless;
};

const serializeRelationRow = (item: Record<string, any>): Record<string, any> => {
  const keyField = relationKeySubField.value;
  if (!props.relationType || !keyField) return null;

  const relationKey = item[keyField.key];
  const metadata: MetadataInput[] = props.subFields
    .filter((sf) => sf.inputField?.isMetadataField === true)
    .map((sf) => ({ key: sf.key, value: mapMetadataToCorrectFormat(sf, item) }));
  return {
    key: relationKey || "",
    type: props.relationType,
    editStatus: EditStatus.New,
    metadata,
  };
};

const mapMetadataToCorrectFormat = (subfield: SubField, item: Record<string, any>) => {
  if (subfield.inputField?.type === InputFieldTypes.Checkbox) {
    const value = item[subfield.key];
    if (!value) return false;
    return value;
  }
  return item[subfield.key] || "";
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (!Array.isArray(newVal) || newVal.length === 0) return;

    if (!props.relationType) {
      if (fields.value.length === 0) newVal.forEach((item) => push(item));
      return;
    }

    const serialized = newVal
      .map((item) =>
        item?.type === props.relationType
          ? normalizeRelationRow(item)
          : serializeRelationRow(item),
      )
      .filter(Boolean);

    if (fields.value.length === 0) {
      serialized.forEach((item) => push(item));
    } else {
      const needsConversion = newVal.some(
        (item) => item?.type !== props.relationType,
      );
      const needsNormalization =
        !!props.relationType &&
        newVal.some((item) => !isRelationRowNormalized(item));
      if (needsConversion || needsNormalization) replace(serialized);
    }
  },
  { immediate: true },
);
</script>
