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
    <div
      v-else
      class="bg-neutral-lightest grid grid-cols-[30%_70%] gap-y-[0.5vh] w-full"
      :class="[
        baseLibraryMode === BaseLibraryModes.BasicBaseLibrary
          ? ''
          : parentEntityIdentifiers.length > 0
            ? 'px-3 pt-3'
            : 'px-6',
        { '!bg-white': baseLibraryMode === BaseLibraryModes.BasicBaseLibrary },
        {
          'grid-rows-[5vh_1fr]':
            baseLibraryMode === BaseLibraryModes.NormalBaseLibrary,
        },
        {
          'grid-rows-[1vh_1fr]':
            baseLibraryMode === BaseLibraryModes.BasicBaseLibraryWithBorder ||
            baseLibraryMode === BaseLibraryModes.PreviewBaseLibrary,
        },
        {
          'grid-rows-[0vh_1fr]':
            baseLibraryMode === BaseLibraryModes.BasicBaseLibrary,
        },
      ]"
    >
      <div
        class="z-40 top-0 pt-3 pb-2 bg-neutral-lightest"
        :class="[
          { hidden: !enableAdvancedFilters },
          { 'row-span-1': !expandFilters },
          { 'row-span-2 h-fit': expandFilters },
          { sticky: hasStickyBars },
        ]"
      >
        <FiltersBase
          v-show="enableAdvancedFilters"
          :expandFilters="expandFilters"
          :manipulation-query="manipulationQuery"
          :parent-entity-identifiers="parentEntityIdentifiers"
          :route="route"
          :set-advanced-filters="setAdvancedFilters"
          :additional-default-filters-enabled="additionalDefaultFiltersEnabled"
          :enable-save-search-filters="enableSaveSearchFilters"
          :entity-type="entityType as Entitytyping"
          :should-use-state-for-route="shouldUseStateForRoute"
          :filters-need-context="filtersNeedContext"
          :predefined-filters="filters"
          @filter-matcher-mapping-promise="
            (promise) => (filterMatcherMappingPromise = promise)
          "
          @advanced-filters-promise="
            (promise) => (advancedFiltersPromise = promise)
          "
          @apply-filters="
            async (
              filters: AdvancedFilterInput[],
              stateSaved: boolean = false,
              force: boolean = true,
            ) => await setAdvancedFilters(filters, stateSaved, force, route)
          "
          @expand-filters="expandFilters = !expandFilters"
        />
      </div>
      <div
        :class="[
          'z-40 pl-[1%] right-0 pb-4',
          {
            'top-0 bg-neutral-lightest pt-4':
              baseLibraryMode === BaseLibraryModes.NormalBaseLibrary ||
              baseLibraryMode === BaseLibraryModes.PreviewBaseLibrary,
          },
          {
            'row-span-2':
              baseLibraryMode === BaseLibraryModes.PreviewBaseLibrary,
          },
          { 'col-span-2': !enableAdvancedFilters },
          { sticky: hasStickyBars },
        ]"
      >
        <div class="h-fit flex flex-row items-center gap-y-4">
          <div
            v-if="baseLibraryMode === BaseLibraryModes.NormalBaseLibrary"
            class="mr-2"
          >
            <BaseToggleGroup v-if="toggles.length > 1" :toggles="toggles" />
          </div>
          <LibraryBar
            v-if="
              !predefinedEntities &&
              (baseLibraryMode === BaseLibraryModes.NormalBaseLibrary ||
                baseLibraryMode === BaseLibraryModes.PreviewBaseLibrary)
            "
            :route="route"
            :set-limit="setPaginationLimit"
            :set-sort-key="setSortKey"
            :set-sort-order="setSortOrder"
            :filters-available-on-detail-page="filtersAvailableOnDetailPage"
            @pagination-limit-options-promise="
              (promise) => (paginationLimitOptionsPromise = promise)
            "
            @sort-options-promise="(promise) => (sortOptionsPromise = promise)"
          />
        </div>
      </div>
      <div
        class="top-[5.5vh] mt-[0.5vh]"
        :class="[
          { 'col-span-1 pl-[1%]': expandFilters },
          { 'col-span-2': !expandFilters },
        ]"
      >
        <div
          v-if="
            enableBulkOperations &&
            baseLibraryMode === BaseLibraryModes.NormalBaseLibrary
          "
          :class="[{ sticky: hasStickyBars }, 'top-[5vh] my-3']"
        >
          <BulkOperationsActionsBar
            :context="bulkOperationsContext"
            :total-items-count="totalEntityCount"
            :use-extended-bulk-operations="!isSearchLibrary"
            :show-button="showButton"
            :confirm-selection-button="confirmSelectionButton"
            :relation-type="relationType"
            :entity-type="entityType as Entitytyping"
            :custom-bulk-operations="customBulkOperations"
            :refetch-entities="refetchEntities"
            :enable-selection="enableSelection"
            :parent-entity-id="props.parentEntityIdentifiers[0]"
            :selected-pagination-limit-option="selectedPaginationLimitOption"
            :total-items="totalEntityCount || NaN"
            :set-skip="setSkip"
            @custom-bulk-operations-promise="
              (promise) => (customBulkOperationsPromise = promise)
            "
            @select-page="bulkSelect"
            @confirm-selection="
              (selection) => emit('confirmSelection', selection)
            "
            @set-bulk-operations-available="
              (value: boolean) => (hasBulkOperations = value)
            "
            @apply-custom-bulk-operations="
              async () => await applyCustomBulkOperations()
            "
            @initialize-entity-picker-component="
              () => initializeEntityPickerComponent()
            "
            @refetch="async () => await refetchEntities()"
          />
        </div>
        <div
          v-if="entities?.length !== 0 || relations?.length !== 0"
          data-cy="base-library-grid-container"
          @click="isSearchLibrary ? closeModal(TypeModals.Search) : undefined"
        >
          <ViewModesList
            v-if="
              displayList ||
              displayGrid ||
              (entitiesLoading &&
                (route?.name !== 'SingleEntity' ||
                  props.baseLibraryMode !== BaseLibraryModes.NormalBaseLibrary))
            "
            :entities="entities as Entity[]"
            :entities-loading="entitiesLoading"
            :bulk-operations-context="bulkOperationsContext"
            :list-item-route-name="listItemRouteName"
            :disable-previews="disableNewEntityPreviews"
            :enable-navigation="enableNavigation"
            :parent-entity-identifiers="parentEntityIdentifiers"
            :ids-of-non-selectable-entities="idsOfNonSelectableEntities"
            :relation-type="relationType"
            :enable-selection="enableSelection"
            :base-library-mode="baseLibraryMode"
            :entity-list-elements="entityListElements"
            :allowed-actions-on-relations="allowedActionsOnRelations"
            :mode="displayGrid ? 'grid' : 'list'"
            :config="
              configPerViewMode[
                displayList
                  ? ViewModes.ViewModesList
                  : (displayGrid ?? ViewModes.ViewModesGrid)
              ]
            "
            :config-per-view-mode="configPerViewMode"
            :expandFilters="expandFilters"
            :refetch-entities="refetchEntities"
            :entity-type="entityType"
          />
          <ViewModesMedia
            v-if="viewModesIncludeViewModesMedia && displayPreview"
            :entities="entities as Entity[]"
            :entities-loading="entitiesLoading"
            :config="configPerViewMode[ViewModes.ViewModesMedia]"
          />
          <ViewModesMap
            v-if="displayMap"
            :entities="entities as Entity[]"
            :config="configPerViewMode[ViewModes.ViewModesMap]"
          />
        </div>
        <div
          v-if="entities?.length === 0 && !entitiesLoading"
          :class="[
            {
              'text-center my-2':
                baseLibraryMode !== BaseLibraryModes.BasicBaseLibrary,
            },
            { 'col-span-1 pl-[1%]': expandFilters },
            { 'col-span-2': !expandFilters },
          ]"
        >
          <div v-if="baseLibraryMode === BaseLibraryModes.BasicBaseLibrary">
            -
          </div>
          <div v-else>{{ t("search.noresult") }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ApolloClient } from "@apollo/client/core";
import type {
  RelationActions,
  EntitySubelement,
} from "@/generated-types/queries";
import {
  type AdvancedFilterInput,
  BaseLibraryModes,
  type BaseRelationValuesInput,
  DeepRelationsFetchStrategy,
  type Entity,
  type EntityListElement,
  type FetchDeepRelations,
  type ViewModesWithConfig,
  ViewModes,
  type BaseEntity,
  ContextMenuGeneralActionEnum,
  DamsIcons,
  type DropdownOption,
  Entitytyping,
  SearchInputType,
  TypeModals,
} from "@/generated-types/queries";
import { useBulkOperations } from "@/composables/useBulkOperations";
import type {
  Context,
  InBulkProcessableItem,
} from "@/composables/useBulkOperations";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import BaseToggleGroup from "@/components/base/BaseToggleGroup.vue";
import BulkOperationsActionsBar from "@/components/bulk-operations/BulkOperationsActionsBar.vue";
import EventBus from "@/EventBus";
import FiltersBase from "@/components/filters/FiltersBase.vue";
import LibraryBar from "@/components/library/LibraryBar.vue";
import useUpload from "@/composables/useUpload";
import ViewModesList from "@/components/library/view-modes/ViewModesList.vue";
import ViewModesMedia from "@/components/library/view-modes/ViewModesMedia.vue";
import ViewModesMap from "@/components/library/view-modes/ViewModesMap.vue";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { formatTeaserMetadata, getEntityTitle } from "@/helpers";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { useBaseModal } from "@/composables/useBaseModal";
import { useFormHelper } from "@/composables/useFormHelper";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useStateManagement } from "@/composables/useStateManagement";
import { watch, ref, onMounted, inject, computed } from "vue";
import useEntityPickerModal from "@/composables/useEntityPickerModal";
import {
  useBreadcrumbs,
  breadcrumbPathFinished,
  breadcrumbRoutes,
} from "@/composables/useBreadcrumbs";

export type BaseLibraryProps = {
  bulkOperationsContext: Context;
  listItemRouteName: string;
  predefinedEntities?: Entity[];
  searchInputTypeOnDrawer?: SearchInputType;
  enablePreview?: boolean;
  enableAdvancedFilters?: boolean;
  enableBulkOperations?: boolean;
  selectionEnabled?: boolean;
  entityType?: Entitytyping;
  filterType?: string;
  parentEntityIdentifiers?: string[];
  showButton?: boolean;
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
  baseLibraryMode?: BaseLibraryModes;
  entityListElements?: EntityListElement[];
  allowedActionsOnRelations?: RelationActions[];
  customBulkOperations?: String | undefined;
  enableSaveSearchFilters?: boolean;
  shouldUseStateForRoute?: boolean;
  customQueryEntityPickerList?: string;
  customQueryEntityPickerListFilters?: string;
  fetchDeepRelations?: FetchDeepRelations;
  parentEntityType?: Entitytyping;
  filtersNeedContext?: EntitySubelement[];
  ignoreFetchingData?: boolean;
  id: string;
};

const props = withDefaults(defineProps<BaseLibraryProps>(), {
  predefinedEntities: undefined,
  searchInputTypeOnDrawer: SearchInputType.AdvancedInputType,
  enablePreview: false,
  enableAdvancedFilters: true,
  enableBulkOperations: true,
  selectionEnabled: false,
  filterType: undefined,
  parentEntityIdentifiers: () => [],
  showButton: true,
  confirmSelectionButton: false,
  enableNavigation: true,
  disableNewEntityPreviews: false,
  idsOfNonSelectableEntities: () => [],
  hasStickyBars: true,
  filters: () => [],
  isSearchLibrary: false,
  useOtherQuery: undefined,
  isMultiSelectInputField: false,
  baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
  entityListElements: undefined,
  allowedActionsOnRelations: [],
  customBulkOperations: undefined,
  enableSaveSearchFilters: true,
  shouldUseStateForRoute: true,
  filtersNeedContext: undefined,
  ignoreFetchingData: false,
});

const emit = defineEmits<{
  (event: "confirmSelection", selectedItems: InBulkProcessableItem[]): void;
  (event: "entitiesUpdated", numberOfEntities: number): void;
}>();

const config: any = inject("config");
const apolloClient = inject(DefaultApolloClient);
const isPreviewElement: boolean = inject("IsPreviewElement", false);
const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const { getGlobalState, updateGlobalState } = useStateManagement();
const { iterateOverBreadcrumbs } = useBreadcrumbs(config);

const hasBulkOperations = ref<boolean>(true);
const selectedPaginationLimitOption = ref<number>();
const enableSelection = computed<boolean>(() => {
  return (
    (config.features.hasBulkSelect &&
      hasBulkOperations.value &&
      props.enableBulkOperations &&
      !props.isSearchLibrary) ||
    props.selectionEnabled
  );
});
const additionalDefaultFiltersEnabled = computed(() => {
  return (
    props.enableAdvancedFilters && manipulationQuery.value?.filtersDocument
  );
});

const setPaginationLimit = (limit: number, forceFetch: boolean = false) => {
  selectedPaginationLimitOption.value = limit;
  setLimit(limit, forceFetch);
};

const {
  enqueuePromise,
  entities,
  entitiesLoading,
  getCustomBulkOperations,
  getEntities,
  getEntityById,
  manipulationQuery,
  setAdvancedFilters,
  setEntityType,
  setIsSearchLibrary,
  setLimit,
  setManipulationOfQuery,
  setParentEntityIdentifiers,
  setsearchInputType,
  setSkip,
  setLocale,
  setSortKey,
  setSortOrder,
  totalEntityCount,
} = useBaseLibrary(
  apolloClient as ApolloClient<any>,
  props.shouldUseStateForRoute,
  props.baseLibraryMode,
);

let filterMatcherMappingPromise: (entityType: Entitytyping) => Promise<void>;
let advancedFiltersPromise: (entityType: Entitytyping) => Promise<void>;
let paginationLimitOptionsPromise: (entityType: Entitytyping) => Promise<void>;
let sortOptionsPromise: (entityType: Entitytyping) => Promise<void>;
let customBulkOperationsPromise: () => Promise<void>;

const { enqueueItemForBulkProcessing, triggerBulkSelectionEvent } =
  useBulkOperations();
const { closeModal } = useBaseModal();
const { replaceRelationsFromSameType, getForm } = useFormHelper();
const { uploadStatus } = useUpload();
const {
  setAcceptedTypes,
  setEntityUuid,
  setEntityId,
  setRelationType,
  setCustomGetEntitiesQuery,
  setCustomGetEntitiesFiltersQuery,
  setParentEntityType,
} = useEntityPickerModal();

const displayList = ref<boolean>(false);
const displayGrid = ref<boolean>(false);
const displayPreview = ref<boolean>(props.enablePreview);
const displayMap = ref<boolean>(false);

const expandFilters = ref<boolean>(false);
let toggles: ViewModes.type[] = [];

const entityType = computed(() =>
  props.entityType
    ? props.entityType
    : route.meta.entityType
      ? (route.meta.entityType as Entitytyping)
      : ("BaseEntity" as Entitytyping),
);

const relations = computed<BaseRelationValuesInput[]>(
  () =>
    getForm(props.parentEntityIdentifiers[0])?.values?.relationValues
      ?.relations,
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

const isDeepRelationWithBreadcrumbInfo = computed(
  () =>
    props.fetchDeepRelations?.deepRelationsFetchStrategy ===
    DeepRelationsFetchStrategy.UseExistingBreadcrumbsInfo,
);
const isDeepRelationUsingMethods = computed(
  () =>
    props.fetchDeepRelations?.deepRelationsFetchStrategy ===
    DeepRelationsFetchStrategy.UseMethodsAndFetch,
);

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
  setParentEntityIdentifiers(props.parentEntityIdentifiers || []);
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
        type: entity.type,
      });
    }
  }
  triggerBulkSelectionEvent(props.bulkOperationsContext);
};

const refetchEntities = async () => {
  await getEntities(route);
};

const initializeBaseLibrary = async () => {
  setIsSearchLibrary(props.isSearchLibrary || false);
  if (props.ignoreFetchingData) return;
  if (!props.predefinedEntities) {
    if (props.filters.length > 0) {
      setAdvancedFilters(props.filters, false, false, route);
    }
    setEntityType(
      (props.filterType as Entitytyping) ||
        props.entityType ||
        Entitytyping.BaseEntity,
    );
    setsearchInputType(
      props.searchInputTypeOnDrawer || SearchInputType.AdvancedInputType,
    );
    enqueuePromise(filterMatcherMappingPromise);
    enqueuePromise(advancedFiltersPromise);
    enqueuePromise(paginationLimitOptionsPromise);
    enqueuePromise(sortOptionsPromise);
    await getEntities(route);
  }
};

const initializeDeepRelations = async () => {
  if (isDeepRelationWithBreadcrumbInfo.value && breadcrumbPathFinished.value) {
    const positionOfRelation =
      breadcrumbRoutes.value.length -
      props.fetchDeepRelations.amountOfRecursions;
    const breadcrumbEntity = breadcrumbRoutes.value[positionOfRelation];
    if (
      !breadcrumbEntity ||
      breadcrumbEntity.type !== props.fetchDeepRelations.entityType
    )
      return;
    await getEntityById(breadcrumbEntity.type, breadcrumbEntity.id);
  } else if (isDeepRelationUsingMethods.value) {
    const routeConfig = props.fetchDeepRelations.routeConfig;
    let parentId = props.parentEntityIdentifiers[0];
    let entity: Entity;
    for (const index in routeConfig) {
      const entityResult = await iterateOverBreadcrumbs(
        parentId,
        [routeConfig[index]],
        false,
      );
      if (!entityResult) break;
      parentId = entityResult.id;
      entity = entityResult;
    }
    if (entity && props.fetchDeepRelations.entityType === entity.type)
      entities.value = [entity];
  }
};

const getDisplayPreferences = () => {
  const displayPreferences = getGlobalState("_displayPreferences");
  if (!displayPreferences) return;

  expandFilters.value = !props.enableAdvancedFilters
    ? false
    : displayPreferences.expandFilters;

  if (
    !displayPreview.value &&
    !displayMap.value &&
    Object.keys(configPerViewMode.value).length === 1
  ) {
    const keys = Object.keys(configPerViewMode.value);
    displayList.value = keys.includes(ViewModes.ViewModesList);
    displayGrid.value = keys.includes(ViewModes.ViewModesGrid);
    return;
  }

  if (!displayPreview.value && displayPreferences.grid) {
    displayGrid.value = displayPreferences.grid;
  }

  if (
    displayGrid.value === false &&
    (!displayPreview.value || isPreviewElement)
  ) {
    displayList.value = true;
  }
};

const applyCustomBulkOperations = async () => {
  if (!props.customBulkOperations) return;
  enqueuePromise(customBulkOperationsPromise);
  await getCustomBulkOperations();
};

const initializeEntityPickerComponent = () => {
  setAcceptedTypes([props.entityType] as Entitytyping[]);
  setEntityUuid(props.parentEntityIdentifiers[0]);
  setEntityId(props.id);
  setParentEntityType(props.parentEntityType || route.meta.entityType);
  setRelationType(props.relationType);
  setCustomGetEntitiesQuery(props.customQueryEntityPickerList);
  setCustomGetEntitiesFiltersQuery(props.customQueryEntityPickerListFilters);
};

const configPerViewMode = computed(() => {
  if (entities.value.length <= 0) return [];
  return (
    entities.value[0].allowedViewModes?.viewModes?.reduce(
      (resultObject: any, viewModeWithConfig: ViewModesWithConfig) => {
        resultObject[viewModeWithConfig.viewMode] = viewModeWithConfig.config;
        return resultObject;
      },
      {},
    ) || {}
  );
});

const viewModesIncludeViewModesMedia = computed(() => {
  if (entities.value.length <= 0) return false;
  return entities.value[0].allowedViewModes?.viewModes
    ?.map(
      (viewModeWithConfig: ViewModesWithConfig) => viewModeWithConfig.viewMode,
    )
    .includes(ViewModesMedia.__name);
});

const determineViewModes = (viewModes: any[]) => {
  if (viewModes.includes(ViewModesList.__name))
    toggles.unshift({
      isOn: displayList,
      iconOn: DamsIcons.ListUl,
      iconOff: DamsIcons.ListUl,
    });
  if (viewModes.includes("ViewModesGrid"))
    toggles.push({
      isOn: displayGrid,
      iconOn: DamsIcons.Apps,
      iconOff: DamsIcons.Apps,
    });
  if (viewModes.includes(ViewModesMedia.__name))
    toggles.push({
      isOn: displayPreview,
      iconOn: DamsIcons.Image,
      iconOff: DamsIcons.Image,
    });
  if (viewModes.includes(ViewModesMap.__name)) {
    toggles.push({
      isOn: displayMap,
      iconOn: DamsIcons.Map,
      iconOff: DamsIcons.Map,
    });
  } else {
    displayMap.value = false;
  }
};

onMounted(async () => {
  if (props.fetchDeepRelations) await initializeDeepRelations();
  else await initializeBaseLibrary();
  getDisplayPreferences();
});

watch(
  () => route.path,
  async () => {
    if (
      !props.predefinedEntities &&
      router.currentRoute.value.name !== "SingleEntity"
    ) {
      setsearchInputType(SearchInputType.AdvancedInputType);
      setEntityType(entityType.value);
      enqueuePromise(advancedFiltersPromise);
      enqueuePromise(paginationLimitOptionsPromise);
      enqueuePromise(sortOptionsPromise);
      await getEntities(route);
    }
  },
);
watch(
  () => props.predefinedEntities,
  () => {
    if (props.predefinedEntities && props.predefinedEntities.length > 0) {
      entities.value = props.predefinedEntities;
      totalEntityCount.value = props.predefinedEntities.length;
      const viewModes: any[] =
        props.predefinedEntities[0].allowedViewModes.viewModes.map(
          (viewModeWithConfig: ViewModesWithConfig) =>
            viewModeWithConfig.viewMode,
        );
      determineViewModes(viewModes);
    }
  },
  { immediate: true },
);
watch(
  () => props.filters,
  async () => {
    setAdvancedFilters(props.filters);
    await getEntities(route);
  },
);
watch(
  () => entities.value,
  () => {
    emit("entitiesUpdated", entities.value.length);
    if (props.selectInputFieldType) {
      selectedDropdownOptions.value = getSelectedOptions();
    }
    toggles = [];
    if (
      !entities.value ||
      entities.value?.length === 0 ||
      !entities.value[0]?.allowedViewModes
    )
      return;
    const viewModes: any[] = entities.value[0].allowedViewModes.viewModes.map(
      (viewModeWithConfig: ViewModesWithConfig) => viewModeWithConfig.viewMode,
    );
    determineViewModes(viewModes);
    getDisplayPreferences();
  },
);
watch([displayGrid, expandFilters], () => {
  let _expandFilters = expandFilters.value;
  if (route.name === "SingleEntity")
    _expandFilters = getGlobalState("_displayPreferences").expandFilters;

  displayList.value = !displayGrid.value;
  updateGlobalState("_displayPreferences", {
    grid: displayPreview.value ? false : displayGrid.value,
    expandFilters: _expandFilters,
  });
});
watch(
  () => uploadStatus.value,
  async () => {
    if (uploadStatus.value === "upload-finished") await refetchEntities();
  },
);
watch(
  () => breadcrumbPathFinished.value,
  () => {
    if (breadcrumbPathFinished.value && isDeepRelationWithBreadcrumbInfo.value)
      initializeDeepRelations();
  },
);

watch(
  () => locale.value,
  (newValue: string) => {
    if (!config.features.multilanguage?.supportsMultilingualMetadataEditing)
      return;
    setLocale(newValue);
    refetchEntities();
  },
);

EventBus.on(ContextMenuGeneralActionEnum.SetPrimaryMediafile, async () => {
  if (
    props.useOtherQuery?.filtersDocument?.definitions[0]?.name?.value ===
    "getPrimaryMediafileFilters"
  )
    await getEntities(route);
});
EventBus.on(ContextMenuGeneralActionEnum.SetPrimaryThumbnail, async () => {
  if (
    props.useOtherQuery?.filtersDocument?.definitions[0]?.name?.value ===
    "getPrimaryThumbnailFilters"
  )
    await getEntities(route);
});
</script>
