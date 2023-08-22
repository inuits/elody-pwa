<template>
  <div class="grid grid_cols gap-2 justify-items-center">
    <GridItem
      v-if="!disablePreviews"
      v-for="item in getItemPreviews()"
      :key="item.id + '_preview'"
      :item-id="item.id"
      :bulk-operations-context="bulkOperationsContext"
      :teaser-metadata="item.teaserMetadata"
      :thumb-icon="entitiesLoading ? undefined : getThumbnail(item)"
      :small="listItemRouteName === 'SingleMediafile'"
      :is-preview="true"
    />
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
import type { Entity } from "@/generated-types/queries";
import GridItem from "@/components/GridItem.vue";
import useListItemHelper from "@/composables/useListItemHelper";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import useViewModes from "@/composables/useViewModes";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { inject, onMounted, onUnmounted } from "vue";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";

const props = withDefaults(
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
const { getItemPreviews } = useViewModes();

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
