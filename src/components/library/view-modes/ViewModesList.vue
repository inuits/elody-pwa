<template>
  <div :class="isPreviewElement ? 'preview-container' : 'parent-container'">
    <div
      :key="mode + '-' + previewComponentEnabled"
      :class="
        previewComponentEnabled ? 'grid responsive-grid gap-x-2 mr-2' : ''
      "
    >
      <div
        data-cy="view-modes-list"
        :class="[
          'max-h-[68vh] overflow-scroll',
          {
            'grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-2 justify-items-center max-w-full':
              mode === 'grid',
          },
        ]"
      >
        <div
          v-if="Array.isArray(relations)"
          v-show="!disablePreviews"
          v-for="item in relations?.filter(
            (relation) =>
              relation.editStatus === EditStatus.New &&
              relation.type === relationType,
          )"
          :key="item.key"
        >
          <ListItem
            :key="item.key + '_preview'"
            :item-id="item.key"
            :bulk-operations-context="bulkOperationsContext"
            :teaser-metadata="getTeaserMetadataInState(item.key) as Metadata[]"
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
          />
        </div>
        <component
          v-for="entity in entities"
          :key="entity.id + '_list'"
          :is="entitiesLoading ? 'div' : getLinkSettings(entity).tag"
          :to="
            entitiesLoading
              ? undefined
              : getLinkSettings(entity, listItemRouteName).path
          "
          @click="entityWrapperHandler(entity)"
        >
          <ListItem
            :item-id="entity.id"
            :item-type="entity.type"
            :bulk-operations-context="bulkOperationsContext"
            :context-menu-actions="
              parentEntityIdentifiers?.length > 0
                ? entity.teaserMetadata?.contextMenuActions
                : undefined
            "
            :entityTypename="getMappedSlug(entity)"
            :teaser-metadata="
              formatTeaserMetadata(
                entity.teaserMetadata,
                entity.intialValues,
                previewComponentEnabled,
              ) as Metadata[]
            "
            :intialValues="entity.intialValues"
            :media="
              entitiesLoading ? undefined : getMediaFilenameFromEntity(entity)
            "
            :thumb-icon="entitiesLoading ? undefined : getThumbnail(entity)"
            :is-media-type="
              Object.values(MediaTypeEntities).includes(entity.type)
            "
            :small="listItemRouteName === 'SingleMediafile'"
            :loading="entitiesLoading"
            :is-markable-as-to-be-deleted="
              allowedActionsOnRelations.includes(
                RelationActions.RemoveRelation,
              ) && parentEntityIdentifiers.length > 0
            "
            :is-disabled="isEntityDisabled(entity)"
            :relation="
              findRelation(
                entity.id,
                relationType,
                props.parentEntityIdentifiers[0],
              )
            "
            :relation-type="relationType"
            :has-selection="enableSelection"
            :base-library-mode="baseLibraryMode"
            :is-enable-navigation="enableNavigation"
            :entity-list-elements="entityListElements"
            :view-mode="mode"
            :refetch-entities="refetchEntities"
            :preview-component-enabled="
              isPreviewComponentEnabledForListItem(entity.id)
            "
            :preview-component-icon-visible="previewComponent !== undefined"
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
          entities?.find((entity) => entity.id === previewForEntity)
        "
        class="my-2 max-h-[68vh] overflow-scroll bg-neutral-0 rounded-lg"
      >
        <PreviewWrapper
          :preview-component="previewComponent!"
          :entity-type="entityType"
          :entities="entities"
          :config-per-view-mode="configPerViewMode"
          :entity-id="previewForEntity"
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
  GetPreviewComponentsDocument,
  ListItemCoverageTypes,
  MediaTypeEntities,
  type Metadata,
  type PreviewComponent,
  RelationActions,
} from "@/generated-types/queries";
import ListItem from "@/components/ListItem.vue";
import { useListItemHelper } from "@/composables/useListItemHelper";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import {
  formatTeaserMetadata,
  getEntityPageRoute,
  getMappedSlug,
  updateEntityMediafileOnlyForMediafiles,
} from "@/helpers";
import { computed, inject, ref, watch } from "vue";
import type { OrderItem } from "@/composables/useOrderListItems";
import { useFormHelper } from "@/composables/useFormHelper";
import EventBus from "@/EventBus";
import { useLibraryBar } from "@/composables/useLibraryBar";
import { apolloClient } from "@/main";
import PreviewWrapper from "@/components/previews/PreviewWrapper.vue";

const props = withDefaults(
  defineProps<{
    entities: Entity[];
    entitiesLoading: boolean;
    bulkOperationsContext: Context;
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
    refetchEntities?: Function;
    expandFilters: boolean;
    entityType: Entitytyping;
    configPerViewMode: object;
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
  },
);

const previewComponent = ref<PreviewComponent | undefined>(undefined);
const previewComponentEnabled = ref<boolean>(false);
const previewForEntity = ref<string | undefined>(undefined);
const mediafileViewerContext: any = inject("mediafileViewerContext");
const isPreviewElement: boolean = inject("IsPreviewElement", false);
const { getMediaFilenameFromEntity } = useListItemHelper();
const { queryVariables } = useLibraryBar();
const { getThumbnail } = useThumbnailHelper();
const { getForm, findRelation, getTeaserMetadataInState } = useFormHelper();
const relations = computed<BaseRelationValuesInput[]>(
  () => getForm(props.parentEntityIdentifiers[0])?.values?.relationValues,
);

const getLinkSettings = (entity: Entity, listItemRouteName: string = "") => {
  if (!props.enableNavigation) {
    if (
      props.parentEntityIdentifiers.length > 0 &&
      entity.type.toLowerCase() === Entitytyping.Mediafile
    ) {
      return { tag: "div", path: undefined };
    }
    return { tag: "div", path: undefined };
  }

  return {
    tag: "router-link",
    path: getEntityPageRoute(entity, listItemRouteName),
  };
};

const isEntityDisabled = (entity: Entity) => {
  return (
    props.idsOfNonSelectableEntities.includes(entity.id) ||
    props.idsOfNonSelectableEntities.includes(entity.uuid)
  );
};

const entityWrapperHandler = (entity: Entity) => {
  if (isEntityDisabled(entity) || !props.enableNavigation) return;
  updateEntityMediafileOnlyForMediafiles(mediafileViewerContext, entity);
};

EventBus.on("orderList_changed", (orderItems: OrderItem[]) => {
  let itemsFound: boolean = false;
  props.entities.forEach((entity) => {
    const fieldKeyWithId = `order-${entity.id}`;
    const item = orderItems.filter((item) => item.field === fieldKeyWithId)[0];
    if (!item) return;
    entity.intialValues.order = item.currentValue;
    entity.teaserMetadata.order.value = item.currentValue;
    itemsFound = true;
  });
  if (itemsFound) {
    props.entities.sort(
      (value, nextValue) =>
        value.intialValues.order > nextValue.intialValues.order,
    );
    if (!queryVariables.value.searchValue.isAsc) props.entities.reverse();
  }
});

const getPreviewItemsForEntity = async () => {
  previewComponent.value = undefined;
  previewComponentEnabled.value = false;
  previewForEntity.value = undefined;
  apolloClient
    .query({
      query: GetPreviewComponentsDocument,
      variables: { entityType: props.entityType },
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
    })
    .then((result) => {
      previewComponent.value = result.data.PreviewComponents?.previewComponent;
      if (previewComponent.value?.openByDefault)
        togglePreviewComponent(props.entities[0].id);
    });
};

const togglePreviewComponent = (entityId: string) => {
  if (
    previewComponent.value?.listItemsCoverage ===
    ListItemCoverageTypes.AllListItems
  )
    previewComponentEnabled.value = !previewComponentEnabled.value;
  else
    previewComponentEnabled.value = !(
      previewComponentEnabled.value && previewForEntity.value === entityId
    );
  previewForEntity.value = entityId;
};

const closePreviewComponent = () => {
  previewComponentEnabled.value = false;
  previewForEntity.value = undefined;
};

const isPreviewComponentEnabledForListItem = (entityId: string): boolean => {
  if (!previewComponentEnabled.value) return false;
  if (
    previewComponent.value?.listItemsCoverage ===
    ListItemCoverageTypes.AllListItems
  )
    return true;
  if (
    previewComponent.value?.listItemsCoverage ===
      ListItemCoverageTypes.OneListItem &&
    previewForEntity.value === entityId
  )
    return true;
  return false;
};

const configurePreviewComponentWithNewEntities = (entities: Entity[]): void => {
  if (
    previewComponentEnabled.value &&
    previewComponent.value?.listItemsCoverage ===
      ListItemCoverageTypes.OneListItem
  )
    previewForEntity.value = entities[0]?.id;
};

watch(
  () => props.entityType,
  () => {
    if (
      props.entityType === undefined ||
      (props.baseLibraryMode !== BaseLibraryModes.NormalBaseLibrary &&
        props.baseLibraryMode !== BaseLibraryModes.PreviewBaseLibrary)
    )
      return;
    getPreviewItemsForEntity();
  },
  { immediate: true },
);
watch(
  () => props.entities,
  () => {
    if (props.entities.length > 0)
      configurePreviewComponentWithNewEntities(props.entities);
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
</style>
