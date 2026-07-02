<template>
  <div
    v-for="(subField, colIndex) in visibleSubFields"
    :key="subField.key"
    class="flex items-center px-2 py-1 border-b border-[rgba(0,58,82,0.08)]"
    :class="{
      'border-r border-r-[rgba(0,58,82,0.15)]':
        colIndex < visibleSubFields.length - 1,
    }"
  >
    <!-- Column sourced from the row's related entity (e.g. a genre's audience_type /
         genre_type). When the row points at an existing entity, show it read-only,
         auto-loaded from that entity. When the row is a new entity (no match yet),
         fall through to the editable cell so the user can fill it in (and it is then
         submitted as relation metadata + seeded onto the created entity). -->
    <BaseInputTextNumberDatetime
      v-if="subField.entitySourceKey && hasResolvedEntity"
      class="w-full"
      :model-value="getEntitySourceValue(subField)"
      input-style="defaultWithBorder"
      type="text"
      :disabled="true"
    />
    <TableCellInputField
      v-else
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
import { computed, ref, watch } from "vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import TableCellInputField from "@/components/tableInputFields/TableCellInputField.vue";
import {
  DamsIcons,
  type Entitytyping,
  type SubField,
  GetEntityByIdDocument,
} from "@/generated-types/queries";
import { apolloClient } from "@/main";
import { looksLikeEntityId } from "@/helpers";

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

// Hidden sub-fields are kept in metadataSubFields (so the metadata index used to
// build the field key stays aligned with the serialized metadata array) but are
// never rendered as a cell.
const visibleSubFields = computed(() =>
  props.subFields.filter((sf) => !sf.hidden),
);

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

// --- Read-only columns sourced from the row's related entity ------------------
// A sub-field with `entitySourceKey` displays a property of the entity the row
// points to (e.g. a genre's audience_type / genre_type). The value is fetched from
// the related entity, not from form state, and updates when the row's relation is
// re-picked.
const hasEntitySourceColumns = computed(() =>
  props.subFields.some((sf) => sf.entitySourceKey),
);

const relationEntityType = computed<Entitytyping | undefined>(() => {
  const relationSubField = props.subFields.find(
    (sf) => !sf.inputField?.isMetadataField && sf.inputField?.entityType,
  );
  return relationSubField?.inputField?.entityType as Entitytyping | undefined;
});

const resolvedEntityValues = ref<Record<string, any> | undefined>();

// True when the row points at an existing entity (its metadata is loaded). Drives the
// read-only vs editable rendering of entitySourceKey columns.
const hasResolvedEntity = computed(() => !!resolvedEntityValues.value);

const fetchEntitySourceValues = async (key: string | undefined) => {
  if (!hasEntitySourceColumns.value || !props.relationType) return;
  const entityType = relationEntityType.value;
  if (!key || !entityType || !looksLikeEntityId(key)) {
    resolvedEntityValues.value = undefined;
    return;
  }
  try {
    const result = await apolloClient.query({
      query: GetEntityByIdDocument,
      variables: { id: key, type: entityType },
      fetchPolicy: "no-cache",
    });
    resolvedEntityValues.value = result.data?.Entity?.intialValues ?? undefined;
  } catch {
    resolvedEntityValues.value = undefined;
  }
};

const getEntitySourceValue = (subField: SubField): string => {
  const raw = resolvedEntityValues.value?.[subField.entitySourceKey as string];
  if (Array.isArray(raw)) return raw.join(", ");
  return raw ?? "";
};

// Track the row's relation key so the read-only columns refresh when the user picks
// another entity in the relation cell.
watch(
  () => props.item?.key,
  (key) => fetchEntitySourceValues(key as string | undefined),
  { immediate: true },
);
</script>
