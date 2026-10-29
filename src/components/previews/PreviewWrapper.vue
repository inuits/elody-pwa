<template>
  <!-- preview-panel.md: the shared panel shell; one header with the title,
       "Open detail page" and the close cross. -->
  <section
    role="complementary"
    :aria-labelledby="titleId"
    class="border border-border-panel rounded-card bg-surface overflow-hidden"
    @keydown.esc.stop="close"
  >
    <header
      ref="header"
      data-cy="preview-header"
      tabindex="-1"
      class="flex items-center gap-2 p-(--panel-header-pad) bg-surface-panel-header outline-none"
    >
      <h3
        :id="titleId"
        data-cy="preview-title"
        aria-live="polite"
        class="flex-1 min-w-0 truncate text-(length:--text-panel-title) font-bold text-text-panel-header"
      >
        {{ title }}
      </h3>
      <BaseButtonNew
        v-if="detailPath"
        data-cy="preview-open-detail"
        class="!w-auto shrink-0"
        button-style="primary"
        button-size="sm"
        :label="t('preview-component.open-detail-page')"
        @click="router.push(detailPath)"
      />
      <BaseButtonNew
        data-cy="close-preview-component"
        class="!w-auto shrink-0"
        button-style="ghost"
        button-size="sm"
        :icon="DamsIcons.Cross"
        :aria-label="t('preview-component.close')"
        @click="close"
      />
    </header>
  <div
    v-if="previewLoading"
    data-cy="preview-loading"
    class="flex justify-center items-center py-8"
  >
    <spinner-loader theme="accent" :dimensions="10" />
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
      :parent-entity-id="parentIds?.[0]"
      :parent-entity-type="parentEntityType"
      :relation-type="relationType"
      :refetch-entities="refetchEntities"
      @toggle-preview-component="
        (id: string) => emit('togglePreviewComponent', id)
      "
    />
  </div>
  <!-- ui_kits/clients: a hairline under the viewer, then the label/value
       rows inside the same panel. -->
  <div
    class="metadata-preview mx-4 mt-2 mb-3.5 border-t border-border-subtle pt-2"
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
      compact
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
    />
  </div>
  </section>
</template>

<script setup lang="ts">
import {
  type ColumnList,
  DamsIcons,
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
import type { RouteLocationRaw } from "vue-router";
import { computed, nextTick, onMounted, provide, ref, useId, watch } from "vue";
import { useImport } from "@/composables/useImport";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import EntityColumn from "@/components/EntityColumn.vue";
import { getTitleOrNameFromEntity } from "@/helpers";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
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
    relationType?: string;
    parentEntityType?: Entitytyping;
    refetchEntities?: () => Promise<void>;
    // Set when the list navigates to its entities; shows "Open detail page".
    detailPath?: RouteLocationRaw;
  }>(),
  {},
);
const emit = defineEmits<{
  (event: "closePreviewComponent"): void;
  (event: "togglePreviewComponent", entityId: string): void;
}>();

provide("IsPreviewElement", true);
provide("OwnsRouteState", false);
provide(
  "showCurrentPreviewFlow",
  props.previewComponent.showCurrentPreviewFlow,
);
const previewedEntity = computed<Entity | undefined>(() =>
  props.entities.find((entity) => entity.id === props.entityId),
);
provide("ParentEntityProvider", previewedEntity);

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

const title = computed<string>(() =>
  props.previewComponent.title
    ? t(props.previewComponent.title)
    : getTitleFromEntity.value,
);
const titleId = useId();
const header = ref<HTMLElement>();

// Focus moves to the header on open and back to the row's eye on close.
// Opening re-renders the list, so the eye is looked up again by entity id;
// the original opener is the fallback.
let opener: HTMLElement | null = null;
const close = async () => {
  const entityId = props.entityId;
  emit("closePreviewComponent");
  await nextTick();
  const eye = [
    ...document.querySelectorAll<HTMLElement>("[data-preview-for]"),
  ].find(
    (element) =>
      element.dataset.previewFor === entityId &&
      // the other view mode stays mounted behind v-show
      !element.closest('[style*="display: none"]'),
  );
  (eye ?? opener)?.focus();
};

onMounted(async () => {
  opener = document.activeElement as HTMLElement | null;
  // Opened from a control (the eye): move focus. Opened by default on page
  // load: nothing had focus, so leave it alone.
  if (opener && opener !== document.body)
    header.value?.focus({ preventScroll: true });
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

<style scoped></style>
