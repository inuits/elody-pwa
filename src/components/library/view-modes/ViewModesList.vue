<template>
  <div
    class="h-full"
    :class="isPreviewElement ? 'preview-container' : 'parent-container'"
  >
    <div
      :key="mode + '-' + previewComponentEnabled"
      class="h-full"
      :class="
        previewComponentEnabled ? 'grid responsive-grid gap-x-2 mr-2' : ''
      "
    >
      <div
        v-if="showCurrentEntityFlow"
        data-cy="view-modes-list"
        :class="[
          'h-full overflow-y-auto',
          {
            'grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-2 justify-items-start items-start max-w-full':
              mode === 'grid',
          },
        ]"
      >
        <!-- entity-list-element.md: list mode gets a column-header row when
             every row shares its fields. -->
        <div v-if="columnLabels" ref="listHeader">
          <ListColumnHeader
            :labels="columnLabels"
            :cell-styles="headerCellStyles"
            :checkbox-style="headerCheckboxStyle"
            :selectable="
              enableSelection &&
              baseLibraryMode === BaseLibraryModes.NormalBaseLibrary
            "
            :all-selected="pageIsSelected"
            @toggle-page-selection="
              (selected) => emit('togglePageSelection', selected)
            "
          />
        </div>
        <div v-if="Array.isArray(relations)">
          <div
            v-show="!disablePreviews"
            v-for="item in filteredRelations"
            :key="item.key"
            :class="[
              mode === 'list' ? 'list-item-list' : 'list-item-grid',
              { 'list-item-list-multi-line': mode === 'list' && multiLine },
            ]"
            v-memo="[item.key, item.editStatus, mode, entitiesLoading]"
          >
            <ListItem
              :key="item.key + '_preview'"
              :item-id="item.key"
              :bulk-operations-context="bulkOperationsContext"
              :teaser-metadata="
                getTeaserMetadataInState(item.key) as Metadata[]
              "
              :thumb-icon="entitiesLoading ? undefined : getThumbnail(item)"
              :small="listItemRouteName === 'SingleMediafile'"
              :is-preview="true"
              :is-markable-as-to-be-deleted="parentEntityIdentifiers.length > 0"
              :relation="
                findRelation(
                  item.key,
                  relationType,
                  props.parentEntityIdentifiers[0],
                )
              "
              :relation-type="relationType"
              :has-selection="enableSelection"
              :view-mode="mode"
              :multi-line="multiLine"
              :multi-line-columns="multiLineColumns"
              :hide-labels="!!columnLabels"
            />
          </div>
        </div>
        <component
          v-for="entity in processedEntities"
          :key="entity.id + '_list'"
          :is="entity.componentTag"
          :to="entity.componentPath"
          :class="[
            mode === 'list' ? 'list-item-list' : 'list-item-grid',
            { 'list-item-list-multi-line': mode === 'list' && multiLine },
          ]"
          @click="
            () => {
              if (actionOnClick === ActionOnClick.OpenInModal)
                openEntityInModal(entity.id, entity.type);
              else entityWrapperHandler(entity.originalEntity);
            }
          "
          v-memo="[entity.memoKey, !!columnLabels]"
        >
          <ListItem
            :item-id="entity.id"
            :item-type="entity.type"
            :bulk-operations-context="bulkOperationsContext"
            :buttons="entity.buttons"
            :entityTypename="entity.entityTypename"
            :teaser-metadata="entity.teaserMetadata"
            :intialValues="entity.intialValues"
            :relationValues="entity.relationValues"
            :media="entity.media"
            :thumb-icon="entity.thumbIcon"
            :is-media-type="entity.isMediaType"
            :small="listItemRouteName === 'SingleMediafile'"
            :loading="entitiesLoading"
            :is-markable-as-to-be-deleted="entity.isMarkable"
            :is-disabled="entity.isDisabled"
            :relation="entity.relation"
            :relation-type="relationType"
            :has-selection="enableSelection"
            :base-library-mode="baseLibraryMode"
            :is-enable-navigation="actionOnClick === ActionOnClick.Navigate"
            :entity-list-elements="entityListElements"
            :view-mode="mode"
            :refetch-entities="refetchEntities"
            :preview-component-enabled="previewComponentEnabled"
            :preview-component-current-active="entity.isPreviewActive"
            :preview-open="entity.isPreviewOpen"
            :hide-labels="!!columnLabels"
            :preview-component-feature-enabled="previewComponent !== undefined"
            :preview-component-list-items-coverage="
              previewComponent?.listItemsCoverage
            "
            :is-primary-mediafile="primaryMediafileId === entity.id"
            :is-primary-thumbnail="primaryThumbnailId === entity.id"
            :multi-line="multiLine"
            :multi-line-columns="multiLineColumns"
            @toggle-preview-component="
              (previewForEntityId) => togglePreviewComponent(previewForEntityId)
            "
            @add-refetch-function-to-edit-state="
              () => emit('addRefetchFunctionToEditState')
            "
          />
        </component>
      </div>
      <div
        v-if="
          previewComponentEnabled &&
          refEntities?.find((entity) => entity.id === previewForEntity)
        "
        class="my-2 h-fit max-h-[80vh] overflow-y-auto rounded-card"
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
          :relation-type="relationType"
          :parent-entity-type="parentEntityType"
          :refetch-entities="refetchEntities"
          :detail-path="previewDetailPath"
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
  ActionOnClick,
  BaseLibraryModes,
  type BaseRelationValuesInput,
  type ConfigItem,
  EditStatus,
  type Entity,
  type EntityListElement,
  Entitytyping,
  MediaTypeEntities,
  type Metadata,
  ModalStyle,
  RelationActions,
  TypeModals,
} from "@/generated-types/queries";
import ListItem from "@/components/ListItem.vue";
import { useListItemHelper } from "@/composables/useListItemHelper";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import { formatTeaserMetadata, getMappedSlug } from "@/helpers";
import { computed, nextTick, onBeforeUnmount, ref, unref, watch } from "vue";
import { useEditMode } from "@/composables/useEdit";
import useEntitySingle from "@/composables/useEntitySingle";
import { sharedColumnLabels } from "@/components/library/view-modes/composables/sharedColumnLabels";
import ListColumnHeader from "@/components/library/view-modes/ListColumnHeader.vue";
import { useBulkOperations } from "@/composables/useBulkOperations";
import { useFormHelper } from "@/composables/useFormHelper";
import PreviewWrapper from "@/components/previews/PreviewWrapper.vue";
import { usePreviewComponent } from "@/components/library/view-modes/composables/usePreviewComponent";
import { useEntityListHelpers } from "@/components/library/view-modes/composables/useEntityListHelpers";
import { useEntityPageConfig } from "@/composables/useEntityPageConfig";
import { useSeenState } from "@/composables/useSeenItems";
import { useBaseModal } from "@/composables/useBaseModal";

const props = withDefaults(
  defineProps<{
    entities: Entity[];
    placeholderEntities: Entity[];
    entitiesLoading: boolean;
    bulkOperationsContext: Context | undefined;
    listItemRouteName: string;
    disablePreviews?: boolean;
    actionOnClick?: ActionOnClick;
    parentEntityIdentifiers?: string[];
    parentEntityType?: Entitytyping;
    idsOfNonSelectableEntities?: string[];
    relationType?: string;
    enableSelection: boolean;
    baseLibraryMode?: BaseLibraryModes;
    entityListElements?: EntityListElement[];
    allowedActionsOnRelations?: RelationActions[];
    mode: "list" | "grid";
    config?: ConfigItem[];
    refetchEntities?: () => Promise<void>;
    expandFilters?: boolean;
    entityType: Entitytyping;
    configPerViewMode: object;
    showCurrentEntityFlow?: boolean;
    cropMediafileCoordinatesKey?: string;
    openPreviewByDefault?: boolean;
    primaryMediafileId?: string;
    primaryThumbnailId?: string;
  }>(),
  {
    disablePreviews: false,
    actionOnClick: ActionOnClick.Navigate,
    parentEntityIdentifiers: () => [],
    idsOfNonSelectableEntities: () => [],
    enableSelection: true,
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
    entityListElements: undefined,
    allowedActionsOnRelations: () => [],
    mode: "list",
    refetchEntities: undefined,
    showCurrentEntityFlow: true,
    cropMediafileCoordinatesKey: "",
    openPreviewByDefault: undefined,
    expandFilters: false,
    primaryMediafileId: "",
    primaryThumbnailId: "",
  },
);

const emit = defineEmits<{
  (event: "addRefetchFunctionToEditState"): void;
  (event: "togglePageSelection", selected: boolean): void;
}>();

const refEntities = ref<Entity[]>(props.entities);
watch(
  () => props.entities,
  (newValue) => {
    refEntities.value = newValue;
  },
);

const { openModal } = useBaseModal();
const {
  previewComponent,
  previewComponentEnabled,
  previewForEntity,
  togglePreviewComponent,
  openPreviewComponent,
  closePreviewComponent,
  togglePreviewForListItem,
  isPreviewComponentEnabledForListItem,
  isPreviewOpenForListItem,
} = usePreviewComponent(props, refEntities);
const {
  containerNameForPreview,
  getLinkSettings,
  isEntityDisabled,
  entityWrapperHandler,
  getButtons,
  isPreviewElement,
} = useEntityListHelpers(
  props,
  refEntities,
  previewComponentEnabled,
  openPreviewComponent,
  togglePreviewForListItem,
);

// "Open detail page" in the preview header, for lists that navigate.
const previewDetailPath = computed(() => {
  const entity = refEntities.value.find(
    (entity) => entity.id === previewForEntity.value,
  );
  if (!entity || props.actionOnClick !== ActionOnClick.Navigate) return;
  return getLinkSettings(entity, props.listItemRouteName, true).path;
});

const { seenTracking } = useEntityPageConfig();
const { isSeen: isEntitySeen, isNew: isEntityNew } = useSeenState(seenTracking);

const multiLine = computed(
  () => props.config?.find((c) => c.key === "multiLine")?.value === true,
);
const multiLineColumns = computed(() => {
  const val = props.config?.find((c) => c.key === "multiLineColumns")?.value;
  return typeof val === "number" ? val : 5;
});
const { getMediaFilenameFromEntity } = useListItemHelper();
const { getThumbnail } = useThumbnailHelper();
const { getForm, findRelation, getTeaserMetadataInState } = useFormHelper();
const relations = computed<BaseRelationValuesInput[]>(
  () => getForm(props.parentEntityIdentifiers[0])?.values?.relationValues,
);

const filteredRelations = computed(() => {
  return (
    relations.value?.filter(
      (relation) =>
        relation.editStatus === EditStatus.New &&
        relation.type === props.relationType,
    ) || []
  );
});

const processedEntities = computed(() => {
  const currentMode = props.mode;
  const previewEnabled = previewComponentEnabled.value;
  const parentId = props.parentEntityIdentifiers[0];
  const rType = props.relationType;

  return refEntities.value.map((entity) => {
    const linkSettings = getLinkSettings(entity, props.listItemRouteName);
    const relation = findRelation(entity.id, rType as string, parentId);
    const isPreviewActive = isPreviewComponentEnabledForListItem(entity.id);
    const isPreviewOpen = isPreviewOpenForListItem(entity.id);
    const isDisabled = isEntityDisabled(entity);
    const isSeen = isEntitySeen(entity.id);
    const isNew = isEntityNew(entity.id, entity.intialValues);
    const formattedMetadata = formatTeaserMetadata(
      entity.teaserMetadata,
      entity.intialValues,
      previewEnabled,
    );
    const mediaFilename = getMediaFilenameFromEntity(entity);
    const thumbnail = getThumbnail(entity);
    const buttons = getButtons(entity);

    const memoKey = [
      entity.intialValues,
      entity.teaserMetadata,
      entity.relationValues,
      relation,
      isPreviewActive,
      isPreviewOpen,
      isDisabled,
      isSeen,
      isNew,
      currentMode,
      previewEnabled,
      props.entitiesLoading,
    ];

    return {
      originalEntity: entity,
      id: entity.id,
      type: entity.type,
      componentTag: linkSettings.tag,
      componentPath: linkSettings.path,

      buttons,
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
      isDisabled: isDisabled,
      isNew,
      relation: relation,
      isPreviewActive: isPreviewActive,
      isPreviewOpen,

      memoKey: memoKey,
    };
  });
});

const { getEntityUuid } = useEntitySingle();
const editHelper = useEditMode(getEntityUuid() || "");

const columnLabels = computed<string[] | undefined>(() => {
  if (props.mode !== "list" || unref(editHelper.isEdit)) return undefined;
  const rows = processedEntities.value.map((entity) => entity.teaserMetadata);
  if (!rows.every(Array.isArray)) return undefined;
  return sharedColumnLabels(rows as Metadata[][]);
});

// Places each header label over the matching cell of the first row, so the
// header follows the row layout (actions width, wrapping, multi-line).
const listHeader = ref<HTMLElement>();
const headerCellStyles = ref<Record<string, string>[]>([]);
const headerCheckboxStyle = ref<Record<string, string>>();
const measureHeader = () => {
  const header = listHeader.value;
  const firstRow = header?.parentElement?.querySelector('[data-cy="list-item"]');
  const cells = firstRow?.querySelector('[data-cy="list-item-content"]')?.children;
  if (!header || !cells) return;
  const left = header.getBoundingClientRect().left;
  headerCellStyles.value = [...cells].map((cell) => {
    const box = cell.getBoundingClientRect();
    return { left: `${box.left - left}px`, width: `${box.width}px` };
  });
  // Line the select-all box up with the rows' boxes.
  const rowBox = firstRow?.querySelector("input[type=checkbox]");
  const headerRoot = header.querySelector('[data-cy="list-column-header"]')
    ?.firstElementChild as HTMLElement | null | undefined;
  const headerBox = headerRoot?.querySelector("input[type=checkbox]");
  if (!rowBox || !headerRoot || !headerBox) return;
  const inset =
    headerBox.getBoundingClientRect().left -
    headerRoot.getBoundingClientRect().left;
  headerCheckboxStyle.value = {
    left: `${rowBox.getBoundingClientRect().left - left - inset}px`,
  };
};

const { isEnqueued } = useBulkOperations();
const pageIsSelected = computed(
  () =>
    processedEntities.value.length > 0 &&
    processedEntities.value
      .filter((entity) => !entity.isDisabled)
      .every(
        (entity) =>
          isEnqueued(props.bulkOperationsContext, entity.id) ||
          isEnqueued(props.bulkOperationsContext, entity.originalEntity.uuid),
      ),
);
const headerObserver =
  typeof ResizeObserver === "undefined"
    ? undefined
    : new ResizeObserver(() => measureHeader());
watch(
  [listHeader, () => processedEntities.value],
  async () => {
    headerObserver?.disconnect();
    await nextTick();
    const firstRow = listHeader.value?.parentElement?.querySelector(
      '[data-cy="list-item-content"]',
    );
    if (!listHeader.value || !firstRow) return;
    headerObserver?.observe(listHeader.value);
    headerObserver?.observe(firstRow);
    measureHeader();
  },
  { flush: "post" },
);
onBeforeUnmount(() => headerObserver?.disconnect());

const openEntityInModal = (entityId: string, entityType: Entitytyping) => {
  openModal(
    TypeModals.EntityDetailModal,
    ModalStyle.CenterWide,
    undefined,
    undefined,
    false,
    undefined,
    { entityId, entityType },
  );
};
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

/* Parent container queries */
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

/* Preview container queries: a split nested in a preview uses the same
   tiers, measured against its own container (entity-list-element.md) */
@container preview (min-width: 500px) {
  .responsive-grid {
    grid-template-columns: 40% 60%;
  }
}

@container preview (min-width: 630px) {
  .responsive-grid {
    grid-template-columns: 35% 65%;
  }
}

@container preview (min-width: 830px) {
  .responsive-grid {
    grid-template-columns: 30% 70%;
  }
}

@container preview (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: 25% 75%;
  }
}

/* Preview container queries without showing current entity flow */
@container preview-without-current-entity-flow (min-width: 10px) {
  .responsive-grid {
    grid-template-columns: 100%;
  }
}

.list-item-list {
  content-visibility: auto;
  contain-intrinsic-size: 62px;
}

.list-item-list-multi-line {
  contain-intrinsic-size: 110px;
}

.list-item-grid {
  content-visibility: auto;
  contain-intrinsic-size: 300px;
}
</style>
