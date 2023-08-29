<template>
  <div
    v-show="!disablePreviews"
    v-for="item in relations?.filter(
      (relation) => relation.editStatus === EditStatus.New
    )"
    :key="item.key"
  >
    <ListItem
      :key="item.key + '_preview'"
      :item-id="item.key"
      :bulk-operations-context="bulkOperationsContext"
      :teaser-metadata="(item.teaserMetadata as Metadata[])"
      :thumb-icon="entitiesLoading ? undefined : getThumbnail(item)"
      :small="listItemRouteName === 'SingleMediafile'"
      :is-preview="true"
      :is-markable-as-to-be-deleted="parentEntityIdentifiers.length > 0"
      :relation="
        relations?.find(
          (relation) =>
            relation.key === item.key && relation.type === relationType
        )
      "
    />
  </div>
  <ListItem
    v-for="entity in entities"
    :key="entity.id + '_list'"
    :class="
      parentEntityIdentifiers.length > 0 &&
      entity.id &&
      mediafileSelectionState.selectedMediafile?.id === entity.id
        ? '!border-2 !border-accent-normal'
        : ''
    "
    :item-id="entity.uuid"
    :bulk-operations-context="bulkOperationsContext"
    :teaser-metadata="
      formatTeaserMetadata(entity.teaserMetadata, entity.intialValues) as Metadata[]
    "
    :media="entitiesLoading ? undefined : getMediaFilenameFromEntity(entity)"
    :thumb-icon="entitiesLoading ? undefined : getThumbnail(entity)"
    :small="listItemRouteName === 'SingleMediafile'"
    :loading="entitiesLoading"
    :is-markable-as-to-be-deleted="parentEntityIdentifiers.length > 0"
    :relation="
      relations?.find(
        (relation) =>
          relation.key === entity.id && relation.type === relationType
      )
    "
    @click="
      entitiesLoading || !enableNavigation
        ? !enableNavigation &&
          parentEntityIdentifiers.length > 0 &&
          entity.type === 'MediaFile'
          ? updateSelectedEntityMediafile(entity)
          : undefined
        : emit('goToEntityPage', entity)
    "
    @dblclick="
      !enableNavigation && parentEntityIdentifiers.length > 0
        ? emit('goToEntityPage', entity)
        : undefined
    "
  />
</template>

<script lang="ts" setup>
import type { ApolloClient } from "@apollo/client/core";
import type { Context } from "@/composables/useBulkOperations";
import {
  EditStatus,
  type BaseRelationValuesInput,
  type Entity,
  type Metadata,
} from "@/generated-types/queries";
import ListItem from "@/components/ListItem.vue";
import useListItemHelper from "@/composables/useListItemHelper";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import { asString } from "@/helpers";
import { computed, inject } from "vue";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { useFormHelper } from "@/composables/useFormHelper";
import { useRoute } from "vue-router";

withDefaults(
  defineProps<{
    entities: Entity[];
    entitiesLoading: boolean;
    bulkOperationsContext: Context;
    listItemRouteName: string;
    disablePreviews?: boolean;
    enableNavigation?: boolean;
    parentEntityIdentifiers?: string[];
  }>(),
  {
    disablePreviews: false,
    enableNavigation: true,
    parentEntityIdentifiers: () => [],
  }
);

const emit = defineEmits<{
  (event: "goToEntityPage", entity: Entity): void;
}>();

const apolloClient = inject(DefaultApolloClient);
const { formatTeaserMetadata } = useBaseLibrary(
  apolloClient as ApolloClient<any>
);
const { mediafileSelectionState, updateSelectedEntityMediafile } =
  useEntityMediafileSelector();
const { getMediaFilenameFromEntity } = useListItemHelper();
const { getThumbnail } = useThumbnailHelper();
const { getForm } = useFormHelper();

const entityId = computed<string>(() => asString(useRoute().params["id"]));
const relations = computed<BaseRelationValuesInput[]>(
  () => getForm(entityId.value)?.values.relationValues.relations
);
const relationType = computed<string>(
  () => getForm(entityId.value)?.values.relationValues.type
);
</script>
