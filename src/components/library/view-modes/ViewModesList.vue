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
          @click="entityWrapperHandler(entity.originalEntity)"
          v-memo="entity.memoKey"
        >
          <ListItem
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
            :small="listItemRouteName === 'SingleMediafile'"
            :loading="entitiesLoading"
            :is-markable-as-to-be-deleted="entity.isMarkable"
            :is-disabled="entity.isDisabled"
            :relation="entity.relation"
            :relation-type="relationType"
            :has-selection="enableSelection"
            :base-library-mode="baseLibraryMode"
            :is-enable-navigation="enableNavigation"
            :entity-list-elements="entityListElements"
            :view-mode="mode"
            :refetch-entities="refetchEntities"
            :preview-component-enabled="previewComponentEnabled"
            :preview-component-current-active="entity.isPreviewActive"
            :preview-component-feature-enabled="previewComponent !== undefined"
            :preview-component-list-items-coverage="
              previewComponent?.listItemsCoverage
            "
            :is-primary-mediafile="primaryMediafileId === entity.id"
            :multi-line="multiLine"
            :multi-line-columns="multiLineColumns"
            @navigate-to="
              () => {
                router.push(entity.forcedNavigationPath);
              }
            "
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
  type BaseRelationValuesInput,
  type ConfigItem,
  EditStatus,
  type Entity,
  type EntityListElement,
  Entitytyping,
  MediaTypeEntities,
  type Metadata,
  RelationActions,
} from "@/generated-types/queries";
import ListItem from "@/components/ListItem.vue";
import { useListItemHelper } from "@/composables/useListItemHelper";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import { formatTeaserMetadata, getMappedSlug } from "@/helpers";
import { computed, ref, watch } from "vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { router } from "@/main";
import PreviewWrapper from "@/components/previews/PreviewWrapper.vue";
import { usePreviewComponent } from "@/components/library/view-modes/composables/usePreviewComponent";
import { useEntityListHelpers } from "@/components/library/view-modes/composables/useEntityListHelpers";

const props = withDefaults(
  defineProps<{
    entities: Entity[];
    placeholderEntities: Entity[];
    entitiesLoading: boolean;
    bulkOperationsContext: Context | undefined;
    listItemRouteName: string;
    disablePreviews?: boolean;
    enableNavigation?: boolean;
    parentEntityIdentifiers?: string[];
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
    primaryMediafileId?: string;
  }>(),
  {
    disablePreviews: false,
    enableNavigation: true,
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
    expandFilters: false,
    primaryMediafileId: "",
  },
);

const emit = defineEmits<{
  (event: "addRefetchFunctionToEditState"): void;
}>();

const refEntities = ref<Entity[]>(props.entities);
watch(
  () => props.entities,
  (newValue) => {
    refEntities.value = newValue;
  },
);

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
    const forcedLinkSettings = getLinkSettings(
      entity,
      props.listItemRouteName,
      true,
    );
    const relation = findRelation(entity.id, rType as string, parentId);
    const isPreviewActive = isPreviewComponentEnabledForListItem(entity.id);
    const isDisabled = isEntityDisabled(entity);
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
      currentMode,
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
      isDisabled: isDisabled,
      relation: relation,
      isPreviewActive: isPreviewActive,

      memoKey: memoKey,
    };
  });
});
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

/* Preview container queries */
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
