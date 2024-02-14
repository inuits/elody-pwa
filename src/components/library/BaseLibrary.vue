<template>
  <div>
    <div v-if="selectInputFieldType">
      <base-input-autocomplete
        autocomplete-style="defaultWithBorder"
        :options="entityDropdownOptions"
        :select-type="selectInputFieldType"
        :model-value="selectedDropdownOptions"
        @update:model-value="
          (value) => {
            replaceRelationsFromSameType(
              mapDropdownOptionsToBulkProcessableItem([...value]),
              relationType as string,
            );
            selectedDropdownOptions = [...value];
          }
        "
      />
    </div>
    <div v-else class="lg:flex bg-neutral-lightest">
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
              :route="route"
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
              :queryVariables="queryVariables as GetEntitiesQueryVariables"
              :entities-loading="entitiesLoading"
              :library-bar-initialization-status="
                libraryBarInitializationStatus
              "
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
              :entity-type="entityType as Entitytyping"
              @select-page="bulkSelect"
              @select-all="bulkSelect(allEntitiesResult.Entities.results)"
              @confirm-selection="
                (selection) => emit('confirmSelection', selection)
              "
              @no-bulk-operations-available="
                () => (enableBulkOperations = false)
              "
              @refetch="refetchEntities()"
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

        <div v-if="entities.length === 0" class="">
          <div>{{ t("search.noresult") }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ApolloClient } from "@apollo/client/core";
import type { ViewModes } from "@/generated-types/type-defs";
import {
  BaseEntity,
  DamsIcons,
  DropdownOption,
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
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import BaseToggleGroup from "@/components/base/BaseToggleGroup.vue";
import BulkOperationsActionsBar from "@/components/bulk-operations/BulkOperationsActionsBar.vue";
import FiltersBase from "@/components/filters/FiltersBase.vue";
import LibraryBar from "@/components/library/LibraryBar.vue";
import useUpload from "@/composables/useUpload";
import ViewModesGrid from "@/components/library/view-modes/ViewModesGrid.vue";
import ViewModesList from "@/components/library/view-modes/ViewModesList.vue";
import ViewModesMedia from "@/components/library/view-modes/ViewModesMedia.vue";
import { bulkSelectAllSizeLimit } from "@/main";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { getEntityTitle } from "@/helpers";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { useBaseModal } from "@/composables/useBaseModal";
import { useFormHelper } from "@/composables/useFormHelper";
import { useI18n } from "vue-i18n";
import { useQuery } from "@vue/apollo-composable";
import { useRoute, useRouter } from "vue-router";
import { useStateManagement } from "@/composables/useStateManagement";
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
    entityType?: Entitytyping;
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
    useOtherQuery?: object;
    selectInputFieldType?: "multi" | "single";
    selectInputFieldValue?: string[];
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
    useOtherQuery: undefined,
    isMultiSelectInputField: false,
  },
);

const emit = defineEmits<{
  (event: "confirmSelection", selectedItems: InBulkProcessableItem[]): void;
}>();

const apolloClient = inject(DefaultApolloClient);
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { getGlobalState, setGlobalState } = useStateManagement();

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
  setManipulationOfQuery,
  setEntities,
  setEntityType,
  setIsSearchLibrary,
  setTotalEntityCount,
  sortOptions,
  totalEntityCount,
  formatTeaserMetadata,
} = useBaseLibrary(
  apolloClient as ApolloClient<any>,
  props.parentEntityIdentifiers.length > 0,
);
const { enqueueItemForBulkProcessing, triggerBulkSelectionEvent } =
  useBulkOperations();
const { closeModal } = useBaseModal();
const { replaceRelationsFromSameType } = useFormHelper();
const { uploadStatus } = useUpload();

const displayList = ref<boolean>(false);
const displayGrid = ref<boolean>(false);
const displayPreview = ref<boolean>(props.enablePreview);

const expandFilters = ref<boolean>(false);
const isAsc = ref<boolean>(false);
let toggles: ViewModes.type[] = [];

const entityType = computed(() =>
  props.entityType
    ? props.entityType
    : route.meta.entityType
      ? (route.meta.entityType as Entitytyping)
      : ("BaseEntity" as Entitytyping),
);
const entityDropdownOptions = computed<DropdownOption[]>(() => {
  return entities.value.map((entity: BaseEntity) => {
    return {
      icon: DamsIcons.NoIcon,
      label: getEntityTitle(entity),
      value: entity.id,
    };
  });
});

const selectedDropdownOptions = ref<DropdownOption[]>([]);

const getSelectedOptions = () => {
  const selectedOptions: DropdownOption[] = [];
  if (!props.selectInputFieldValue || !entityDropdownOptions.value)
    return selectedOptions;
  props.selectInputFieldValue.forEach((item: string) => {
    const valueOption: DropdownOption | undefined =
      entityDropdownOptions.value.find(
        (option: DropdownOption) => option.label === item,
      );
    if (!valueOption) return;
    selectedOptions.push(valueOption);
  });
  return selectedOptions;
};

const mapDropdownOptionsToBulkProcessableItem = (
  dropdownOptions: DropdownOption[],
): InBulkProcessableItem[] => {
  const inBulkProcessableItems: InBulkProcessableItem[] = [];
  dropdownOptions.forEach((dropdownOption: DropdownOption) => {
    inBulkProcessableItems.push({
      id: dropdownOption.value,
      value: dropdownOption.label,
    });
  });
  return inBulkProcessableItems;
};

const useOtherQuery = computed(() => props.useOtherQuery !== undefined);

if (useOtherQuery.value) {
  setManipulationOfQuery(true, props.useOtherQuery);
} else {
  const allEntitiesQueryVariables: GetEntitiesQueryVariables = {
    type: entityType.value,
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
    () => ({ enabled: false, fetchPolicy: "network-only" }),
  );
}

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
          entity.intialValues,
        ),
      });
    }
  }
  triggerBulkSelectionEvent(props.bulkOperationsContext);
};

const refetchEntities = () => {
  getEntities(route, true);
};

const initializeBaseLibrary = () => {
  setIsSearchLibrary(props.isSearchLibrary);
  if (!props.predefinedEntities) {
    if (props.filters.length > 0) setAdvancedFilters(props.filters);
    else if (props.filterType) setEntityType(props.filterType as Entitytyping);
    queryVariables.value.searchInputType = props.searchInputTypeOnDrawer;
    getEntities(route);
  }
};

const getDisplayPreferences = () => {
  const displayPreferences = getGlobalState("_displayPreferences");
  if (displayPreferences) {
    displayGrid.value = displayPreferences.grid;
    if (displayGrid.value === false && !displayPreview.value)
      displayList.value = true;
    expandFilters.value = !props.enableAdvancedFilters
      ? false
      : displayPreferences.expandFilters;
  }
};

onMounted(() => {
  initializeBaseLibrary();
  getDisplayPreferences();
});

watch(
  () => route.path,
  () => {
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
      getEntities(route);
    }
  },
);
watch(
  () => props.predefinedEntities,
  () => {
    if (props.predefinedEntities) {
      setEntities(props.predefinedEntities);
      setTotalEntityCount(props.predefinedEntities.length);
    }
  },
  { immediate: true },
);

watch(
  () => props.filters,
  () => {
    setAdvancedFilters(props.filters);
  },
);

watch(
  () => entities.value,
  () => {
    if (props.selectInputFieldType) {
      selectedDropdownOptions.value = getSelectedOptions();
    }
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
    if (props.filters.length === 0) initializeBaseLibrary();
    if (viewModes.includes(ViewModesMedia.__name) || props.enablePreview)
      toggles.push({
        isOn: displayPreview,
        iconOn: DamsIcons.Image,
        iconOff: DamsIcons.Image,
      });
    getDisplayPreferences();
  },
);
watch([displayGrid, expandFilters], () => {
  let _expandFilters = expandFilters.value;
  if (route.name === "SingleEntity")
    _expandFilters = getGlobalState("_displayPreferences").expandFilters;

  displayList.value = !displayGrid.value;
  setGlobalState("_displayPreferences", {
    grid: displayPreview.value ? false : displayGrid.value,
    expandFilters: _expandFilters,
  });
});

watch(
  () => uploadStatus.value,
  () => {
    if (uploadStatus.value === "upload-finished") refetchEntities();
  },
);
</script>
