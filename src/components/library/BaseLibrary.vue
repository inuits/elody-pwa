<template>
  <div class="lg:flex bg-neutral-lightest">
    <div class="w-full" :class="parentEntityId ? 'p-3' : 'px-6'">
      <div class="flex flex-row items-center gap-y-4">
        <FiltersBase
          v-show="enableAdvancedFilters"
          class="lg:w-[46%]"
          :expandFilters="expandFilters"
          :entity-type="filterType || route.meta.entityType ? route.meta.entityType as string : 'BaseLibrary'"
          :parent-entity-id="parentEntityId"
          @apply-filters="setFilters"
          @expand-filters="expandFilters = !expandFilters"
        />

        <div class="mr-2" :class="['flex', { 'ml-4': enableAdvancedFilters }]">
          <BaseToggleGroup :toggles="toggles" />
        </div>

        <LibraryBar
          v-if="!predefinedEntities"
          :total-items="totalEntityCount"
          v-model:limit="entitiesQueryVariables.limit"
          v-model:skip="(entitiesQueryVariables.skip as number)"
          v-model:sortKey="selectedSortOption"
          v-model:isAsc="isAsc"
          @update:limit="setQueryVariables"
          @update:skip="setQueryVariables"
          @update:sortKey="setQueryVariables"
          @update:isAsc="setQueryVariables"
        />
      </div>

      <div
        v-if="enableBulkOperations && !displayPreview"
        class="my-3"
        :class="{ 'flex justify-end': expandFilters }"
      >
        <BulkOperationsActionsBar
          :class="{ 'w-[69.75%]': expandFilters }"
          :context="bulkOperationsContext"
          :total-items-count="totalEntityCount"
          :use-extended-bulk-operations="true"
          :confirm-selection-button="confirmSelectionButton"
          @select-page="bulkSelect"
          @select-all="bulkSelect(allEntitiesResult.Entities.results)"
          @confirm-selection="
            (selection) => emit('confirmSelection', selection)
          "
        />
      </div>

      <div :class="{ 'flex justify-end': expandFilters }">
        <ListContainer
          id="gridContainer"
          :class="[
            { 'w-[69.75%]': expandFilters },
            displayGrid ? 'p-5' : 'p-1',
          ]"
        >
          <div v-if="displayList && entities">
            <div>
              <ListItem
                v-for="entity in entities"
                :key="entity.id"
                :class="
                  parentEntityId &&
                  mediafileSelectionState.selectedMediafile?.id === entity.id
                    ? '!border-2 !border-accent-normal'
                    : ''
                "
                :item-id="entity.uuid"
                :bulk-operations-context="bulkOperationsContext"
                :teaser-metadata="
                  entity.teaserMetadata?.flatMap((metadata) => metadata ?? [])
                "
                :media="
                  entitiesLoading
                    ? undefined
                    : getMediaFilenameFromEntity(entity)
                "
                :thumb-icon="entitiesLoading ? undefined : getThumbnail(entity)"
                :small="listItemRouteName === 'SingleMediafile'"
                :loading="entitiesLoading"
                @click="
                  entitiesLoading || !enableNavigation
                    ? !enableNavigation &&
                      parentEntityId &&
                      entity.type === 'MediaFile'
                      ? updateSelectedEntityMediafile(entity)
                      : undefined
                    : goToEntityPage(entity)
                "
                @dblclick="
                  !enableNavigation && parentEntityId
                    ? goToEntityPage(entity)
                    : undefined
                "
              >
                <template #actions>
                  <!-- Use bulkoperations checkboxes to apply this logic again -->
                </template>
              </ListItem>
            </div>
          </div>

          <div v-else-if="displayGrid && entities">
            <div class="grid grid_cols gap-2 justify-items-center">
              <GridItem
                v-for="entity in entities"
                :key="entity.id"
                :class="
                  parentEntityId &&
                  mediafileSelectionState.selectedMediafile?.id === entity.id
                    ? '!border-2 !border-accent-normal'
                    : ''
                "
                :item-id="entity.uuid"
                :bulk-operations-context="bulkOperationsContext"
                :teaser-metadata="
                  entity.teaserMetadata?.flatMap((metadata) => metadata ?? [])
                "
                :media="
                  entitiesLoading
                    ? undefined
                    : getMediaFilenameFromEntity(entity)
                "
                :thumb-icon="entitiesLoading ? undefined : getThumbnail(entity)"
                :small="listItemRouteName === 'SingleMediafile'"
                :loading="entitiesLoading"
                @click="
                  entitiesLoading || !enableNavigation
                    ? !enableNavigation &&
                      parentEntityId &&
                      entity.type === 'MediaFile'
                      ? updateSelectedEntityMediafile(entity)
                      : undefined
                    : goToEntityPage(entity)
                "
                @dblclick="
                  !enableNavigation && parentEntityId
                    ? goToEntityPage(entity)
                    : undefined
                "
              >
                <template #actions>
                  <!-- Use bulkoperations checkboxes to apply this logic again -->
                </template>
              </GridItem>
            </div>
            <div v-if="entities.length === 0" class="p-4">
              {{ $t("search.noresult") }}
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
import {
  DamsIcons,
  GetEntitiesDocument,
  SearchInputType,
  type AdvancedFilterInput,
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
import FiltersBase from "@/components/filters-new/FiltersBase.vue";
import GridItem from "@/components/GridItem.vue";
import LibraryBar from "@/components/library/LibraryBar.vue";
import ListContainer from "@/components/ListContainer.vue";
import ListItem from "@/components/ListItem.vue";
import MediaViewer from "@/components/base/Mediaviewer.vue";
import useEditMode from "@/composables/useEdit";
import useEntitySingle from "@/composables/useEntitySingle";
import useListItemHelper from "@/composables/useListItemHelper";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import { bulkSelectAllSizeLimit } from "@/main";
import { createPlaceholderEntities } from "@/helpers";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { useQuery } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { watch, ref, onMounted, onUnmounted, toRefs } from "vue";

export type PredefinedEntities = {
  usePredefinedEntities: boolean;
  entities: Entity[];
};

const props = withDefaults(
  defineProps<{
    bulkOperationsContext: Context;
    listItemRouteName: string;
    predefinedEntities?: PredefinedEntities;
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

const { enqueueItemForBulkProcessing, triggerBulkSelectionEvent } =
  useBulkOperations();
const { mediafileSelectionState, updateSelectedEntityMediafile } =
  useEntityMediafileSelector();
const { getMediaFilenameFromEntity } = useListItemHelper();
const { getThumbnail } = useThumbnailHelper();
const { setEntityUuid } = useEntitySingle();
const { isSaved } = useEditMode();
const route = useRoute();
const router = useRouter();

const fetchEnabled = ref<boolean>(false);
const entities = ref<Entity[]>(props.predefinedEntities?.entities || []);
const totalEntityCount = ref<number>(
  props.predefinedEntities ? props.predefinedEntities.entities.length : 0
);
const { searchInputTypeOnDrawer } = toRefs(props);
const displayList = ref<boolean>(false);
const displayGrid = ref<boolean>(false);
const displayPreview = ref<boolean>(props.enablePreview);

const expandFilters = ref<boolean>(false);
const selectedSortOption = ref<string>();
const isAsc = ref<boolean>(false);
const toggles = [
  { isOn: displayList, iconOn: DamsIcons.ListUl, iconOff: DamsIcons.ListUl },
  { isOn: displayGrid, iconOn: DamsIcons.Apps, iconOff: DamsIcons.Apps },
];

const entitiesQueryVariables: GetEntitiesQueryVariables = {
  limit: 20,
  skip: 1,
  searchValue: {
    value: "",
    isAsc: isAsc.value,
    key: "title",
    order_by: "",
  },
  advancedSearchValue: [],
  advancedFilterInputs: [],
  searchInputType: searchInputTypeOnDrawer.value,
};
const {
  onResult: onEntitiesResult,
  loading: entitiesLoading,
  refetch: refetchEntities,
} = useQuery(GetEntitiesDocument, entitiesQueryVariables, () => ({
  notifyOnNetworkStatusChange: true,
  enabled: fetchEnabled.value,
}));
onEntitiesResult((result) => {
  if (result.data && result.data.Entities && !props.predefinedEntities) {
    entities.value = result.data.Entities.results as Entity[];
    totalEntityCount.value = result.data.Entities.count;
  }
});

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
  searchInputType: searchInputTypeOnDrawer.value,
};
const { result: allEntitiesResult, refetch: refetchAllEntities } = useQuery(
  GetEntitiesDocument,
  allEntitiesQueryVariables,
  () => ({ enabled: fetchEnabled.value, fetchPolicy: "network-only" })
);

const setQueryVariables = (resetSkip: boolean = false) => {
  entitiesQueryVariables.searchValue.order_by = selectedSortOption.value;
  entitiesQueryVariables.searchValue.isAsc = isAsc.value;
  if (resetSkip) entitiesQueryVariables.skip = 1;

  allEntitiesQueryVariables.limit = bulkSelectAllSizeLimit;
  allEntitiesQueryVariables.skip = entitiesQueryVariables.skip;
  allEntitiesQueryVariables.searchValue = entitiesQueryVariables.searchValue;
  allEntitiesQueryVariables.advancedSearchValue =
    entitiesQueryVariables.advancedSearchValue;
  allEntitiesQueryVariables.advancedFilterInputs =
    entitiesQueryVariables.advancedFilterInputs;

  if (!props.predefinedEntities) {
    fetchEnabled.value = true;
    refetchEntities(entitiesQueryVariables);
    refetchAllEntities(allEntitiesQueryVariables);
  }
};

const setFilters = (advancedFilterInputs: AdvancedFilterInput[]) => {
  entitiesQueryVariables.advancedFilterInputs = advancedFilterInputs;
  setQueryVariables(true);
};

const bulkSelect = (items = entities.value) => {
  if (props.predefinedEntities) items = props.predefinedEntities.entities;

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

onMounted(() => {
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
  () => entitiesLoading.value,
  (isLoading) => {
    if (!isLoading) return;
    entities.value = createPlaceholderEntities(
      entitiesQueryVariables.limit || 25
    );
  },
  { immediate: true }
);
watch(
  () => props.predefinedEntities?.entities,
  () => {
    if (props.predefinedEntities?.entities) {
      entities.value = props.predefinedEntities?.entities;
      totalEntityCount.value = entities.value.length;
    }
  },
  { immediate: true }
);
watch([displayGrid, expandFilters], () => {
  window.localStorage.setItem(
    "_displayPreferences",
    JSON.stringify({
      grid: displayPreview.value ? false : displayGrid.value,
      expandFilters: expandFilters.value,
    })
  );
});
</script>

<style scoped>
.grid_cols {
  grid-template-columns: repeat(var(--grid-cols), minmax(0, 1fr));
}
</style>
