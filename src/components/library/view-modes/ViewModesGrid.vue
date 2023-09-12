<template>
  <div class="grid grid_cols gap-2 justify-items-center">
    <div
      v-if="!disablePreviews"
      v-for="item in relations?.filter(
        (relation) =>
          relation.editStatus === EditStatus.New &&
          relation.type === relationType
      )"
      class="w-full"
    >
      <GridItem
        :key="item.key + '_preview'"
        :item-id="item.key"
        :bulk-operations-context="bulkOperationsContext"
        :teaser-metadata="item.teaserMetadata"
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
        :relations="relations"
      />
    </div>
    <GridItem
      v-for="entity in entities"
      :key="entity.id + '_grid'"
      :class="
        parentEntityIdentifiers.length > 0 &&
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
      :is-markable-as-to-be-deleted="parentEntityIdentifiers.length > 0"
      :is-disabled="
        idsOfNonSelectableEntities.includes(entity.id) ||
        idsOfNonSelectableEntities.includes(entity.uuid)
      "
      :relation="
        relations?.find(
          (relation) =>
            relation.key === entity.id && relation.type === relationType
        )
      "
      :relations="relations"
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
  </div>
</template>

<script lang="ts" setup>
import type { ApolloClient } from "@apollo/client/core";
import type { Context } from "@/composables/useBulkOperations";
import {
  EditStatus,
  type BaseRelationValuesInput,
  type Entity,
} from "@/generated-types/queries";
import GridItem from "@/components/GridItem.vue";
import useListItemHelper from "@/composables/useListItemHelper";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import { getEntityIdFromRoute } from "@/helpers";
import { computed, inject, onMounted, onUnmounted } from "vue";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { useFormHelper } from "@/composables/useFormHelper";

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
  }>(),
  {
    disablePreviews: false,
    enableNavigation: true,
    parentEntityIdentifiers: () => [],
    idsOfNonSelectableEntities: () => [],
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

const entityId = computed(() => getEntityIdFromRoute() as string);
const relations = computed<BaseRelationValuesInput[]>(
  () => getForm(entityId.value)?.values.relationValues.relations
);

const calculateGridColumns = () => {
  const gridContainerWidth =
    document.getElementById("gridContainer")?.offsetWidth;
  const gridItemWidth = 330;
  let colAmount = 0;

  if (gridContainerWidth) {
    colAmount = Math.floor(gridContainerWidth / gridItemWidth);
    if (props.parentEntityIdentifiers.length > 0) --colAmount;
  }

  const root = document.querySelector(":root") as HTMLElement;
  root.style.setProperty("--grid-cols", colAmount.toString());
};

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
