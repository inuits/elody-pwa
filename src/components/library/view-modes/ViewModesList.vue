<template>
  <div
    v-if="Array.isArray(relations)"
    v-show="!disablePreviews"
    v-for="item in relations?.filter(
      (relation) =>
        relation.editStatus === EditStatus.New && relation.type === relationType
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
      :has-selection="enableSelection"
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
    @click="() => updateEntityMediafileOnlyForMediafiles(entity)"
  >
    <ListItem
      :item-id="entity.uuid"
      :item-type="entity.type"
      :bulk-operations-context="bulkOperationsContext"
      :context-menu-actions="entity.teaserMetadata?.contextMenuActions"
      :teaser-metadata="
        formatTeaserMetadata(
          entity.teaserMetadata,
          entity.intialValues,
        ) as Metadata[]
      "
      :intialValues="entity.intialValues"
      :media="entitiesLoading ? undefined : getMediaFilenameFromEntity(entity)"
      :thumb-icon="entitiesLoading ? undefined : getThumbnail(entity)"
      :is-media-type="Object.values(MediaTypeEntities).includes(entity.type)"
      :small="listItemRouteName === 'SingleMediafile'"
      :loading="entitiesLoading"
      :is-markable-as-to-be-deleted="parentEntityIdentifiers.length > 0"
      :is-disabled="
        idsOfNonSelectableEntities.includes(entity.id) ||
        idsOfNonSelectableEntities.includes(entity.uuid)
      "
      :relation="
        findRelation(
          entity.uuid,
          relationType,
          props.parentEntityIdentifiers[0]
        )
      "
      :has-selection="enableSelection"
      :base-library-mode="baseLibraryMode"
      :is-enable-navigation="enableNavigation"
      :entity-list-elements="entityListElements"
      :entity="entity"
    />
  </component>
</template>

<script lang="ts" setup>
import type { ApolloClient } from "@apollo/client/core";
import type { Context } from "@/composables/useBulkOperations";
import {
  EditStatus,
  type BaseRelationValuesInput,
  type Entity,
  type Metadata,
  Entitytyping,
  MediaTypeEntities,
  EntityListElement,
  BaseLibraryModes,
} from "@/generated-types/queries";
import ListItem from "@/components/ListItem.vue";
import useListItemHelper from "@/composables/useListItemHelper";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import {
  getEntityPageRoute,
  updateEntityMediafileOnlyForMediafiles,
} from "@/helpers";
import { computed, inject } from "vue";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { OrderItem } from "@/composables/useOrderListItems";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
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
    relationType: string;
    enableSelection: boolean;
    baseLibraryMode?: BaseLibraryModes;
    entityListElements?: EntityListElement[];
  }>(),
  {
    disablePreviews: false,
    enableNavigation: true,
    parentEntityIdentifiers: () => [],
    idsOfNonSelectableEntities: () => [],
    enableSelection: true,
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
    entityListElements: undefined,
  }
);

const apolloClient = inject(DefaultApolloClient);
const { formatTeaserMetadata } = useBaseLibrary(
  apolloClient as ApolloClient<any>,
  props.parentEntityIdentifiers.length > 0
);
const { updateSelectedEntityMediafile } = useEntityMediafileSelector();
const { getMediaFilenameFromEntity } = useListItemHelper();
const { queryVariables } = useLibraryBar();
const { getThumbnail } = useThumbnailHelper();
const { getForm, findRelation, getTeaserMetadataInState } = useFormHelper();
const relations = computed<BaseRelationValuesInput[]>(
  () =>
    getForm(props.parentEntityIdentifiers[0])?.values?.relationValues?.relations
);

const getLinkSettings = (entity: Entity, listItemRouteName: string = "") => {
  if (!props.enableNavigation) {
    if (
      props.parentEntityIdentifiers.length > 0 &&
      entity.type.toLowerCase() === Entitytyping.Mediafile
    ) {
      updateSelectedEntityMediafile(entity);
      return { tag: "div", path: undefined };
    }
    return { tag: "div", path: undefined };
  }
  return {
    tag: "router-link",
    path: getEntityPageRoute(entity, listItemRouteName),
  };
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
        value.intialValues.order > nextValue.intialValues.order
    );
    if (!queryVariables.value.searchValue.isAsc) props.entities.reverse();
  }
});
</script>
