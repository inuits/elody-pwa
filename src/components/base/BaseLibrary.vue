<template>
  <div class="lg:flex bg-neutral-lightest">
    <div class="px-6 w-full">
      <div class="flex flex-row gap-y-4">
        <FiltersBase
          v-if="enableAdvancedFilters"
          :expandFilters="expandFilters"
          class="lg:w-[46%]"
          :entity-type="filterType || route.meta.entityType as string"
          @apply-filters="setFilters"
          @expand-filters="expandFilters = !expandFilters"
        />
        <div :class="['flex', { 'ml-4': enableAdvancedFilters }]">
          <IconToggle
            v-model:checked="displayGrid"
            :icon-on="Unicons.Apps.name"
            :icon-off="Unicons.ListUl.name"
            class="ml-2"
          />
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
          @select-page="bulkSelect"
          @select-all="bulkSelect(allEntitiesResult.Entities.results)"
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
          <div v-if="!displayGrid && entities">
            <div>
              <ListItem
                :small="listItemRouteName === 'SingleMediafile'"
                v-for="entity in entities"
                :key="entity?.id"
                :item-id="entity.id"
                :bulk-operations-context="bulkOperationsContext"
                :teaser-metadata="
                  entity?.teaserMetadata?.flatMap((metadata) => metadata ?? [])
                "
                :loading="loading"
                :media="
                  loading ? undefined : getMediaFilenameFromEntity(entity)
                "
                :thumb-icon="loading ? undefined : getThumbnail(entity)"
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
            <div :class="`grid grid_cols gap-2 justify-items-center`">
              <GridItem
                v-for="entity in entities"
                :key="entity?.id"
                :itemid="entity?.id"
                :bulk-operations-context="bulkOperationsContext"
                :meta="entity?.teaserMetadata"
                :media="getMediaFilenameFromEntity(entity)"
                :thumb-icon="getThumbnail(entity)"
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
            {{}}
          </div>
        </ListContainer>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { paginationLimits } from "./BasePagination.vue";
import { defineComponent, watch, reactive, ref, onMounted } from "vue";
import type { PropType } from "vue";
import ListContainer from "../ListContainer.vue";
import BulkOperationsActionsBar from "@/components/bulk-operations/BulkOperationsActionsBar.vue";
import { useQuery } from "@vue/apollo-composable";
import ListItem from "../ListItem.vue";
import { useRoute, useRouter } from "vue-router";
import { Unicons } from "../../types";
import {
  GetEntitiesDocument,
  SearchInputType,
  type Asset,
  type Entity,
  type GetEntitiesQueryVariables,
  type Maybe,
  type AdvancedFilterInput,
} from "../../generated-types/queries";
import {
  useBulkOperations,
  type Context,
} from "@/composables/useBulkOperations";
import FiltersBase from "@/components/filters-new/FiltersBase.vue";
import IconToggle from "../toggles/IconToggle.vue";
import useThumbnailHelper from "../../composables/useThumbnailHelper";
import useMetaDataHelper from "../../composables/useMetaDataHelper";
import GridItem from "../GridItem.vue";
import useListItemHelper from "../../composables/useListItemHelper";
import { bulkSelectAllSizeLimit } from "@/main";
import LibraryBar from "../library/LibraryBar.vue";
import { createPlaceholderEntities } from "@/helpers";

export type PredefinedEntities = {
  usePredefinedEntities: Boolean;
  entities: Asset[];
};

export default defineComponent({
  name: "BaseLibrary",
  components: {
    ListContainer,
    ListItem,
    IconToggle,
    GridItem,
    BulkOperationsActionsBar,
    FiltersBase,
    LibraryBar,
  },
  props: {
    listItemRouteName: {
      type: String,
      required: true,
    },
    filterType: {
      type: String,
    },
    enableBulkOperations: {
      type: Boolean,
      required: false,
      default: true,
    },
    bulkOperationsContext: {
      type: String as PropType<Context>,
      required: true,
    },
    searchInputTypeOnDrawer: {
      type: String as PropType<Maybe<SearchInputType>>,
    },
    predefinedEntities: {
      type: Object as PropType<PredefinedEntities>,
      required: false,
    },
    enableAdvancedFilters: {
      type: Boolean,
      required: false,
      default: true,
    },
    enableNavigation: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  emits: ["addSelection"],
  setup: (props) => {
    const entities = ref<Asset[]>(props.predefinedEntities?.entities || []);
    const totalEntityCount = ref<number>(
      props.predefinedEntities ? props.predefinedEntities.entities.length : 0
    );
    const { getThumbnail } = useThumbnailHelper();
    const { getMediaFilenameFromEntity } = useListItemHelper();
    const router = useRouter();
    const route = useRoute();
    const { isNotAlreadyAdded, mediafiles, selectedRelationFieldMetadata } =
      useMetaDataHelper();
    const displayGrid = ref<boolean>(false);
    const selectedSortOption = ref<string>();
    const isAsc = ref<boolean>(false);
    const expandFilters = ref<boolean>(false);

    onMounted(() => {
      const displayPreferences = window.localStorage.getItem(
        "_displayPreferences"
      );
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

    const { result: allEntitiesResult } = useQuery(
      GetEntitiesDocument,
      queryVariables,
      {
        enabled: true,
      }
    );

    const setFilters = (advancedFilterInputs: AdvancedFilterInput[]) => {
      queryVariables.advancedFilterInputs = advancedFilterInputs;
    };

    const { onResult, loading, refetch } = useQuery(
      GetEntitiesDocument,
      queryVariables,
      {
        notifyOnNetworkStatusChange: true,
        enabled: props.predefinedEntities ? false : true,
      }
    );

    onResult((result) => {
      if (result.data && result.data.Entities && !props.predefinedEntities) {
        entities.value = result.data.Entities.results as Entity[];
        totalEntityCount.value = result.data.Entities.count;
      }
    });

    const { enqueueItemForBulkProcessing, triggerBulkSelectionEvent } =
      useBulkOperations();
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
      }
      setCssGridVariable(colAmount);
    };

    window.addEventListener("resize", () => {
      if (displayGrid.value) {
        calculateGridColumns();
      }
    });

    const goToEntityPage = (entity: Asset) => {
      const entityId =
        entity?.id ||
        entity.teaserMetadata?.find((dataItem) => dataItem?.key === "id")
          ?.value;

      router.push({
        name: props.listItemRouteName,
        params: { id: entityId },
      });
    };

    watch(
      () => loading.value,
      (isLoading) => {
        if (!isLoading) {
          return;
        }
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

    if (!props.predefinedEntities) refetch();

    return {
      setNewQueryVariables,
      selectedSortOption,
      paginationLimits,
      queryVariables,
      loading,
      Unicons,
      router,
      entities,
      totalEntityCount,
      setFilters,
      getThumbnail,
      isNotAlreadyAdded,
      mediafiles,
      selectedRelationFieldMetadata,
      displayGrid,
      calculateGridColumns,
      getMediaFilenameFromEntity,
      bulkSelect,
      allEntitiesResult,
      isAsc,
      route,
      goToEntityPage,
      expandFilters: expandFilters,
    };
  },
});
</script>

<style scoped>
.grid_cols {
  grid-template-columns: repeat(var(--grid-cols), minmax(0, 1fr));
}
</style>
