<template>
  <div class="lg:flex bg-neutral-lightest">
    <div class="px-6 w-full">
      <div class="flex flex-row items-center gap-y-4">
        <FiltersBase
          v-if="enableAdvancedFilters"
          class="lg:w-[46%]"
          :expandFilters="expandFilters"
          :entity-type="filterType || route.meta.entityType as string"
          @apply-filters="setFilters"
          @expand-filters="expandFilters = !expandFilters"
        />

        <div class="mr-2" :class="['flex', { 'ml-4': enableAdvancedFilters }]">
          <BaseToggleGroup :toggles="toggles" />
        </div>

        <LibraryBar
          v-if="!predefinedEntities"
          :total-items="totalEntityCount"
          v-model:limit="queryVariables.limit"
          v-model:skip="queryVariables.skip"
          v-model:sortKey="selectedSortOption"
          v-model:isAsc="isAsc"
          @update:limit="setNewQueryVariables"
          @update:skip="setNewQueryVariables"
          @update:sortKey="setNewQueryVariables"
          @update:isAsc="setNewQueryVariables"
        />
      </div>

      <div
        v-if="enableBulkOperations"
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
                :item-id="entity.id"
                :bulk-operations-context="bulkOperationsContext"
                :teaser-metadata="
                  entity.teaserMetadata?.flatMap((metadata) => metadata ?? [])
                "
                :media="
                  loading ? undefined : getMediaFilenameFromEntity(entity)
                "
                :thumb-icon="loading ? undefined : getThumbnail(entity)"
                :small="listItemRouteName === 'SingleMediafile'"
                :loading="loading"
                @click="
                  loading || !enableNavigation
                    ? undefined
                    : goToEntityPage(entity)
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
                :item-id="entity.id"
                :bulk-operations-context="bulkOperationsContext"
                :teaser-metadata="
                  entity.teaserMetadata?.flatMap((metadata) => metadata ?? [])
                "
                :media="
                  loading ? undefined : getMediaFilenameFromEntity(entity)
                "
                :thumb-icon="loading ? undefined : getThumbnail(entity)"
                :small="listItemRouteName === 'SingleMediafile'"
                :loading="loading"
                @click="
                  loading || !enableNavigation
                    ? undefined
                    : goToEntityPage(entity)
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
import useListItemHelper from "@/composables/useListItemHelper";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import { bulkSelectAllSizeLimit } from "@/main";
import { createPlaceholderEntities } from "@/helpers";
import { useQuery } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { watch, reactive, ref, onMounted } from "vue";

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
    enableAdvancedFilters?: boolean;
    enableBulkOperations?: boolean;
    filterType?: string;
    confirmSelectionButton?: boolean;
    enableNavigation?: boolean;
  }>(),
  {
    predefinedEntities: undefined,
    searchInputTypeOnDrawer: SearchInputType.AdvancedInputType,
    enableAdvancedFilters: true,
    enableBulkOperations: true,
    filterType: undefined,
    confirmSelectionButton: false,
    enableNavigation: true,
  }
);

const emit = defineEmits<{
  (event: "confirmSelection", selectedItems: InBulkProcessableItem[]): void;
}>();

const { enqueueItemForBulkProcessing, triggerBulkSelectionEvent } =
  useBulkOperations();
const { getMediaFilenameFromEntity } = useListItemHelper();
const { getThumbnail } = useThumbnailHelper();
const route = useRoute();
const router = useRouter();

const entities = ref<Entity[]>(props.predefinedEntities?.entities || []);
const totalEntityCount = ref<number>(
  props.predefinedEntities ? props.predefinedEntities.entities.length : 0
);
const displayList = ref<boolean>(false);
const displayGrid = ref<boolean>(false);
const expandFilters = ref<boolean>(false);
const selectedSortOption = ref<string>();
const isAsc = ref<boolean>(false);
const toggles = [
  { isOn: displayList, iconOn: DamsIcons.ListUl, iconOff: DamsIcons.ListUl },
  { isOn: displayGrid, iconOn: DamsIcons.Apps, iconOff: DamsIcons.Apps },
];

onMounted(() => {
  const displayPreferences = window.localStorage.getItem("_displayPreferences");
  if (displayPreferences) {
    displayGrid.value = JSON.parse(displayPreferences).grid;
    expandFilters.value = !props.enableAdvancedFilters
      ? false
      : JSON.parse(displayPreferences).expandFilters;
  }
  calculateGridColumns();
});

const queryVariables = reactive<GetEntitiesQueryVariables>({
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
});

const setNewQueryVariables = () => {
  const newVariables = { ...queryVariables };
  if (selectedSortOption.value && newVariables?.searchValue) {
    newVariables.searchValue.order_by = selectedSortOption.value;
    newVariables.searchValue.isAsc = isAsc.value;
  }
  refetch(newVariables);
};

const {
  onResult: onEntitiesResult,
  loading,
  refetch,
} = useQuery(GetEntitiesDocument, queryVariables, {
  notifyOnNetworkStatusChange: true,
  enabled: props.predefinedEntities ? false : true,
});

onEntitiesResult((result) => {
  if (result.data && result.data.Entities && !props.predefinedEntities) {
    entities.value = result.data.Entities.results as Entity[];
    totalEntityCount.value = result.data.Entities.count;
  }
});

const setFilters = (advancedFilterInputs: AdvancedFilterInput[]) => {
  queryVariables.advancedFilterInputs = advancedFilterInputs;
};

const { result: allEntitiesResult } = useQuery(
  GetEntitiesDocument,
  queryVariables,
  { enabled: true }
);

const bulkSelect = (items = entities.value) => {
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
  const entityId =
    entity?.id ||
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

  if (gridContainerWidth)
    colAmount = Math.floor(gridContainerWidth / gridItemWidth);
  setCssGridVariable(colAmount);
};

window.addEventListener("resize", () => {
  if (displayGrid.value) calculateGridColumns();
});

if (!props.predefinedEntities) refetch();

watch(
  () => loading.value,
  (isLoading) => {
    if (!isLoading) return;
    entities.value = createPlaceholderEntities(queryVariables.limit || 25);
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
      grid: displayGrid.value,
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
