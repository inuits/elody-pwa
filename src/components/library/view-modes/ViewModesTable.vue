<template>
  <div
    class="h-full"
    :class="isPreviewElement ? 'preview-container' : 'parent-container'"
  >
    <div
      :key="'table-' + previewComponentEnabled"
      class="h-full"
      :class="
        previewComponentEnabled ? 'grid responsive-grid gap-x-2 mr-2' : ''
      "
    >
      <div
        v-if="showCurrentEntityFlow"
        data-cy="view-modes-table"
        class="h-full overflow-y-auto"
        :class="{ 'animate-pulse pointer-events-none': isRefetching }"
      >
        <div
          v-if="headerColumns.length > 0"
          class="sticky top-0 z-10 bg-background-light flex items-center gap-2 px-1.5 py-3 border-b-2 border-accent-highlight font-semibold text-sm text-text-body"
        >
          <div class="w-10 shrink-0" />

          <div v-if="anyEntityHasThumbnail" class="w-10 shrink-0" />

          <div class="flex-1 flex items-center">
            <div
              v-for="(col, idx) in headerColumns"
              :key="'header-' + idx"
              :class="headerColumnClass(idx)"
            >
              {{ col.label ? t(col.label) : "" }}
            </div>
          </div>

          <div class="w-8 shrink-0" />

          <div class="w-8 shrink-0" />
        </div>

        <component
          v-for="entity in processedEntities"
          :key="entity.id + '_table'"
          :is="entity.componentTag"
          :to="entity.componentPath"
          class="list-item-table"
          @click="entityWrapperHandler(entity.originalEntity)"
          v-memo="entity.memoKey"
        >
          <TableViewRow
            :item-id="entity.id"
            :item-type="entity.type"
            :bulk-operations-context="bulkOperationsContext"
            :context-menu-actions="entity.contextMenu"
            :entityTypename="entity.entityTypename"
            :teaser-metadata="entity.teaserMetadata"
            :intialValues="entity.intialValues"
            :relationValues="entity.relationValues"
            :media="entity.media"
            :thumb-icon="entity.thumbIcon"
            :is-media-type="entity.isMediaType"
            :loading="entitiesLoading"
            :is-disabled="entity.isDisabled"
            :relation="entity.relation"
            :parent-entity-id="parentEntityIdentifiers[0]"
            :relation-type="relationType"
            :has-selection="enableSelection"
            :base-library-mode="baseLibraryMode"
            :has-thumbnail="anyEntityHasThumbnail"
            :col-min-widths="colMinWidths"
            :refetch-entities="refetchEntities"
            :preview-component-enabled="previewComponentEnabled"
            :preview-component-current-active="entity.isPreviewActive"
            :preview-component-feature-enabled="previewComponent !== undefined"
            :preview-component-list-items-coverage="
              previewComponent?.listItemsCoverage
            "
            @toggle-preview-component="
              (previewForEntityId) => togglePreviewComponent(previewForEntityId)
            "
          />
        </component>
      </div>

      <div
        v-if="
          previewComponentEnabled &&
          refEntities?.find((entity) => entity.id === previewForEntity)
        "
        class="my-2 h-fit max-h-[80vh] overflow-y-auto bg-background-light rounded-lg"
      >
        <PreviewWrapper
          :preview-component="previewComponent!"
          :entity-type="entityType"
          :entities="refEntities"
          :entities-loading="entitiesLoading"
          :config-per-view-mode="configPerViewMode"
          :entity-id="previewForEntity"
          :parent-ids="parentEntityIdentifiers"
          :cropMediafileCoordinatesKey="cropMediafileCoordinatesKey"
          @close-preview-component="closePreviewComponent"
          @toggle-preview-component="(id) => togglePreviewComponent(id)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Context } from "@/composables/useBulkOperations";
import {
  BaseLibraryModes,
  type Entity,
  Entitytyping,
  MediaTypeEntities,
  type Metadata,
  RelationActions,
} from "@/generated-types/queries";
import TableViewRow from "@/components/library/view-modes/TableViewRow.vue";
import PreviewWrapper from "@/components/previews/PreviewWrapper.vue";
import { useListItemHelper } from "@/composables/useListItemHelper";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import { formatTeaserMetadata, getMappedSlug } from "@/helpers";
import { computed, ref, watch } from "vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useI18n } from "vue-i18n";
import { usePreviewComponent } from "@/components/library/view-modes/composables/usePreviewComponent";
import { useEntityListHelpers } from "@/components/library/view-modes/composables/useEntityListHelpers";
import { useEntityPageConfig } from "@/composables/useEntityPageConfig";
import { useSeenItems } from "@/composables/useSeenItems";

const props = withDefaults(
  defineProps<{
    entities: Entity[];
    entitiesLoading: boolean;
    bulkOperationsContext: Context | undefined;
    listItemRouteName: string;
    enableNavigation?: boolean;
    parentEntityIdentifiers?: string[];
    idsOfNonSelectableEntities?: string[];
    relationType?: string;
    enableSelection: boolean;
    baseLibraryMode?: BaseLibraryModes;
    allowedActionsOnRelations?: RelationActions[];
    entityType: Entitytyping;
    configPerViewMode: object;
    showCurrentEntityFlow?: boolean;
    refetchEntities?: () => Promise<void>;
    cropMediafileCoordinatesKey?: string;
  }>(),
  {
    enableNavigation: true,
    parentEntityIdentifiers: () => [],
    idsOfNonSelectableEntities: () => [],
    enableSelection: true,
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
    allowedActionsOnRelations: () => [],
    showCurrentEntityFlow: true,
    refetchEntities: undefined,
    cropMediafileCoordinatesKey: "",
  },
);

const { t } = useI18n();
const { getMediaFilenameFromEntity } = useListItemHelper();
const { getThumbnail } = useThumbnailHelper();
const { findRelation } = useFormHelper();

const refEntities = ref<Entity[]>(props.entities);
const colMinWidths = ref<string[]>([]);

const {
  previewComponent,
  previewComponentEnabled,
  previewForEntity,
  togglePreviewComponent,
  closePreviewComponent,
  isPreviewComponentEnabledForListItem,
} = usePreviewComponent(props, refEntities);

const {
  containerNameForPreview,
  getLinkSettings,
  isEntityDisabled,
  entityWrapperHandler,
  getContextMenu,
  isPreviewElement,
} = useEntityListHelpers(
  props,
  refEntities,
  previewComponentEnabled,
  togglePreviewComponent,
);

const { trackSeen } = useEntityPageConfig();
const { isItemSeen } = useSeenItems();

const isRefetching = computed(
  () => props.entitiesLoading && refEntities.value.length > 0,
);

// Whether any entity has a thumbnail — drives both header spacer and TableRow thumbnail cell
const anyEntityHasThumbnail = computed(() =>
  processedEntities.value.some((e) => e.media || e.isMediaType),
);

// Header column definitions from first entity's metadata
const headerColumns = computed(() => {
  const first = refEntities.value[0];
  if (!first?.teaserMetadata) return [];

  const metadata = formatTeaserMetadata(
    first.teaserMetadata,
    first.intialValues,
    false,
  );
  if (!Array.isArray(metadata)) return [];

  const visibleMetadata = (metadata as Metadata[]).filter(
    (m) => m.label && !m.showOnlyInEditMode,
  );

  const targetMetadata = previewComponentEnabled.value
    ? visibleMetadata.slice(0, 1)
    : visibleMetadata;

  return targetMetadata.map(({ key, label, value }) => ({
    key,
    label,
    hasFormatter: !!(value as any)?.formatter,
  }));
});

const measureColWidths = () => {
  const docStyle = getComputedStyle(document.documentElement);
  const fontSizePx = Math.round(parseFloat(docStyle.fontSize) * 0.875);
  const font = `600 ${fontSizePx}px ${docStyle.fontFamily}`;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  colMinWidths.value = headerColumns.value.map((col) => {
    if (!ctx || !col.label) return "";
    ctx.font = font;
    return `${Math.ceil(ctx.measureText(t(col.label)).width)}px`;
  });
};

const headerColumnClass = (idx: number): string => {
  const base = "flex justify-start flex-col mx-2 break-words";
  const pos = idx === 0 ? "col-primary" : "col-secondary";
  if (headerColumns.value[0]?.hasFormatter) {
    if (idx === 0) return `${base} ${pos} flex-shrink-0 whitespace-nowrap`;
    return `${base} ${pos} flex-1 min-w-0`;
  }
  const count = headerColumns.value.length;
  const amount: string | number = count >= 4 ? "default" : count;
  const widths: Record<string | number, string> = {
    1: "w-full",
    2: "w-1/3",
    3: "w-1/2",
    default: "w-1/4",
  };
  return `${base} ${pos} ${widths[amount]}`;
};

const processedEntities = computed(() => {
  const previewEnabled = previewComponentEnabled.value;
  const parentId = props.parentEntityIdentifiers[0];
  const rType = props.relationType;

  return refEntities.value.map((entity) => {
    const linkSettings = getLinkSettings(entity, props.listItemRouteName);
    const forcedLinkSettings = getLinkSettings(
      entity,
      props.listItemRouteName,
      true,
    );

    const relation = findRelation(entity.id, rType as string, parentId);
    const isPreviewActive = isPreviewComponentEnabledForListItem(entity.id);
    const isDisabled = isEntityDisabled(entity) || (trackSeen.value && isItemSeen(entity.id));
    const formattedMetadata = formatTeaserMetadata(
      entity.teaserMetadata,
      entity.intialValues,
      previewEnabled,
    );
    const mediaFilename = getMediaFilenameFromEntity(entity);
    const thumbnail = getThumbnail(entity);
    const contextMenu = getContextMenu(entity);

    const memoKey = [
      entity.intialValues,
      entity.teaserMetadata,
      entity.relationValues,
      relation,
      isPreviewActive,
      isDisabled,
      previewEnabled,
    ];

    return {
      originalEntity: entity,
      id: entity.id,
      type: entity.type,
      componentTag: linkSettings.tag,
      componentPath: linkSettings.path,
      forcedNavigationPath: forcedLinkSettings.path,
      contextMenu,
      entityTypename: getMappedSlug(entity),
      teaserMetadata: formattedMetadata,
      intialValues: entity.intialValues,
      relationValues: entity.relationValues,
      media: mediaFilename,
      thumbIcon: thumbnail,
      isMediaType: Object.values(MediaTypeEntities).includes(
        entity.type?.toLowerCase(),
      ),
      isMarkable:
        props.allowedActionsOnRelations.includes(
          RelationActions.RemoveRelation,
        ) && props.parentEntityIdentifiers.length > 0,
      isDisabled,
      relation,
      isPreviewActive,
      memoKey,
    };
  });
});

watch(headerColumns, measureColWidths, { immediate: true });
watch(
  () => props.entities,
  (newValue) => {
    refEntities.value = newValue;
  },
);
</script>

<style scoped>
.parent-container {
  container-type: inline-size;
  container-name: parent;
}

.preview-container {
  container-type: inline-size;
  container-name: preview;
  container-name: v-bind(containerNameForPreview);
}

@container parent (min-width: 500px) {
  .responsive-grid {
    grid-template-columns: 40% 60%;
  }
}
@container parent (min-width: 630px) {
  .responsive-grid {
    grid-template-columns: 35% 65%;
  }
}
@container parent (min-width: 830px) {
  .responsive-grid {
    grid-template-columns: 30% 70%;
  }
}
@container parent (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: 25% 75%;
  }
}

@container preview (min-width: 450px) {
  .responsive-grid {
    grid-template-columns: 40% 60%;
  }
}
@container preview (min-width: 550px) {
  .responsive-grid {
    grid-template-columns: 35% 65%;
  }
}
@container preview (min-width: 755px) {
  .responsive-grid {
    grid-template-columns: 25% 75%;
  }
}

@container preview-without-current-entity-flow (min-width: 10px) {
  .responsive-grid {
    grid-template-columns: 100%;
  }
}

.list-item-table {
  content-visibility: auto;
  contain-intrinsic-size: 46px;
}

@container parent (max-width: 640px) {
  .col-primary,
  .col-secondary {
    flex: 1;
    width: auto;
    min-width: 0;
  }
  .col-secondary:last-child {
    display: none;
  }
}
@container parent (max-width: 520px) {
  .col-secondary:nth-last-child(-n+2) {
    display: none;
  }
}
@container parent (max-width: 400px) {
  .col-secondary {
    display: none;
  }
}
</style>
