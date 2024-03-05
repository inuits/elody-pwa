<template>
  <div
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
      :relation="findRelation(item.key, relationType)"
      :has-selection="enableSelection"
    />
  </div>
  <div
    v-for="entity in entities"
    :key="entity.id + '_list'"
    @click="navigateToEntityPage(entity, listItemRouteName)"
  >
    <ListItem
      @navigate-to="navigateToEntityPage(entity, listItemRouteName, true)"
      :class="
        parentEntityIdentifiers.length > 0 &&
        entity.id &&
        mediafileSelectionState.selectedMediafile?.id === entity.id
          ? '!border-2 !border-accent-normal'
          : ''
      "
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
      :is-media-type="[Entitytyping.Asset, Entitytyping.MediaFile].includes(entity.type)"
      :small="listItemRouteName === 'SingleMediafile'"
      :loading="entitiesLoading"
      :is-markable-as-to-be-deleted="parentEntityIdentifiers.length > 0"
      :is-disabled="
        idsOfNonSelectableEntities.includes(entity.id) ||
        idsOfNonSelectableEntities.includes(entity.uuid)
      "
      :relation="findRelation(entity.uuid, relationType)"
      :has-selection="enableSelection"
      :basic-base-library="basicBaseLibrary"
    />
  </div>
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
} from "@/generated-types/queries";
import ListItem from "@/components/ListItem.vue";
import useListItemHelper from "@/composables/useListItemHelper";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import { getEntityIdFromRoute, goToEntityPage } from "@/helpers";
import { computed, inject, onMounted, onUpdated } from "vue";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { OrderItem } from "@/composables/useOrderListItems";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { useFormHelper } from "@/composables/useFormHelper";
import { useRouter } from "vue-router";
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
    basicBaseLibrary?: Boolean;
  }>(),
  {
    disablePreviews: false,
    enableNavigation: true,
    parentEntityIdentifiers: () => [],
    idsOfNonSelectableEntities: () => [],
    enableSelection: true,
    basicBaseLibrary: false,
  }
);

const apolloClient = inject(DefaultApolloClient);
const { formatTeaserMetadata } = useBaseLibrary(
  apolloClient as ApolloClient<any>,
  props.parentEntityIdentifiers.length > 0
);
const { mediafileSelectionState, updateSelectedEntityMediafile } =
  useEntityMediafileSelector();
const { getMediaFilenameFromEntity } = useListItemHelper();
const { queryVariables } = useLibraryBar();
const { getThumbnail } = useThumbnailHelper();
const { getForm, findRelation, getTeaserMetadataInState } = useFormHelper();
const router = useRouter();

const entityId = computed(() => getEntityIdFromRoute() as string);
const relations = computed<BaseRelationValuesInput[]>(
  () => getForm(entityId.value)?.values?.relationValues?.relations
);

const navigateToEntityPage = (
  entity: Entity,
  listItemRouteName: string,
  isDoubleClick: boolean = false
) => {
  if (props.entitiesLoading || !props.enableNavigation) {
    if (
      props.parentEntityIdentifiers.length > 0 &&
      entity.type.toLowerCase() === Entitytyping.Mediafile
    ) {
      updateSelectedEntityMediafile(entity);
      return;
    }
    if (isDoubleClick) goToEntityPage(entity, listItemRouteName, router);
    return;
  }
  goToEntityPage(entity, listItemRouteName, router);
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
