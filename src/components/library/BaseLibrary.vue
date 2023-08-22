<template>
  <div class="lg:flex bg-neutral-lightest">
    <div
      class="w-full"
      :class="parentEntityIdentifiers.length > 0 ? 'p-3' : 'px-6'"
    >
      <div class="sticky top-0 mb-2 pt-4 bg-neutral-lightest">
        <div class="flex flex-row items-center gap-y-4">
          <FiltersBase
            v-if="filtersBaseInitializationStatus === 'initialized'"
            v-show="enableAdvancedFilters"
            class="lg:w-[46%]"
            :filter-matcher-mapping="filterMatcherMapping"
            :advanced-filters="advancedFilters"
            :entity-type="filterType || entityType"
            :parent-entity-identifiers="parentEntityIdentifiers"
            :expandFilters="expandFilters"
            @apply-filters="setAdvancedFilters"
            @expand-filters="expandFilters = !expandFilters"
          />
          <div
            class="mr-2"
            :class="['flex', { 'ml-4': enableAdvancedFilters }]"
          >
            <BaseToggleGroup :toggles="toggles" />
          </div>
          <LibraryBar
            v-if="
              libraryBarInitializationStatus === 'initialized' &&
              !predefinedEntities
            "
            :pagination-limit-options="paginationLimitOptions"
            :sort-options="sortOptions"
            :total-items="totalEntityCount || NaN"
            :queryVariables="(queryVariables as GetEntitiesQueryVariables)"
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
      </div>
      <div v-if="entities" :class="{ 'flex justify-end': expandFilters }">
        <div id="gridContainer" :class="[{ 'w-[69.75%]': expandFilters }]">
          <ViewModesList
            v-if="displayList"
            :entities="entities"
            :entities-loading="entitiesLoading"
            :bulk-operations-context="bulkOperationsContext"
            :list-item-route-name="listItemRouteName"
            :enable-navigation="enableNavigation"
            :parent-entity-identifiers="parentEntityIdentifiers"
            @go-to-entity-page="(entity) => goToEntityPage(entity)"
          />

          <ViewModesGrid
            v-if="displayGrid"
            :entities="entities"
            :entities-loading="entitiesLoading"
            :bulk-operations-context="bulkOperationsContext"
            :list-item-route-name="listItemRouteName"
            :enable-navigation="enableNavigation"
            :parent-entity-identifiers="parentEntityIdentifiers"
            @go-to-entity-page="(entity) => goToEntityPage(entity)"
          />

          <ViewModesMedia
            v-if="displayPreview"
            :entities="entities"
            :entities-loading="entitiesLoading"
          />
        </div>
      </div>

      <div v-if="entities.length === 0">
        {{ t("search.noresult") }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ApolloClient } from "@apollo/client/core";
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
import LibraryBar from "@/components/library/LibraryBar.vue";
import useEntitySingle from "@/composables/useEntitySingle";
import useUploadModalDropzone from "@/composables/useUploadModalDropzone";
import ViewModesGrid from "@/components/library/view-modes/ViewModesGrid.vue";
import ViewModesList from "@/components/library/view-modes/ViewModesList.vue";
import ViewModesMedia from "@/components/library/view-modes/ViewModesMedia.vue";
import { bulkSelectAllSizeLimit } from "@/main";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { updateLocalStorage } from "@/helpers";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { useI18n } from "vue-i18n";
import { useQuery } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { watch, ref, onMounted, inject, computed } from "vue";

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
    parentEntityIdentifiers?: string[];
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
    parentEntityIdentifiers: () => [],
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
  formatTeaserMetadata,
} = useBaseLibrary(apolloClient as ApolloClient<any>);
const { setEntityMediafiles, updateSelectedEntityMediafile } =
  useEntityMediafileSelector();
const { enqueueItemForBulkProcessing, triggerBulkSelectionEvent } =
  useBulkOperations();
const { getUploadStatus, setUploadStatus } = useUploadModalDropzone();
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
      teaserMetadata: formatTeaserMetadata(
        entity.teaserMetadata,
        entity.intialValues
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
    entity.uuid ||
    entity.teaserMetadata?.find((dataItem) => dataItem?.key === "id")?.value;

  router.push({
    name: props.listItemRouteName,
    params: { id: entityId },
  });
};

const initializeBaseLibrary = () => {
  if (!props.predefinedEntities) {
    if (props.filterType) setEntityType(props.filterType as Entitytyping);
    queryVariables.value.searchInputType = props.searchInputTypeOnDrawer;
  }
};

const setDisplayPreferences = () => {
  const displayPreferences = window.localStorage.getItem("_displayPreferences");
  if (displayPreferences) {
    displayGrid.value = JSON.parse(displayPreferences).grid;
    expandFilters.value = !props.enableAdvancedFilters
      ? false
      : JSON.parse(displayPreferences).expandFilters;
  }
};

onMounted(() => {
  initializeBaseLibrary();
  if (props.enablePreview)
    toggles.push({
      isOn: displayPreview,
      iconOn: DamsIcons.Image,
      iconOff: DamsIcons.Image,
    });
  setDisplayPreferences();
});

watch(getUploadStatus, (status) => {
  if (status === "success") {
    getEntities();
    setUploadStatus("no-upload");
  }
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
