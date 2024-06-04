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
        :class="[
          baseLibraryMode === BaseLibraryModes.BasicBaseLibrary
            ? ''
            : parentEntityIdentifiers.length > 0
            ? 'p-3'
            : 'px-6',
        ]"
      >
        <div
          :class="[
            {
              'top-0 mb-2 pt-4 bg-neutral-lightest':
                baseLibraryMode === BaseLibraryModes.NormalBaseLibrary,
            },
            { 'sticky z-1': hasStickyBars },
          ]"
        >
          <div class="flex flex-row items-center gap-y-4">
            <FiltersBase
              v-show="enableAdvancedFilters"
              class="lg:w-[46%]"
              :expandFilters="expandFilters"
              :manipulation-query="manipulationQuery"
              :parent-entity-identifiers="parentEntityIdentifiers"
              :route="route"
              :set-advanced-filters="setAdvancedFilters"
              @filter-matcher-mapping-promise="
                (promise) => (filterMatcherMappingPromise = promise)
              "
              @advanced-filters-promise="
                (promise) => (advancedFiltersPromise = promise)
              "
              @apply-filters="
                async (filters: AdvancedFilterInput[], force: Boolean = true) =>
                  await setAdvancedFilters(filters, force, route)
              "
              @expand-filters="expandFilters = !expandFilters"
            />
            <div
              class="mr-2"
              :class="['flex', { 'ml-4': enableAdvancedFilters }]"
            >
              <BaseToggleGroup v-if="toggles.length > 1" :toggles="toggles" />
            </div>
            <LibraryBar
              v-if="
                !predefinedEntities &&
                baseLibraryMode === BaseLibraryModes.NormalBaseLibrary
              "
              :route="route"
              :set-limit="setLimit"
              :set-skip="setSkip"
              :set-sort-key="setSortKey"
              :set-sort-order="setSortOrder"
              :total-items="totalEntityCount || NaN"
              @pagination-limit-options-promise="
                (promise) => (paginationLimitOptionsPromise = promise)
              "
              @sort-options-promise="
                (promise) => (sortOptionsPromise = promise)
              "
            />
          </div>

          <div
            v-if="
              enableBulkOperations &&
              !displayPreview &&
              baseLibraryMode === BaseLibraryModes.NormalBaseLibrary
            "
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
              @confirm-selection="
                (selection) => emit('confirmSelection', selection)
              "
              @no-bulk-operations-available="
                () => (enableBulkOperations = false)
              "
              @refetch="async () => await refetchEntities()"
            />
          </div>
        </div>
        <div
          v-if="entities?.length !== 0 || relations?.length !== 0"
          :class="{ 'flex justify-end': expandFilters }"
        >
          <div
            id="gridContainer"
            :class="[
              { 'w-[67%]': expandFilters && toggles.length <= 1 },
              { 'w-[69.75%]': expandFilters && toggles.length > 1 },
            ]"
            @click="isSearchLibrary ? closeModal(TypeModals.Search) : undefined"
          >
            <ViewModesList
              v-if="
                displayList ||
                (entitiesLoading && route?.name !== 'SingleEntity')
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
              :enable-selection="enableBulkOperations"
              :base-library-mode="baseLibraryMode"
              :entity-list-elements="entityListElements"
              :keep-selected-mediafiles="keepSelectedMediafiles"
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
              :keep-selected-mediafiles="keepSelectedMediafiles"
            />
            <ViewModesMedia
              v-if="displayPreview"
              :entities="entities as Entity[]"
              :entities-loading="entitiesLoading"
            />
          </div>
        </div>

        <div
          v-if="entities?.length === 0 && !entitiesLoading"
          class="text-center my-2"
        >
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
  type AdvancedFilterInput,
  BaseLibraryModes,
  type BaseRelationValuesInput,
  type Entity,
  type EntityListElement,
} from "@/generated-types/queries";
import {
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
import ViewModesGrid from "@/components/library/view-modes/ViewModesGrid.vue";
import ViewModesList from "@/components/library/view-modes/ViewModesList.vue";
import ViewModesMedia from "@/components/library/view-modes/ViewModesMedia.vue";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { getEntityTitle } from "@/helpers";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { useBaseModal } from "@/composables/useBaseModal";
import { useFormHelper } from "@/composables/useFormHelper";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useStateManagement } from "@/composables/useStateManagement";
import { watch, ref, onMounted, inject, computed } from "vue";

export type BaseLibraryProps = {
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
  baseLibraryMode?: BaseLibraryModes;
  entityListElements?: EntityListElement[];
  keepSelectedMediafiles?: boolean;
};

const props = withDefaults(defineProps<BaseLibraryProps>(), {
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
  baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
  entityListElements: undefined,
  keepSelectedMediafiles: false,
});

const emit = defineEmits<{
  (event: "confirmSelection", selectedItems: InBulkProcessableItem[]): void;
}>();

const apolloClient = inject(DefaultApolloClient);
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { getGlobalState, updateGlobalState } = useStateManagement();

const {
  enqueuePromise,
  entities,
  entitiesLoading,
  formatTeaserMetadata,
  getEntities,
  manipulationQuery,
  setAdvancedFilters,
  setEntityType,
  setIsSearchLibrary,
  setLimit,
  setManipulationOfQuery,
  setParentEntityIdentifiers,
  setsearchInputType,
  setSkip,
  setSortKey,
  setSortOrder,
  totalEntityCount,
} = useBaseLibrary(apolloClient as ApolloClient<any>);

let filterMatcherMappingPromise: (entityType: Entitytyping) => Promise<void>;
let advancedFiltersPromise: (entityType: Entitytyping) => Promise<void>;
let paginationLimitOptionsPromise: (entityType: Entitytyping) => Promise<void>;
let sortOptionsPromise: (entityType: Entitytyping) => Promise<void>;

const { enqueueItemForBulkProcessing, triggerBulkSelectionEvent } =
  useBulkOperations();
const { closeModal } = useBaseModal();
const { replaceRelationsFromSameType, getForm } = useFormHelper();
const { uploadStatus } = useUpload();

const displayList = ref<boolean>(false);
const displayGrid = ref<boolean>(false);
const displayPreview = ref<boolean>(props.enablePreview);

const expandFilters = ref<boolean>(false);
let toggles: ViewModes.type[] = [];

const entityType = computed(() =>
  props.entityType
    ? props.entityType
    : route.meta.entityType
    ? (route.meta.entityType as Entitytyping)
    : ("BaseEntity" as Entitytyping)
);

const relations = computed<BaseRelationValuesInput[]>(
  () =>
    getForm(props.parentEntityIdentifiers[0])?.values?.relationValues?.relations
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
        (option: DropdownOption) => option.label === item
      );
    if (!valueOption) return;
    selectedOptions.push(valueOption);
  });
  return selectedOptions;
};

const mapDropdownOptionsToBulkProcessableItem = (
  dropdownOptions: DropdownOption[]
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
          entity.intialValues
        ),
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
  if (!props.predefinedEntities) {
    if (props.filters.length > 0)
      setAdvancedFilters(props.filters, false, route);
    setEntityType(
      (props.filterType as Entitytyping) ||
        props.entityType ||
        Entitytyping.BaseEntity
    );
    setsearchInputType(
      props.searchInputTypeOnDrawer || SearchInputType.AdvancedInputType
    );
    enqueuePromise(filterMatcherMappingPromise);
    enqueuePromise(advancedFiltersPromise);
    enqueuePromise(paginationLimitOptionsPromise);
    enqueuePromise(sortOptionsPromise);
    await getEntities(route);
  }
};

const getDisplayPreferences = () => {
  const displayPreferences = getGlobalState("_displayPreferences");
  if (displayPreferences) {
    if (!displayPreview.value && displayPreferences.grid)
      displayGrid.value = displayPreferences.grid;
    if (displayGrid.value === false && !displayPreview.value)
      displayList.value = true;
    expandFilters.value = !props.enableAdvancedFilters
      ? false
      : displayPreferences.expandFilters;
  }
};

onMounted(async () => {
  await initializeBaseLibrary();
  getDisplayPreferences();
});

watch(
  () => route.path,
  async () => {
    if (
      !props.predefinedEntities &&
      router.currentRoute.value.name !== "SingleEntity"
    ) {
      setsearchInputType(
        entityType.value === Entitytyping.Mediafile
          ? SearchInputType.AdvancedInputMediaFilesType
          : SearchInputType.AdvancedInputType
      );
      setEntityType(entityType.value);
      enqueuePromise(advancedFiltersPromise);
      enqueuePromise(sortOptionsPromise);
      await getEntities(route);
    }
  }
);
watch(
  () => props.predefinedEntities,
  () => {
    if (props.predefinedEntities) {
      entities.value = props.predefinedEntities;
      totalEntityCount.value = props.predefinedEntities.length;
    }
  },
  { immediate: true }
);
watch(
  () => props.filters,
  async () => {
    setAdvancedFilters(props.filters);
    await getEntities(route);
  }
);
watch(
  () => entities.value,
  () => {
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
    if (viewModes.includes(ViewModesMedia.__name) || props.enablePreview)
      toggles.push({
        isOn: displayPreview,
        iconOn: DamsIcons.Image,
        iconOff: DamsIcons.Image,
      });
    getDisplayPreferences();
  }
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
  }
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
