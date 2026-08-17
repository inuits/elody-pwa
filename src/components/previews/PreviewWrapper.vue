<template>
  <!--
    The preview is a panel like any other, so it wears the shared panel shell:
    accent-light header, title left, actions right (preview-panel.md). It is a
    complementary region named by the entity it is showing, and its body
    announces politely when a different row swaps the content underneath it.
  -->
  <BasePanelShell
    data-cy="entity-element-window-title"
    heading-level="h2"
    landmark="complementary"
    :title="headerTitle"
  >
    <template #actions>
      <base-button
        v-if="displayOpenDetailPageButton"
        data-cy="open-detail-page-button"
        button-size="sm"
        button-style="primary"
        :label="t('metadata.labels.open-detail-page')"
        @click="openDetailPage"
      />
      <button
        v-if="showHeaderCloseButton"
        type="button"
        data-cy="close-preview-component"
        class="preview-header__close"
        :aria-label="t('preview-component.close')"
        @click="emit('closePreviewComponent')"
      >
        <unicon :name="Unicons.Cross.name" height="20" />
      </button>
    </template>
  <div
    v-if="previewLoading"
    data-cy="preview-loading"
    class="flex justify-center items-center py-8"
  >
    <spinner-loader theme="accent" :dimensions="10" />
  </div>
  <div class="primary-preview" aria-live="polite">
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
      :map-type="
        getBasicMapProperties(configPerViewMode[ViewModes.ViewModesMap]).mapType
      "
      :config="configPerViewMode[ViewModes.ViewModesMap]"
      :entities="getEntitiesOrEntity()"
      :is-enabled-in-preview="true"
    />
    <MediaViewerPreview
      v-else-if="previewComponent.type === PreviewTypes.MediaViewer"
      :current-mediafile="getEntitiesOrEntity()"
      :mediafiles="entities"
      :mediafiles-loading="entitiesLoading"
      :entity-id="entityId"
      :cropMediafileCoordinatesKey="cropMediafileCoordinatesKey"
      @toggle-preview-component="
        (id: string) => emit('togglePreviewComponent', id)
      "
    />
  </div>
  <div
    class="metadata-preview"
    v-if="
      metadataPreviewElement && previewComponent.type !== PreviewTypes.History
    "
  >
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
  <div
    class="metadata-preview"
    v-if="
      metadataPreviewElement && previewComponent.type === PreviewTypes.History
    "
  >
    <HistoryDiffPreview
      :key="entityId"
      :entity="getEntitiesOrEntity()"
      :column-list="metadataPreviewElement"
      :entity-id="entityId"
      :entities="entities"
      :entity-type="entityType"
      :parent-entity-id="parentIds[0]"
      @close-preview-component="emit('closePreviewComponent')"
    />
  </div>
  </BasePanelShell>
</template>

<script setup lang="ts">
import {
  type ColumnList,
  type Entity,
  type Entitytyping,
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
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import EntityColumn from "@/components/EntityColumn.vue";
import { getTitleOrNameFromEntity, goToEntityPage } from "@/helpers";
import { Unicons } from "@/types";
import BaseButton from "@/components/base/BaseButton.vue";
import BasePanelShell from "@/components/base/BasePanelShell.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { useMaps } from "@/composables/useMaps";
import { apolloClient, router } from "@/main";
import HistoryDiffPreview from "./HistoryDiffPreview.vue";

const { t } = useI18n();
const { loadDocument } = useImport();
const { addMediafileSelectionStateContext } = useEntityMediafileSelector();
const { getBasicMapProperties } = useMaps();

const props = withDefaults(
  defineProps<{
    previewComponent: PreviewComponent;
    entityType: Entitytyping;
    entities: Entity[];
    entitiesLoading: boolean;
    configPerViewMode: object;
    entityId: string | undefined;
    parentIds: string[];
    cropMediafileCoordinatesKey: string;
  }>(),
  {},
);
const emit = defineEmits<{
  (event: "closePreviewComponent"): void;
  (event: "togglePreviewComponent", entityId: string): void;
}>();

provide("IsPreviewElement", true);
provide(
  "showCurrentPreviewFlow",
  props.previewComponent.showCurrentPreviewFlow,
);
const primaryPreviewElement = ref<ColumnList | undefined>(undefined);
const metadataPreviewElement = ref<ColumnList | undefined>(undefined);
const previewLoading = ref<boolean>(false);

const fetchPreviewQuery = async () => {
  const queryName = props.previewComponent.previewQuery!;
  const document = await loadDocument(queryName);
  if (!document) {
    console.error(
      `PreviewWrapper: could not load preview query document "${queryName}". ` +
        `Make sure previewQuery references an existing query name (not a fragment).`,
    );
    return;
  }
  const result = await apolloClient.query({ query: document });
  primaryPreviewElement.value = result.data.PreviewElement;
};

const fetchMetadataPreviewQuery = async () => {
  const queryName = props.previewComponent.metadataPreviewQuery!;
  const document = await loadDocument(queryName);
  if (!document) {
    console.error(
      `PreviewWrapper: could not load metadata preview query document "${queryName}". ` +
        `Make sure metadataPreviewQuery references an existing query name (not a fragment).`,
    );
    return;
  }
  const result = await apolloClient.query({ query: document });
  metadataPreviewElement.value = result.data.PreviewElement;
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
  else return getTitleOrNameFromEntity(entity);
});

/** A configured title wins; otherwise the panel is named by its entity. */
const headerTitle = computed<string>(() =>
  props.previewComponent.title
    ? t(props.previewComponent.title)
    : getTitleFromEntity.value,
);

// A primary ColumnList preview renders its own close button deeper down
// (inside the entity list's EntityElementWrapper). Every other case —
// MediaViewer, Map, History, and metadata-only previews — relies on this
// header button instead.
const isPrimaryColumnListPreview = computed<boolean>(
  () =>
    props.previewComponent.type === PreviewTypes.ColumnList &&
    !!primaryPreviewElement.value,
);

const showHeaderCloseButton = computed<boolean>(
  () => !isPrimaryColumnListPreview.value,
);

const displayOpenDetailPageButton = computed<boolean>(
  () =>
    props.previewComponent.previewConfiguration?.displayOpenDetailPageButton ===
    true,
);

const openDetailPage = (): void => {
  const entity = props.entities.find((item) => item.id === props.entityId);
  if (!entity) return;
  goToEntityPage(entity, "SingleEntity", router);
};

onMounted(async () => {
  const hasPreviewQuery =
    props.previewComponent.previewQuery ||
    props.previewComponent.metadataPreviewQuery;
  if (!hasPreviewQuery) return;

  previewLoading.value = true;
  try {
    if (props.previewComponent.previewQuery) await fetchPreviewQuery();
    if (props.previewComponent.metadataPreviewQuery)
      await fetchMetadataPreviewQuery();
  } finally {
    previewLoading.value = false;
  }
});

watch(
  () => primaryPreviewElement.value,
  () => {
    if (primaryPreviewElement.value) {
      addMediafileSelectionStateContext(
        primaryPreviewElement.value.column.elements.entityListElement
          .customQueryFilters,
      );
    }
  },
  { immediate: true },
);
</script>

<style scoped>
/* Header chrome comes from BasePanelShell; only the close control is the
   preview's own. */
.preview-header__close {
  display: inline-flex;
  padding: var(--spacing-ds-1);
  border-radius: var(--radius-input);
  color: var(--color-text-panel-header);
}

.preview-header__close:hover {
  background-color: var(--color-surface-editable-hover);
  color: var(--color-text-body);
}

.preview-header__close:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}
</style>
