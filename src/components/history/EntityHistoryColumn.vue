<template>
  <div class="w-full flex flex-col gap-4 px-5">
    <div v-for="column in columns" :key="column.key">
      <entity-history-element
        :elements="column.value.elements || {}"
        :element-order="elementOrderByColumn[column.key] || []"
        :entity="entity"
        :relation-diffs="relationDiffs"
        :wysiwyg-diffs="wysiwygDiffs"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, provide, watch } from "vue";
import EntityHistoryElement from "@/components/history/EntityHistoryElement.vue";
import { useEditMode } from "@/composables/useEdit";
import { useFormHelper } from "@/composables/useFormHelper";
import { deepToRaw } from "@/utils/deepToRaw";
import type {
  RelationDiff,
  WysiwygDiff,
} from "@/composables/useHistoryComparisonData";

const props = withDefaults(
  defineProps<{
    entity: {
      id: string;
      uuid?: string;
      entityView?: Record<string, any>;
      intialValues?: Record<string, any>;
      relationValues?: Record<string, any>;
    };
    wysiwygDiffs: WysiwygDiff[];
    relationDiffs: RelationDiff[];
    columnOrder?: string[];
    elementOrderByColumn?: Record<string, string[]>;
  }>(),
  {
    columnOrder: () => [],
    elementOrderByColumn: () => ({}),
  },
);

provide(
  "ParentEntityProvider",
  computed(() => props.entity),
);

useEditMode(props.entity.id);

const formValuesFor = (entity: typeof props.entity) => ({
  intialValues: structuredClone(deepToRaw(entity.intialValues ?? {})),
  relationValues: structuredClone(deepToRaw(entity.relationValues ?? {})),
  relationMetadata: {},
  relatedEntityData: { metadata: {}, relations: {} },
  uuid: entity.uuid,
});

if (props.entity.id) {
  const form = useFormHelper().createForm(
    props.entity.id,
    formValuesFor(props.entity),
  );
  watch(
    () => [props.entity.intialValues, props.entity.relationValues],
    () => form.resetForm({ values: formValuesFor(props.entity) }),
  );
}

const omitIdMetadata = (value: any): any => {
  if (Array.isArray(value)) return value.map(omitIdMetadata);
  if (!value || typeof value !== "object") return value;

  const result: Record<string, any> = {};
  for (const key in value) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
    const child = value[key];
    if (child?.__typename === "PanelMetaData" && child.key === "id") continue;
    if (child?.hideInHistory === true) continue;
    result[key] = omitIdMetadata(child);
  }
  return result;
};

const columns = computed(() => {
  const omitted = omitIdMetadata(props.entity.entityView) || {};
  const orderedKeys = props.columnOrder.length
    ? props.columnOrder
    : Object.keys(omitted);
  const extraKeys = Object.keys(omitted).filter(
    (key) => !orderedKeys.includes(key),
  );
  return [...orderedKeys, ...extraKeys]
    .map((key) => ({ key, value: omitted[key] }))
    .filter(({ value }) => value && typeof value === "object");
});
</script>
