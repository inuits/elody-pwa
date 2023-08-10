<template>
  <div class="lg:flex bg-neutral-lightest">
    <div class="w-full" :class="parentEntityId ? 'p-3' : 'px-6'">
      <div class="flex flex-row items-center gap-y-4">
        <FiltersBase v-if="filtersBaseInitializationStatus === 'initialized'" v-show="enableAdvancedFilters"
          class="lg:w-[46%]" :filter-matcher-mapping="filterMatcherMapping" :advanced-filters="advancedFilters"
          :entity-type="filterType || entityType" :parent-entity-id="parentEntityId" :expandFilters="expandFilters"
          @apply-filters="setAdvancedFilters" @expand-filters="expandFilters = !expandFilters" />

        <div class="mr-2" :class="['flex', { 'ml-4': enableAdvancedFilters }]">
          <BaseToggleGroup :toggles="toggles" />
        </div>

        <LibraryBar v-if="libraryBarInitializationStatus === 'initialized' &&
          !predefinedEntities
          " :pagination-limit-options="paginationLimitOptions" :sort-options="sortOptions"
          :total-items="totalEntityCount || NaN" :queryVariables="(queryVariables as GetEntitiesQueryVariables)" />
      </div>

      <div v-if="enableBulkOperations && !displayPreview" class="my-3" :class="{ 'flex justify-end': expandFilters }">
        <BulkOperationsActionsBar :class="{ 'w-[69.75%]': expandFilters }" :context="bulkOperationsContext"
          :total-items-count="totalEntityCount" :use-extended-bulk-operations="true"
          :confirm-selection-button="confirmSelectionButton" @select-page="bulkSelect"
          @select-all="bulkSelect(allEntitiesResult.Entities.results)" @confirm-selection="(selection) => emit('confirmSelection', selection)
            " />
      </div>

      <div :class="{ 'flex justify-end': expandFilters }">
        <ListContainer id="gridContainer" :class="[
          { 'w-[69.75%]': expandFilters },
          displayGrid ? 'p-5' : 'p-1',
        ]">
          <div v-if="displayList && entities">
            <div>
              <ListItem v-for="entity in entities" :key="entity.id + '_list'" :class="parentEntityId &&
                entity.id &&
                mediafileSelectionState.selectedMediafile?.id === entity.id
                ? '!border-2 !border-accent-normal'
                : ''
                " :item-id="entity.uuid" :bulk-operations-context="bulkOperationsContext" :teaser-metadata="entity.teaserMetadata?.flatMap((metadata) => metadata ?? [])
    " :media="entitiesLoading
    ? undefined
    : getMediaFilenameFromEntity(entity)
    " :thumb-icon="entitiesLoading ? undefined : getThumbnail(entity)" :small="listItemRouteName === 'SingleMediafile'"
                :loading="entitiesLoading" @click="
                  entitiesLoading || !enableNavigation
                    ? !enableNavigation &&
                      parentEntityId &&
                      entity.type === 'MediaFile'
                      ? updateSelectedEntityMediafile(entity)
                      : undefined
                    : goToEntityPage(entity)
                  " @dblclick="
    !enableNavigation && parentEntityId
      ? goToEntityPage(entity)
      : undefined
    ">
                <template #actions>
                  <!-- Use bulkoperations checkboxes to apply this logic again -->
                </template>
              </ListItem>
            </div>
          </div>

          <div v-else-if="displayGrid && entities">
            <div class="grid grid_cols gap-2 justify-items-center">
              <GridItem v-for="entity in entities" :key="entity.id + '_grid'" :class="parentEntityId &&
                mediafileSelectionState.selectedMediafile?.id === entity.id
                ? '!border-2 !border-accent-normal'
                : ''
                " :item-id="entity.uuid" :bulk-operations-context="bulkOperationsContext" :teaser-metadata="entity.teaserMetadata?.flatMap((metadata) => metadata ?? [])
    " :media="entitiesLoading
    ? undefined
    : getMediaFilenameFromEntity(entity)
    " :thumb-icon="entitiesLoading ? undefined : getThumbnail(entity)" :small="listItemRouteName === 'SingleMediafile'"
                :loading="entitiesLoading" @click="
                  entitiesLoading || !enableNavigation
                    ? !enableNavigation &&
                      parentEntityId &&
                      entity.type === 'MediaFile'
                      ? updateSelectedEntityMediafile(entity)
                      : undefined
                    : goToEntityPage(entity)
                  " @dblclick="
    !enableNavigation && parentEntityId
      ? goToEntityPage(entity)
      : undefined
    ">
                <template #actions>
                  <!-- Use bulkoperations checkboxes to apply this logic again -->
                </template>
              </GridItem>
            </div>
            <div v-if="entities.length === 0" class="p-4">
              {{ t("search.noresult") }}
            </div>
          </div>

          <div v-else-if="displayPreview && entities" class="h-[62vh] mt-5">
            <media-viewer :mediafiles="entities" :loading="entitiesLoading" />
          </div>
        </ListContainer>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ApolloClient } from "@apollo/client";
import {
  DamsIcons,
  Entitytyping,
  GetEntitiesDocument,
  SearchInputType,
  type Entity,
  type GetEntitiesQueryVariables,
} from "@/generated-types/queries";
import {
  useBulkOperations,
  type Context,
  type InBulkProcessableItem,
} from "@/composables/useBulkOperations";
import BaseToggleGroup from "@/components/base/BaseToggleGroup.vue";
import BulkOperationsActionsBar from "@/components/bulk-operations/BulkOperationsActionsBar.vue";
import FiltersBase from "@/components/filters/FiltersBase.vue";
import GridItem from "@/components/GridItem.vue";
import LibraryBar from "@/components/library/LibraryBar.vue";
import ListContainer from "@/components/ListContainer.vue";
import ListItem from "@/components/ListItem.vue";
import MediaViewer from "@/components/base/Mediaviewer.vue";
import useEntitySingle from "@/composables/useEntitySingle";
import useListItemHelper from "@/composables/useListItemHelper";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import useUploadModalDropzone from "@/composables/useUploadModalDropzone";
import { bulkSelectAllSizeLimit } from "@/main";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { useI18n } from "vue-i18n";
import { useQuery } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { watch, ref, onMounted, onUnmounted, inject, computed } from "vue";
import { updateLocalStorage } from "@/helpers";

const props = withDefaults(
  defineProps<{
    bulkOperationsContext: Context;
    listItemRouteName: string;
    predefinedEntities?: Entity[];
    searchInputTypeOnDrawer?: SearchInputType;
    enablePreview?: boolean;
    enableAdvancedFilters?: boolean;
    enableBulkOperations?: boolean;
    filterType?: string;
    parentEntityId?: string;
    confirmSelectionButton?: boolean;
    enableNavigation?: boolean;
  }>(),
  {
    predefinedEntities: undefined,
    searchInputTypeOnDrawer: SearchInputType.AdvancedInputType,
    enablePreview: false,
    enableAdvancedFilters: true,
    enableBulkOperations: true,
    filterType: undefined,
    parentEntityId: undefined,
    confirmSelectionButton: false,
    enableNavigation: true,
  }
);

const emit = defineEmits<{
  (event: "confirmSelection", selectedItems: InBulkProcessableItem[]): void;
}>();

const { t } = useI18n();
const apolloClient = inject(DefaultApolloClient);
const route = useRoute();
const router = useRouter();

const {
  advancedFilters,
  entities,
  entitiesLoading,
  filterMatcherMapping,
  filtersBaseInitializationStatus,
  getEntities,
  libraryBarInitializationStatus,
  paginationLimitOptions,
  queryVariables,
  setAdvancedFilters,
  setEntities,
  setEntityType,
  setTotalEntityCount,
  sortOptions,
  totalEntityCount,
} = useBaseLibrary(apolloClient as ApolloClient<any>);
const {
  mediafileSelectionState,
  setEntityMediafiles,
  updateSelectedEntityMediafile,
} = useEntityMediafileSelector();
const { enqueueItemForBulkProcessing, triggerBulkSelectionEvent } =
  useBulkOperations();
const { getUploadStatus, setUploadStatus } = useUploadModalDropzone();
const { getMediaFilenameFromEntity } = useListItemHelper();
const { getThumbnail } = useThumbnailHelper();
const { setEntityUuid } = useEntitySingle();

const displayList = ref<boolean>(false);
const displayGrid = ref<boolean>(false);
const displayPreview = ref<boolean>(props.enablePreview);

const expandFilters = ref<boolean>(false);
const isAsc = ref<boolean>(false);
const toggles = [
  { isOn: displayList, iconOn: DamsIcons.ListUl, iconOff: DamsIcons.ListUl },
  { isOn: displayGrid, iconOn: DamsIcons.Apps, iconOff: DamsIcons.Apps },
];

const entityType = computed(() =>
  route.meta.entityType ? (route.meta.entityType as Entitytyping) : "BaseEntity"
);

const allEntitiesQueryVariables: GetEntitiesQueryVariables = {
  limit: bulkSelectAllSizeLimit,
  skip: 1,
  searchValue: {
    value: "",
    isAsc: isAsc.value,
    key: "title",
    order_by: "",
  },
  advancedSearchValue: [],
  advancedFilterInputs: [],
  searchInputType: props.searchInputTypeOnDrawer,
};
const { result: allEntitiesResult } = useQuery(
  GetEntitiesDocument,
  allEntitiesQueryVariables,
  () => ({ enabled: false, fetchPolicy: "network-only" })
);

const bulkSelect = (items = entities.value) => {
  if (props.predefinedEntities) items = props.predefinedEntities;

  for (let entity of items)
    enqueueItemForBulkProcessing(props.bulkOperationsContext, {
      id: entity.id,
      teaserMetadata: entity.teaserMetadata?.flatMap(
        (metadata) => metadata ?? []
      ),
    });

  triggerBulkSelectionEvent(props.bulkOperationsContext);
};

const goToEntityPage = (entity: Entity) => {
  if (entity.type === "MediaFile") {
    setEntityMediafiles([]);
    updateSelectedEntityMediafile(entity);
  }

  setEntityUuid(entity.uuid);
  const entityId =
    entity.id ||
    entity.teaserMetadata?.find((dataItem) => dataItem?.key === "id")?.value;

  router.push({
    name: props.listItemRouteName,
    params: { id: entityId },
  });
};

const setCssGridVariable = (colAmount: number = 5) => {
  const root = document.querySelector(":root") as HTMLElement;
  root.style.setProperty("--grid-cols", colAmount.toString());
};

const calculateGridColumns = () => {
  const gridContainerWidth =
    document.getElementById("gridContainer")?.offsetWidth;
  const gridItemWidth = 330;
  let colAmount = 0;

  if (gridContainerWidth) {
    colAmount = Math.floor(gridContainerWidth / gridItemWidth);
    if (props.parentEntityId) --colAmount;
  }
  setCssGridVariable(colAmount);
};

const conditionallyCalculateGridColumns = () => {
  if (displayGrid.value) calculateGridColumns();
};

const initializeBaseLibrary = () => {
  if (!props.predefinedEntities) {
    if (props.filterType) setEntityType(props.filterType as Entitytyping);
    queryVariables.value.searchInputType = props.searchInputTypeOnDrawer;
  }
};

onMounted(() => {
  initializeBaseLibrary();
  window.addEventListener("resize", conditionallyCalculateGridColumns);
  window.addEventListener("popstate", conditionallyCalculateGridColumns);

  if (props.enablePreview)
    toggles.push({
      isOn: displayPreview,
      iconOn: DamsIcons.Image,
      iconOff: DamsIcons.Image,
    });

  const displayPreferences = window.localStorage.getItem("_displayPreferences");
  if (displayPreferences) {
    displayGrid.value = JSON.parse(displayPreferences).grid;
    expandFilters.value = !props.enableAdvancedFilters
      ? false
      : JSON.parse(displayPreferences).expandFilters;
  }
  calculateGridColumns();
});

onUnmounted(() => {
  window.removeEventListener("resize", conditionallyCalculateGridColumns);
  window.removeEventListener("popstate", conditionallyCalculateGridColumns);
});

watch(
  () => entityType.value,
  () => {
    if (!props.predefinedEntities) {
      libraryBarInitializationStatus.value = "not-initialized";
      filtersBaseInitializationStatus.value = "not-initialized";
      setEntityType(entityType.value);

      const searchInputType =
        entityType.value === Entitytyping.Mediafile
          ? SearchInputType.AdvancedInputMediaFilesType
          : SearchInputType.AdvancedInputType;
      if (searchInputType === queryVariables.value.searchInputType)
        getEntities();
      else queryVariables.value.searchInputType = searchInputType;
    }
  }
);
watch(getUploadStatus, (status) => {
  if (status === "success") {
    getEntities();
    setUploadStatus("no-upload");
  }
});
watch(
  () => props.predefinedEntities,
  () => {
    if (props.predefinedEntities) {
      setEntities(props.predefinedEntities);
      setTotalEntityCount(props.predefinedEntities.length);
    }
  },
  { immediate: true }
);
watch([displayGrid, expandFilters], () => {
  updateLocalStorage("_displayPreferences", {
    grid: displayPreview.value ? false : displayGrid.value,
    expandFilters: expandFilters.value,
  });
});
</script>

<style scoped>
.grid_cols {
  grid-template-columns: repeat(var(--grid-cols), minmax(0, 1fr));
}
</style>
