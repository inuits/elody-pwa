<template>
  <parent-entity-scope
    v-if="relatedEntity && fieldsColumnList"
    :entity="relatedEntity"
  >
    <entity-column
      :key="relatedEntity.id"
      :entity="relatedEntity"
      :column-list="fieldsColumnList"
      :identifiers="[relatedEntity.id]"
      :entity-type="changesPreview.entityType"
    />
  </parent-entity-scope>
  <div v-if="listsColumnList" :class="{ 'mt-4': fieldsColumnList }">
    <entity-column
      :key="entity.id"
      :entity="entity"
      :column-list="listsColumnList"
      :identifiers="[entity.id]"
      :entity-type="entity.type as Entitytyping"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import {
  type ChangesPreview,
  type ColumnList,
  type Entity,
  type Entitytyping,
  GetEntityByIdDocument,
  type GetEntityByIdQuery,
  type GetEntityByIdQueryVariables,
} from "@/generated-types/queries";
import EntityColumn from "@/components/EntityColumn.vue";
import { useImport } from "@/composables/useImport";
import { apolloClient } from "@/main";
import {
  filterColumnListByKeys,
  pickColumnElements,
} from "@/components/previews/filterColumnListByKeys";
import ParentEntityScope from "@/components/previews/ParentEntityScope.vue";

const props = defineProps<{
  changesPreview: ChangesPreview;
  entity: Entity;
}>();

const { loadDocument } = useImport();
const columnList = ref<ColumnList | undefined>(undefined);

const relatedEntityId = computed<string | undefined>(
  () =>
    (props.entity as any)?.relationValues?.[
      props.changesPreview.relationType
    ]?.[0]?.key,
);

const changedKeys = computed<string[]>(() => {
  const value = (props.entity as any)?.intialValues?.[
    props.changesPreview.changedKeysKey
  ];
  return Array.isArray(value) ? value : value ? [value] : [];
});

const { result } = useQuery<GetEntityByIdQuery, GetEntityByIdQueryVariables>(
  GetEntityByIdDocument,
  () => ({ id: relatedEntityId.value!, type: props.changesPreview.entityType }),
  () => ({ enabled: !!relatedEntityId.value, fetchPolicy: "no-cache" }),
);
const relatedEntity = computed<Entity | undefined>(() => {
  const entity = result.value?.Entity as Entity | undefined;
  return entity ? { ...entity, id: `${entity.id}_changes` } : undefined;
});

const filteredColumnList = computed(() =>
  columnList.value
    ? filterColumnListByKeys(
        columnList.value,
        changedKeys.value,
        (props.entity as any)?.relationValues ?? {},
      )
    : null,
);
const isWindowElement = (element: any) =>
  element.__typename === "WindowElement";
const fieldsColumnList = computed(() =>
  filteredColumnList.value
    ? pickColumnElements(filteredColumnList.value, isWindowElement)
    : null,
);
const listsColumnList = computed(() =>
  filteredColumnList.value
    ? pickColumnElements(filteredColumnList.value, (e) => !isWindowElement(e))
    : null,
);

onMounted(async () => {
  const document = await loadDocument(props.changesPreview.query);
  if (!document) {
    console.error(
      `ChangesPreview: could not load query document "${props.changesPreview.query}".`,
    );
    return;
  }
  const response = await apolloClient.query({ query: document });
  columnList.value = response.data.PreviewElement;
});
</script>
