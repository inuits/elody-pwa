<template>
  <div
    class="flex items-center justify-between"
    :class="[{ 'my-2': previewComponent.type !== PreviewTypes.ColumnList }]"
  >
    <base-tooltip
      v-if="previewComponent.type !== PreviewTypes.ColumnList"
      position="top-right"
      :tooltip-offset="8"
      @click="emit('closePreviewComponent')"
    >
      <template #activator="{ on }">
        <div class="flex items-center" v-on="on">
          <unicon
            class="cursor-pointer mr-4 ml-2 flex justify-center items-center"
            :name="Unicons.Cross.name"
            height="24"
          />
        </div>
      </template>
      <template #default>
        <span class="text-sm text-text-placeholder">
          <div>
            {{ t("preview-component.close") }}
          </div>
        </span>
      </template>
    </base-tooltip>
    <h1
      data-cy="entity-element-window-title"
      class="subtitle text-text-body p-2 text-center absolute left-1/2 transform -translate-x-1/2"
      v-if="previewComponent.title"
    >
      {{ t(previewComponent.title) }}
    </h1>
    <h1
      data-cy="entity-element-window-title"
      class="subtitle text-text-body p-2 text-center absolute left-1/2 transform -translate-x-1/2"
      v-if="previewComponent.type === PreviewTypes.MediaViewer"
    >
      {{ getTitleFromEntity }}
    </h1>
  </div>
  <div class="primary-preview">
    <entity-column
      :key="entityId"
      v-if="
        primaryPreviewElement &&
        previewComponent.type === PreviewTypes.ColumnList
      "
      :entity="getEntitiesOrEntity()"
      :column-list="primaryPreviewElement"
      :identifiers="[entityId]"
      :entity-type="entityType"
      :preview-label="getTitleFromEntity"
      @close-preview-component="emit('closePreviewComponent')"
    />
    <ViewModesMap
      v-else-if="previewComponent.type === PreviewTypes.Map"
      :config="configPerViewMode[ViewModes.ViewModesMap]"
      :entities="getEntitiesOrEntity()"
      :is-enabled-in-preview="true"
    />
    <MediaViewerPreview
      v-else-if="previewComponent.type === PreviewTypes.MediaViewer"
      :current-mediafile="getEntitiesOrEntity()"
      :mediafiles="entities"
      :entity-id="entityId"
      @toggle-preview-component="
        (id: string) => emit('togglePreviewComponent', id)
      "
    />
  </div>
  <div class="metadata-preview" v-if="metadataPreviewElement">
    <entity-column
      :key="entityId"
      :entity="getEntitiesOrEntity()"
      :column-list="metadataPreviewElement"
      :identifiers="[entityId]"
      :entity-type="entityType"
      :preview-label="getTitleFromEntity"
      @close-preview-component="emit('closePreviewComponent')"
    />
  </div>
</template>

<script setup lang="ts">
import {
  type ColumnList,
  type Entity,
  type Entitytyping,
  ListItemCoverageTypes,
  type PreviewComponent,
  PreviewTypes,
  ViewModes
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
import { Unicons } from "@/types";
import BaseTooltip from "@/components/base/BaseTooltip.vue";

const { t } = useI18n();
const { loadDocument } = useImport();
const { addMediafileSelectionStateContext } = useEntityMediafileSelector();

const props = withDefaults(
  defineProps<{
    previewComponent: PreviewComponent;
    entityType: Entitytyping;
    entities: Entity[];
    configPerViewMode: object;
    entityId: string | undefined;
  }>(),
  {},
);
const emit = defineEmits<{
  (event: "closePreviewComponent"): void;
  (event: "togglePreviewComponent", entityId: string): void;
}>();

provide("IsPreviewElement", true);
const primaryPreviewElement = ref<ColumnList | undefined>(undefined);
const metadataPreviewElement = ref<ColumnList | undefined>(undefined);

const fetchPreviewQuery = async () => {
  const document = await loadDocument(props.previewComponent.previewQuery!);
  apolloClient
    .query({
      query: document,
    })
    .then((result) => {
      primaryPreviewElement.value = result.data.PreviewElement;
    });
};

const fetchMetadataPreviewQuery = async () => {
  const document = await loadDocument(
    props.previewComponent.metadataPreviewQuery!,
  );
  apolloClient
    .query({
      query: document,
    })
    .then((result) => {
      metadataPreviewElement.value = result.data.PreviewElement;
    });
};

const getEntitiesOrEntity = (): Entity[] | Entity => {
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
    if (entity) return entity;
    else return [];
  }
};

const getTitleFromEntity = computed(() => {
  const entity = getEntitiesOrEntity();
  if (Array.isArray(entity)) return getTitleOrNameFromEntity(entity[0]);
  else return getTitleOrNameFromEntity(entity)
});

onMounted(async () => {
  if (props.previewComponent.previewQuery)
    await fetchPreviewQuery();
  if (props.previewComponent.metadataPreviewQuery)
    await fetchMetadataPreviewQuery();
});

watch(
  () => primaryPreviewElement.value,
  () => {
    if (primaryPreviewElement.value)
      addMediafileSelectionStateContext(
        primaryPreviewElement.value.column.elements.entityListElement
          .customQueryFilters,
      );
  },
  { immediate: true },
);
</script>

<style scoped></style>
