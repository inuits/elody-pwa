<template>
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
      formatTeaserMetadata(entity.teaserMetadata, entity.intialValues)
    "
    :media="entitiesLoading ? undefined : getMediaFilenameFromEntity(entity)"
    :thumb-icon="entitiesLoading ? undefined : getThumbnail(entity)"
    :small="listItemRouteName === 'SingleMediafile'"
    :loading="entitiesLoading"
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
  >
  </ListItem>
</template>

<script lang="ts" setup>
import type { ApolloClient } from "@apollo/client/core";
import type { Context } from "@/composables/useBulkOperations";
import type { Entity } from "@/generated-types/queries";
import ListItem from "@/components/ListItem.vue";
import useListItemHelper from "@/composables/useListItemHelper";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { inject } from "vue";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";

withDefaults(
  defineProps<{
    entities: Entity[];
    entitiesLoading: boolean;
    bulkOperationsContext: Context;
    listItemRouteName: string;
    enableNavigation?: boolean;
    parentEntityIdentifiers?: string[];
  }>(),
  {
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
</script>

<style></style>
