<template>
  <div
    data-cy="view-modes-list"
    :class="[{ 'grid grid_cols gap-2 justify-items-center': mode === 'grid' }]"
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
          findRelation(item.key, relationType, props.parentEntityIdentifiers[0])
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
          ) as Metadata[]
        "
        :intialValues="entity.intialValues"
        :media="
          entitiesLoading ? undefined : getMediaFilenameFromEntity(entity)
        "
        :thumb-icon="entitiesLoading ? undefined : getThumbnail(entity)"
        :is-media-type="Object.values(MediaTypeEntities).includes(entity.type)"
        :small="listItemRouteName === 'SingleMediafile'"
        :loading="entitiesLoading"
        :is-markable-as-to-be-deleted="
          allowedActionsOnRelations.includes(RelationActions.RemoveRelation) &&
          parentEntityIdentifiers.length > 0
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
        :parentEntityType="parentEntityType"
      />
    </component>
  </div>
</template>

<script lang="ts" setup>
import type { Context } from "@/composables/useBulkOperations";
import {
  EditStatus,
  type BaseRelationValuesInput,
  type Entity,
  type Metadata,
  Entitytyping,
  MediaTypeEntities,
  type EntityListElement,
  BaseLibraryModes,
  RelationActions,
  type ConfigItem,
} from "@/generated-types/queries";
import ListItem from "@/components/ListItem.vue";
import useListItemHelper from "@/composables/useListItemHelper";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import {
  formatTeaserMetadata,
  getEntityPageRoute,
  getMappedSlug,
  setCssVariable,
  updateEntityMediafileOnlyForMediafiles,
} from "@/helpers";
import { computed, onMounted, onUnmounted, inject, watch, nextTick } from "vue";
import type { OrderItem } from "@/composables/useOrderListItems";
import { useFormHelper } from "@/composables/useFormHelper";
import EventBus from "@/EventBus";
import { useLibraryBar } from "@/composables/useLibraryBar";

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
    parentEntityType: string;
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
    parentEntityType: "",
  },
);
const mediafileViewerContext: any = inject("mediafileViewerContext");
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

const calculateGridColumns = () => {
  const gridContainerWidth =
    document.getElementById("gridContainer")?.offsetWidth;
  const gridItemWidth = 330;
  let colAmount = 0;

  if (gridContainerWidth) {
    colAmount = Math.floor(gridContainerWidth / gridItemWidth);
    if (props.parentEntityIdentifiers.length > 0) --colAmount;
  }

  setCssVariable("--grid-cols", colAmount.toString());
};

watch(
  () => props.expandFilters,
  async () => {
    await nextTick();
    calculateGridColumns();
  },
);

onMounted(() => {
  window.addEventListener("resize", calculateGridColumns);
  window.addEventListener("popstate", calculateGridColumns);
  calculateGridColumns();
});
onUnmounted(() => {
  window.removeEventListener("resize", calculateGridColumns);
  window.removeEventListener("popstate", calculateGridColumns);
});
</script>

<style scoped>
.grid_cols {
  grid-template-columns: repeat(var(--grid-cols), minmax(0, 1fr));
}
</style>
