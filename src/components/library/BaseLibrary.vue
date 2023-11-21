<template>
  <div class="lg:flex bg-neutral-lightest">
    <div
      class="w-full"
      :class="[parentEntityIdentifiers.length > 0 ? 'p-3' : 'px-6']"
    >
      <div
        :class="[
          'top-0 mb-2 pt-4 bg-neutral-lightest',
          { sticky: hasStickyBars },
        ]"
      >
        <div class="flex flex-row items-center gap-y-4">
          <FiltersBase
            v-show="enableAdvancedFilters"
            class="lg:w-[46%]"
            :filter-matcher-mapping="filterMatcherMapping"
            :advanced-filters="advancedFilters"
            :entity-type="filterType || entityType"
            :parent-entity-identifiers="parentEntityIdentifiers"
            :expandFilters="expandFilters"
            :filters-base-initialization-status="
              filtersBaseInitializationStatus
            "
            @apply-filters="setAdvancedFilters"
            @expand-filters="expandFilters = !expandFilters"
          />
          <div
            class="mr-2"
            :class="['flex', { 'ml-4': enableAdvancedFilters }]"
          >
            <BaseToggleGroup v-if="toggles.length > 1" :toggles="toggles" />
          </div>
          <LibraryBar
            v-if="!predefinedEntities"
            :pagination-limit-options="paginationLimitOptions"
            :sort-options="sortOptions"
            :total-items="totalEntityCount || NaN"
            :queryVariables="(queryVariables as GetEntitiesQueryVariables)"
            :library-bar-initialization-status="libraryBarInitializationStatus"
          />
        </div>

        <div
          v-if="enableBulkOperations && !displayPreview"
          class="my-3"
          :class="{ 'flex justify-end': expandFilters }"
        >
          <BulkOperationsActionsBar
            :class="[
              { 'w-[67%]': expandFilters && toggles.length <= 1 },
              { 'w-[69.75%]': expandFilters && toggles.length > 1 },
            ]"
            :context="bulkOperationsContext"
            :total-items-count="totalEntityCount"
            :use-extended-bulk-operations="true"
            :confirm-selection-button="confirmSelectionButton"
            @select-page="bulkSelect"
            @select-all="bulkSelect(allEntitiesResult.Entities.results)"
            @confirm-selection="
              (selection) => emit('confirmSelection', selection)
            "
            @no-bulk-operations-available="() => (enableBulkOperations = false)"
          />
        </div>
      </div>
      <div v-if="entities" :class="{ 'flex justify-end': expandFilters }">
        <div
          id="gridContainer"
          :class="[
            { 'w-[67%]': expandFilters && toggles.length <= 1 },
            { 'w-[69.75%]': expandFilters && toggles.length > 1 },
          ]"
          @click="isSearchLibrary ? closeModal(TypeModals.Search) : undefined"
        >
          <ViewModesList
            v-if="displayList"
            :entities="entities as Entity[]"
            :entities-loading="entitiesLoading"
            :bulk-operations-context="bulkOperationsContext"
            :list-item-route-name="listItemRouteName"
            :disable-previews="disableNewEntityPreviews"
            :enable-navigation="enableNavigation"
            :parent-entity-identifiers="parentEntityIdentifiers"
            :ids-of-non-selectable-entities="idsOfNonSelectableEntities"
            :relation-type="relationType"
            :enable-selection="enableBulkOperations"
          />
          <ViewModesGrid
            v-if="displayGrid"
            :entities="entities as Entity[]"
            :entities-loading="entitiesLoading"
            :bulk-operations-context="bulkOperationsContext"
            :list-item-route-name="listItemRouteName"
            :disable-previews="disableNewEntityPreviews"
            :enable-navigation="enableNavigation"
            :parent-entity-identifiers="parentEntityIdentifiers"
            :ids-of-non-selectable-entities="idsOfNonSelectableEntities"
            :relation-type="relationType"
            :enable-selection="enableBulkOperations"
          />
          <ViewModesMedia
            v-if="displayPreview"
            :entities="entities as Entity[]"
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
import type { ViewModes } from "@/generated-types/type-defs";
import {
  DamsIcons,
  Entitytyping,
  GetEntitiesDocument,
  SearchInputType,
  TypeModals,
} from "@/generated-types/queries";
import type {
  AdvancedFilterInput,
  Entity,
  GetEntitiesQueryVariables,
} from "@/generated-types/queries";
import { useBulkOperations } from "@/composables/useBulkOperations";
import type {
  Context,
  InBulkProcessableItem,
} from "@/composables/useBulkOperations";
import BaseToggleGroup from "@/components/base/BaseToggleGroup.vue";
import BulkOperationsActionsBar from "@/components/bulk-operations/BulkOperationsActionsBar.vue";
import FiltersBase from "@/components/filters/FiltersBase.vue";
import LibraryBar from "@/components/library/LibraryBar.vue";
import useUploadModalDropzone from "@/composables/useUploadModalDropzone";
import ViewModesGrid from "@/components/library/view-modes/ViewModesGrid.vue";
import ViewModesList from "@/components/library/view-modes/ViewModesList.vue";
import ViewModesMedia from "@/components/library/view-modes/ViewModesMedia.vue";
import { bulkSelectAllSizeLimit } from "@/main";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { updateLocalStorage } from "@/helpers";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { useBaseModal } from "@/composables/useBaseModal";
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
    disableNewEntityPreviews?: boolean;
    idsOfNonSelectableEntities?: string[];
    relationType?: string;
    hasStickyBars?: boolean;
    filters?: AdvancedFilterInput[];
    isSearchLibrary?: boolean;
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
    disableNewEntityPreviews: false,
    idsOfNonSelectableEntities: () => [],
    hasStickyBars: true,
    filters: () => [],
    isSearchLibrary: false,
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
} = useBaseLibrary(
  apolloClient as ApolloClient<any>,
  props.parentEntityIdentifiers.length > 0
);
const {
  getUploadStatus,
  setUploadStatus,
  setEntityIdForLinkedUpload,
  setUploadType,
} = useUploadModalDropzone();
const { enqueueItemForBulkProcessing, triggerBulkSelectionEvent } =
  useBulkOperations();
const { closeModal } = useBaseModal();

const displayList = ref<boolean>(false);
const displayGrid = ref<boolean>(false);
const displayPreview = ref<boolean>(props.enablePreview);

const expandFilters = ref<boolean>(false);
const isAsc = ref<boolean>(false);
let toggles: ViewModes.type[] = [];

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
  for (let entity of items) {
    if (
      !props.idsOfNonSelectableEntities.includes(entity.id) ||
      !props.idsOfNonSelectableEntities.includes(entity.uuid)
    ) {
      enqueueItemForBulkProcessing(props.bulkOperationsContext, {
        id: entity.uuid,
        teaserMetadata: formatTeaserMetadata(
          entity.teaserMetadata,
          entity.intialValues
        ),
      });
    }
  }
  triggerBulkSelectionEvent(props.bulkOperationsContext);
};

const initializeBaseLibrary = () => {
  if (!props.predefinedEntities) {
    if (props.filterType) setEntityType(props.filterType as Entitytyping);
    queryVariables.value.searchInputType = props.searchInputTypeOnDrawer;
    getEntities();
  }
};

const setDisplayPreferences = () => {
  const displayPreferences = window.localStorage.getItem("_displayPreferences");
  if (displayPreferences) {
    displayGrid.value = JSON.parse(displayPreferences).grid;
    if (displayGrid.value === false) displayList.value = true;
    expandFilters.value = !props.enableAdvancedFilters
      ? false
      : JSON.parse(displayPreferences).expandFilters;
  }
};

onMounted(() => {
  initializeBaseLibrary();
  setDisplayPreferences();
});

watch(getUploadStatus, (status) => {
  if (status === "success") {
    getEntities(true);
    setUploadStatus("no-upload");
  }
});
watch(
  () => route.path,
  () => {
    if (props.parentEntityIdentifiers.length === 0) {
      setEntityIdForLinkedUpload(undefined);
      setUploadType("batch");
    }

    if (
      !props.predefinedEntities &&
      router.currentRoute.value.name !== "SingleEntity"
    ) {
      libraryBarInitializationStatus.value = "not-initialized";
      filtersBaseInitializationStatus.value = "not-initialized";
      setEntityType(entityType.value);

      const searchInputType =
        entityType.value === Entitytyping.Mediafile
          ? SearchInputType.AdvancedInputMediaFilesType
          : SearchInputType.AdvancedInputType;
      queryVariables.value.searchInputType = searchInputType;
      getEntities();
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

watch(
  () => props.filters,
  () => {
    setAdvancedFilters(props.filters);
  }
);

watch(
  () => entities.value,
  () => {
    toggles = [];
    if (entities.value.length === 0 || !entities.value[0].allowedViewModes)
      return;
    const viewModes: any[] = entities.value[0].allowedViewModes.viewModes;
    if (viewModes.includes(ViewModesList.__name))
      toggles.unshift({
        isOn: displayList,
        iconOn: DamsIcons.ListUl,
        iconOff: DamsIcons.ListUl,
      });
    if (viewModes.includes(ViewModesGrid.__name))
      toggles.push({
        isOn: displayGrid,
        iconOn: DamsIcons.Apps,
        iconOff: DamsIcons.Apps,
      });
    initializeBaseLibrary();
    if (viewModes.includes(ViewModesMedia.__name) || props.enablePreview)
      toggles.push({
        isOn: displayPreview,
        iconOn: DamsIcons.Image,
        iconOff: DamsIcons.Image,
      });
    setDisplayPreferences();
  }
);
watch([displayGrid, expandFilters], () => {
  displayList.value = !displayGrid.value;
  updateLocalStorage("_displayPreferences", {
    grid: displayPreview.value ? false : displayGrid.value,
    expandFilters: expandFilters.value,
  });
});
</script>
