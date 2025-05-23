<template>
  <div>
    <h1
      data-cy="entity-element-window-title"
      class="subtitle text-text-body p-2 text-center"
      v-if="previewComponent.title"
    >
      {{ t(previewComponent.title) }}
    </h1>
    <h1
      data-cy="entity-element-window-title"
      class="subtitle text-text-body p-2 text-center"
      v-if="previewComponent.type === PreviewTypes.MediaViewer"
    >
      {{ getTitleFromEntity }}
    </h1>
  </div>
  <entity-column
    :key="entityId"
    v-if="previewElement && previewComponent.type === PreviewTypes.ColumnList"
    :id="entityId"
    :column-list="previewElement"
    :identifiers="[entityId]"
    :entity-type="entityType"
    :preview-label="getTitleFromEntity"
  />
  <ViewModesMap
    v-else-if="previewComponent.type === PreviewTypes.Map"
    :config="configPerViewMode[ViewModes.ViewModesMap]"
    :entities="getEntitiesOrEntity()"
    :is-enabled-in-preview="true"
  />
  <MediaViewerPreview
    v-else-if="previewComponent.type === PreviewTypes.MediaViewer"
    :mediafiles="getEntitiesOrEntity()"
    :entity-id="entityId"
  />
</template>

<script setup lang="ts">
import {
  type ColumnList,
  type Entity,
  ListItemCoverageTypes,
  type PreviewComponent,
  PreviewTypes,
  ViewModes,
} from "@/generated-types/queries";
import ViewModesMap from "@/components/library/view-modes/ViewModesMap.vue";
import MediaViewerPreview from "@/components/previews/MediaViewerPreview.vue";
import { useI18n } from "vue-i18n";
import { computed, onMounted, provide, ref, watch } from "vue";
import { useImport } from "@/composables/useImport";
import { apolloClient } from "@/main";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import EntityColumn from "@/components/EntityColumn.vue";
import { getTitleOrNameFromEntity } from "@/helpers";

const { t } = useI18n();
const { loadDocument } = useImport();
const { addMediafileSelectionStateContext } = useEntityMediafileSelector();

const props = withDefaults(
  defineProps<{
    previewComponent: PreviewComponent;
    entityType: string;
    entities: Entity[];
    configPerViewMode: object;
    entityId: string | undefined;
  }>(),
  {
  },
);

provide("IsPreviewElement", true);
const previewElement = ref<ColumnList | undefined>(undefined);

const fetchPreviewQuery = async () => {
  const document = await loadDocument(props.previewComponent.previewQuery!);
  apolloClient
    .query({
      query: document,
    })
    .then((result) => {
      previewElement.value = result.data.PreviewElement;
    });
}

const getEntitiesOrEntity = (): Entity[] | [] => {
  if (
    props.previewComponent.listItemsCoverage ===
    ListItemCoverageTypes.AllListItems
  )
    return props.entities;
  if (
    props.previewComponent.listItemsCoverage ===
    ListItemCoverageTypes.OneListItem
  ) {
    const entity = props.entities.find(
      (entity) => entity.id === props.entityId,
    );
    if (entity) return [entity];
    else return [];
  }
};

const getTitleFromEntity = computed(() => {
  const entity: Entity = getEntitiesOrEntity()[0];
  return getTitleOrNameFromEntity(entity);
});

onMounted(async () => {
  if (props.previewComponent.previewQuery)
    await fetchPreviewQuery();
});

watch(
  () => previewElement.value,
  () => {
    if (previewElement.value)
      addMediafileSelectionStateContext(previewElement.value.column.elements.entityListElement.customQueryFilters);
  },
  { immediate: true }
);
</script>

<style scoped></style>