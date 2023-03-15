<template>
  <div class="lg:flex">
    <FilterSideBar
      v-show="!isDrawerHiding && !isHideFilters"
      @activeFilters="setFilters"
      :accepted-entity-types="acceptedEntityTypes ? acceptedEntityTypes : []"
      :advancedFiltersChoice="advancedFiltersChoice"
    />
    <div class="px-6 w-full">
      <div class="flex flex-row flex-wrap gap-y-4">
        <div v-show="acceptedEntityTypes.length === 0" class="mt-8 mr-4 flex">
          <IconToggle
            v-if="!isHideFilters"
            v-model:checked="isDrawerHiding"
            :icon-on="Unicons.SearchGlass.name"
            :icon-off="Unicons.Filter.name"
          />
          <div :class="['mt-1.5', { 'ml-2': !isHideFilters }]">
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
          class="pl-4 my-2 flex flex-row justify-left"
        >
          <BaseDropdown
            v-if="totalEntityCount > 0"
            v-model="queryVariables.limit"
            :options="paginationLimits"
            :label="$t('library.items')"
          />
          <BaseDropdown
            v-if="
              totalEntityCount > 1 && queryVariables.searchValue.value != ''
            "
            v-model="queryVariables.sort"
            :options="['Title', 'object_number']"
            :label="$t('library.sort')"
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
      <ListContainer id="gridContainer" :class="displayGrid ? 'p-5' : 'p-1'">
        <div v-if="loading">
          <ListItem
            v-for="n in queryVariables.limit"
            :key="n"
            :title="$t('library.loading')"
            :loading="true"
            :meta="[
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
  type Prop,
} from "vue";
import type { PropType } from "vue";
import ListContainer from "../ListContainer.vue";
import BaseButton from "./BaseButton.vue";
import InputField from "./InputField.vue";
import BaseDropdown from "./BaseDropdown.vue";
import { useQuery } from "@vue/apollo-composable";
import ListItem from "../ListItem.vue";
import { useRouter } from "vue-router";
import { Unicons } from "../../types";
import {
  GetEntitiesDocument,
  SearchInputType,
  type Entity,
} from "../../generated-types/queries";
import type {
  GetEntitiesQueryVariables,
  Maybe,
} from "../../generated-types/queries";
import FilterSideBar from "../FilterSideBar.vue";
import IconToggle from "./IconToggle.vue";
import useThumbnailHelper from "../../composables/useThumbnailHelper";
import useMetaDataHelper, {
  beingAdded,
} from "../../composables/useMetaDataHelper";
import BaseIcon from "./BaseIcon.vue";
import GridItem from "../GridItem.vue";
import { setCookie, getCookie } from "tiny-cookie";
import useListItemHelper from "../../composables/useListItemHelper";

export default defineComponent({
  name: "BaseLibrary",
  components: {
    ListContainer,
    ListItem,
    BasePagination,
    BaseButton,
    BaseDropdown,
    FilterSideBar,
    IconToggle,
    InputField,
    BaseIcon,
    GridItem,
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
    hasSimpleSearch: Boolean,
    searchInputTypeOnDrawer: {
      type: String as PropType<Maybe<SearchInputType>>,
    },
    searchInputType: {
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
      type: Array as PropType<Entity[]>,
      required: false,
    },
    isHideFilters: Boolean,
  },
  emits: ["addSelection"],
  setup: (props, { emit }) => {
    const entities = ref<Entity[]>(props.predefinedEntities || []);
    const totalEntityCount = ref<number>(
      props.predefinedEntities ? props.predefinedEntities.length : 0
    );
    const { getThumbnail } = useThumbnailHelper();
    const { getMediaFilenameFromEntity } = useListItemHelper();
    const router = useRouter();
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
        isAsc: false,
        key: "title",
      },
      advancedSearchValue: [],
      searchInputType: isDrawerHiding.value
        ? props.searchInputType
        : props.searchInputTypeOnDrawer,
    });

    watch(isDrawerHiding, () => {
      queryVariables.searchInputType = isDrawerHiding.value
        ? props.searchInputType
        : props.searchInputTypeOnDrawer;
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
      }
    );

    onResult((result) => {
      if (result.data) {
        entities.value = result.data.Entities.results as Entity[];
        totalEntityCount.value = result.data.Entities.count;
      }
    });

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

    refetch();

    return {
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
    };
  },
});
</script>

<style scoped>
.grid_cols {
  grid-template-columns: repeat(var(--grid-cols), minmax(0, 1fr));
}
</style>
