<template>
  <div class="lg:flex bg-neutral-lightest">
    <FiltersBase
      v-show="!isDrawerHiding && !isHideFilters"
      :entity-type="route.meta.entityType as string"
    />
    <div class="px-6 w-full">
      <div class="flex flex-row flex-wrap gap-y-4">
        <div v-show="acceptedEntityTypes.length === 0" class="mr-4 flex">
          <IconToggle
            v-if="!isHideFilters"
            v-model:checked="isDrawerHiding"
            :icon-on="Unicons.WindowMaximize.name"
            :icon-off="Unicons.WindowGrid.name"
          />
          <div :class="[{ 'ml-2': !isHideFilters }]">
            <IconToggle
              v-model:checked="displayGrid"
              :icon-on="Unicons.Apps.name"
              :icon-off="Unicons.ListUl.name"
              class="ml-2"
            />
          </div>
        </div>
        <InputField
          v-show="acceptedEntityTypes.length === 0 && hasSimpleSearch"
          v-model="queryVariables.searchValue.value"
          :debounce="true"
          :placeholder="searchPlaceholder"
          :label="$t('library.search')"
          :is-disabled="loading"
          :bg-color="'neutral-20'"
          :disabled="!isDrawerHiding"
        />
        <div
          v-show="acceptedEntityTypes.length === 0"
          class="pl-4 flex flex-row justify-left"
        >
          <BaseDropdown
            v-if="totalEntityCount > 0"
            v-model="queryVariables.limit"
            :options="paginationLimits"
            :label="$t('library.items')"
          />
          <NewBaseDropdown
            v-if="totalEntityCount > 1 && selectedSortOption"
            class="mx-4"
            v-model="selectedSortOption"
            :options="sortOptions"
            :label="$t('library.sort')"
          />
          <SingleIconToggle
            :icon-on="Unicons.AngleUp.name"
            :icon-off="Unicons.AngleDown.name"
            @update:checked="isAsc = !isAsc"
          />
        </div>
        <div class="flex-grow"></div>
        <BasePagination
          v-if="totalEntityCount > 0"
          v-model:skip="queryVariables.skip"
          v-model:limit="queryVariables.limit"
          :loading="loading"
          :total-items="totalEntityCount"
        />
      </div>

      <div class="my-3">
        <BulkOperationsActionsBar
          :context="bulkOperationsContext"
          :total-items-count="totalEntityCount"
          :use-extended-bulk-operations="true"
          @select-page="bulkSelect"
          @select-all="bulkSelect(allEntitiesResult.Entities.results)"
        />
      </div>

      <ListContainer id="gridContainer" :class="displayGrid ? 'p-5' : 'p-1'">
        <div v-if="loading">
          <ListItem
            v-for="n in queryVariables.limit"
            :key="n"
            :title="$t('library.loading')"
            :bulk-operations-context="bulkOperationsContext"
            :loading="true"
            :teaser-metadata="[
              { key: '/', value: '/', label: '/' },
              { key: '/', value: '/', label: '/' },
              { key: '/', value: '/', label: '/' },
              { key: '/', value: '/', label: '/' },
            ]"
          >
            <template #actions>
              <BaseButton
                :loading="true"
                class="ml-2"
                :icon="Unicons.Eye.name"
              />
            </template>
          </ListItem>
        </div>

        <div v-else-if="!displayGrid && entities">
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
              :media="getMediaFilenameFromEntity(entity)"
              :thumb-icon="getThumbnail(entity)"
              @click="
                !enableSelection &&
                  router.push({
                    name: listItemRouteName,
                    params: { id: entity?.id },
                  })
              "
            >
              <template #actions>
                <BaseButton
                  v-if="
                    isNotAlreadyAdded(
                      entity,
                      mediafiles,
                      selectedRelationFieldMetadata
                    ) && enableSelection
                  "
                  :loading="loading"
                  class="ml-2"
                  :icon="Unicons.PlusCircle.name"
                  @click="addSelection(entity)"
                />
                <BaseIcon
                  v-else-if="enableSelection"
                  :name="Unicons.Check.name"
                  fill="green"
                  width="40px"
                  class="mr-3"
                />

                <BaseButton
                  v-else
                  :loading="loading"
                  class="ml-2"
                  :icon="Unicons.Eye.name"
                  @click="
                    router.push({
                      name: listItemRouteName,
                      params: { id: entity?.id },
                    })
                  "
                />
              </template>
            </ListItem>
          </div>

          <div v-if="entities.length === 0" class="p-4">
            {{ $t("search.noresult") }}
          </div>
        </div>
        <div v-else-if="displayGrid && entities">
          <div :class="`grid grid_cols gap-2 justify-items-center`">
            <GridItem
              v-for="entity in entities"
              :key="entity?.id"
              :meta="entity?.teaserMetadata"
              :media="getMediaFilenameFromEntity(entity)"
              :thumb-icon="getThumbnail(entity)"
              @click="
                !enableSelection &&
                  router.push({
                    name: listItemRouteName,
                    params: { id: entity?.id },
                  })
              "
            >
              <template #actions>
                <BaseButton
                  v-if="
                    isNotAlreadyAdded(
                      entity,
                      mediafiles,
                      selectedRelationFieldMetadata
                    ) && enableSelection
                  "
                  :loading="loading"
                  class="ml-2"
                  :icon="Unicons.PlusCircle.name"
                  @click="addSelection(entity)"
                />
                <BaseIcon
                  v-else-if="enableSelection"
                  :name="Unicons.Check.name"
                  fill="green"
                  width="40px"
                  class="mr-3"
                />
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
</template>

<script lang="ts">
import BasePagination, { paginationLimits } from "./BasePagination.vue";
import {
  defineComponent,
  watch,
  reactive,
  ref,
  onMounted,
  nextTick,
} from "vue";
import type { PropType } from "vue";
import ListContainer from "../ListContainer.vue";
import BaseButton from "./BaseButton.vue";
import InputField from "./InputField.vue";
import BaseDropdown from "./BaseDropdown.vue";
import NewBaseDropdown from "./NewBaseDropdown.vue";
import BulkOperationsActionsBar from "@/components/bulk-operations/BulkOperationsActionsBar.vue";
import { useQuery } from "@vue/apollo-composable";
import ListItem from "../ListItem.vue";
import { useRoute, useRouter } from "vue-router";
import { Unicons } from "../../types";
import {
  GetEntitiesDocument,
  SearchInputType,
  GetSortOptionsDocument,
  type Asset,
  type Entity,
  type GetEntitiesQueryVariables,
  type Maybe,
  type MetadataFieldOption,
} from "../../generated-types/queries";
import {
  useBulkOperations,
  type Context,
} from "@/composables/useBulkOperations";
import FiltersBase from "@/components/filters-new/FiltersBase.vue";
import IconToggle from "../toggles/IconToggle.vue";
import useThumbnailHelper from "../../composables/useThumbnailHelper";
import useMetaDataHelper, {
  beingAdded,
} from "../../composables/useMetaDataHelper";
import BaseIcon from "./BaseIcon.vue";
import GridItem from "../GridItem.vue";
import { setCookie, getCookie } from "tiny-cookie";
import useListItemHelper from "../../composables/useListItemHelper";
import { bulkSelectAllSizeLimit } from "@/main";
import SingleIconToggle from "../toggles/SingleIconToggle.vue";

export type PredefinedEntities = {
  usePredefinedEntities: Boolean;
  entities: Asset[];
};

export default defineComponent({
  name: "BaseLibrary",
  components: {
    ListContainer,
    ListItem,
    BasePagination,
    BaseButton,
    BaseDropdown,
    IconToggle,
    InputField,
    BaseIcon,
    GridItem,
    NewBaseDropdown,
    BulkOperationsActionsBar,
    SingleIconToggle,
    FiltersBase,
  },
  props: {
    advancedFiltersChoice: {
      type: String,
      default: "entityFilters",
    },
    searchPlaceholder: {
      type: String,
      default: "Search...",
    },
    listItemRouteName: {
      type: String,
      required: true,
    },
    bulkOperationsContext: {
      type: String as PropType<Context>,
      required: true,
    },
    hasSimpleSearch: Boolean,
    searchInputTypeOnDrawer: {
      type: String as PropType<Maybe<SearchInputType>>,
    },
    enableSelection: {
      type: Boolean,
      default: false,
    },
    acceptedEntityTypes: {
      type: Array as PropType<Maybe<string>[]>,
      default: () => [],
      required: false,
    },
    predefinedEntities: {
      type: Object as PropType<PredefinedEntities>,
      required: false,
    },
    isHideFilters: Boolean,
  },
  emits: ["addSelection"],
  setup: (props, { emit }) => {
    const entities = ref<Asset[]>(props.predefinedEntities?.entities || []);
    const totalEntityCount = ref<number>(
      props.predefinedEntities ? props.predefinedEntities.entities.length : 0
    );
    const { getThumbnail } = useThumbnailHelper();
    const { getMediaFilenameFromEntity } = useListItemHelper();
    const router = useRouter();
    const route = useRoute();
    const {
      isNotAlreadyAdded,
      mediafiles,
      selectedRelationFieldMetadata,
      removeFromRelationsToBeDeletedList,
    } = useMetaDataHelper();
    const paginationInfo = reactive({
      limit: 20,
      skip: 1,
    });
    const displayGrid = ref<boolean>(false);
    const sortOptions = ref<MetadataFieldOption[]>([]);
    const selectedSortOption = ref<MetadataFieldOption>({
      label: "",
      value: "",
    });
    const isAsc = ref<boolean>(false);

    watch(
      () => [selectedSortOption.value, isAsc.value],
      () => {
        const newVariables = { ...queryVariables };
        if (selectedSortOption.value && newVariables?.searchValue) {
          newVariables.searchValue.order_by = selectedSortOption.value.value;
          newVariables.searchValue.isAsc = isAsc.value;
        }
        refetch(newVariables);
      }
    );

    const { onResult: onSortOptionsResult } = useQuery(GetSortOptionsDocument);

    onSortOptionsResult((res) => {
      const options = res.data.SortOptions.options;
      sortOptions.value = options;
      selectedSortOption.value = options[0];
    });

    onMounted(() => {
      const displayPreference = getCookie("_displayPreference");
      if (displayPreference) {
        displayGrid.value = JSON.parse(displayPreference).grid;
      }
      calculateGridColumns();
    });

    const isDrawerHiding = ref(
      props.acceptedEntityTypes.length === 0 ? true : false
    );

    if (props.hasSimpleSearch === false) {
      isDrawerHiding.value = false;
    }

    const setFilters = (value: any) => {
      queryVariables.advancedSearchValue = value;
      queryVariables.limit = paginationInfo.limit;
      queryVariables.skip = paginationInfo.skip;
    };

    const queryVariables = reactive<GetEntitiesQueryVariables>({
      limit: paginationInfo.limit,
      skip: paginationInfo.skip,
      searchValue: {
        value: "",
        isAsc: isAsc.value,
        key: "title",
        order_by: selectedSortOption.value.value,
      },
      advancedSearchValue: [],
      searchInputType: props.searchInputTypeOnDrawer,
    });

    watch(isDrawerHiding, () => {
      nextTick(() => {
        calculateGridColumns();
      });
    });

    watch(displayGrid, () => {
      setCookie(
        "_displayPreference",
        JSON.stringify({ grid: displayGrid.value }),
        {
          expires: "1Y",
        }
      );
    });

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

    const { result: allEntitiesResult } = useQuery(
      GetEntitiesDocument,
      {
        limit: bulkSelectAllSizeLimit,
        skip: 1,
        searchValue: {
          value: "",
          isAsc: isAsc.value,
          key: "title",
          order_by: selectedSortOption.value.value,
        },
        advancedSearchValue: [],
        searchInputType: props.searchInputTypeOnDrawer,
      },
      {
        enabled: true,
      }
    );

    const addSelection = (entity: any) => {
      beingAdded.value = "";
      removeFromRelationsToBeDeletedList(entity.uuid);
      emit("addSelection", entity);
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

    if (!props.predefinedEntities) refetch();

    return {
      selectedSortOption,
      sortOptions,
      paginationLimits,
      queryVariables,
      addSelection,
      isDrawerHiding,
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
    };
  },
});
</script>

<style scoped>
.grid_cols {
  grid-template-columns: repeat(var(--grid-cols), minmax(0, 1fr));
}
</style>
