<template>
  <div
    data-cy="filter-base"
    class="relative bg-neutral-white w-full"
    :class="expandFilters ? 'rounded-t' : 'rounded-xl'"
    @keydown.enter="applyFilters(true)"
  >
    <div
      class=""
      :class="[
        'flex justify-between items-center px-4 h-12 border-t border-x select-none cursor-pointer',
        { 'border-neutral-light rounded-t': expandFilters },
        { 'border-neutral-white rounded-xl': !expandFilters },
      ]"
      @click="() => emit('expandFilters', expandFilters)"
    >
      <span class="text-text-body text-xl font-bold">
        {{ t("filters.filter") }}
      </span>
      <div class="flex items-center">
        <span class="text-text-body">
          {{ activeFilterCount }} {{ t("filters.active") }}
        </span>
        <div
          v-if="
            (selectedSavedFilter || lastActiveFilter) &&
            auth.isAuthenticated.value === true
          "
          class="bg-neutral-light border-neutral-light rounded py-1 px-2 ml-2"
        >
          <span class="text-text-body">
            {{ selectedSavedFilter?.title || lastActiveFilter?.title }}
          </span>
        </div>
        <unicon
          class="text-text-body ml-4"
          :name="Unicons[getAngleIcon].name"
        />
      </div>
    </div>

    <div
      :class="[
        'w-full rounded-b bg-neutral-white',
        { hidden: !expandFilters },
        {
          'scrollable border-x border-b-2 border-neutral-light': expandFilters,
        },
      ]"
    >
      <div v-if="expandFilters" class="p-4 sticky top-0 bg-white z-10">
        <div class="flex justify-between gap-4 pb-4">
          <BaseButtonNew
            data-cy="filters-clear-button"
            class="!w-1/3 !p-2.5"
            :label="t('filters.clear')"
            :icon="DamsIcons.Cross"
            :icon-height="22"
            button-style="default"
            @click="() => (clearAllActiveFilters = true)"
          />
          <BaseButtonNew
            data-cy="filters-search-button"
            :label="t('filters.apply')"
            button-style="accentNormal"
            @click="applyFilters(true)"
          />
          <BaseButtonNew
            v-if="
              hasSavedSearch &&
              enableSaveSearchFilters &&
              auth.isAuthenticated.value === true
            "
            :icon="DamsIcons.EllipsisV"
            class="!w-1/5"
            @click.stop="
              (event: MouseEvent) =>
                contextMenuHandler.openContextMenu({
                  x: event.clientX,
                  y: event.clientY,
                })
            "
          />
        </div>
        <div>
          <BaseInputAutocomplete
            v-if="addFilterOptions.length > 0"
            v-model="displayedFilterOptions"
            :options="addFilterOptions"
            :placeholder="t('filters.add-filter')"
            autocomplete-style="defaultWithBorder"
          />
        </div>
      </div>

      <div v-if="expandFilters && matchers.length > 0">
        <FiltersListItem
          v-for="filter in displayedFilters"
          :key="filter.advancedFilter.key || ''"
          :filter="filter"
          :matchers="getMatchers(filter.advancedFilter.type)"
          :clear-all-active-filters="clearAllActiveFilters"
          @activate-filter="activateFilter"
          @deactivate-filter="
            (key, forceApply = false) => {
              deactivateFilter(key);
              if (forceApply) applyFilters(true);
            }
          "
        />
      </div>
    </div>
    <base-context-menu :context-menu="contextMenuHandler.getContextMenu()">
      <saved-searches
        :active-filters="filters"
        :has-active-filters="activeFilterCount > 0"
        :entityType="entityType"
        @filterDeleted="() => (clearAllActiveFilters = true)"
        :route="route"
      />
    </base-context-menu>
  </div>
</template>

<script lang="ts" setup>
import type { RouteLocationNormalizedLoaded } from "vue-router";
import type {
  Entitytyping,
  EntitySubelement,
  AdvancedFilterInput,
  AdvancedFilters,
  DropdownOption,
  FilterMatcherMap,
  GetFilterMatcherMappingQuery,
  AdvancedFilterTypes,
  AdvancedFilter,
} from "@/generated-types/queries";
import {
  DamsIcons,
  GetAdvancedFiltersDocument,
  GetFilterMatcherMappingDocument,
} from "@/generated-types/queries";
import { useStateManagement } from "@/composables/useStateManagement";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseContextMenu from "@/components/base/BaseContextMenu.vue";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import FiltersListItem from "@/components/filters/FiltersListItem.vue";
import SavedSearches from "@/components/SavedSearches.vue";
import { useEditMode } from "@/composables/useEdit";
import { apolloClient } from "@/main";
import { computed, defineProps, onMounted, ref, watch, inject } from "vue";
import { ContextMenuHandler } from "@/components/context-menu-actions/ContextMenuHandler";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import {
  type SavedSearchType,
  useSaveSearchHepler,
} from "@/composables/useSaveSearchHepler";
import { auth } from "@/main";
import { useFiltersBaseNew } from "@/composables/useFiltersBaseNew";
import { useFormHelper } from "@/composables/useFormHelper";

export type FiltersBaseAPI = {
  initializeAndActivateNewFilter: (
    advancedFilters: AdvancedFilters,
    value: any,
  ) => void;
  removeFilterFromList: (
    key: string,
  ) => void;
  getNormalizedFiltersForApi: () => AdvancedFilterInput[];
};

const props = withDefaults(
  defineProps<{
    expandFilters: boolean;
    manipulationQuery: object | undefined;
    parentEntityIdentifiers?: string[];
    route: RouteLocationNormalizedLoaded;
    setAdvancedFilters: Function;
    enableSaveSearchFilters: boolean;
    entityType: Entitytyping;
    shouldUseStateForRoute: boolean;
    filtersNeedContext?: EntitySubelement[];
    predefinedFilters: AdvancedFilterInput[];
    additionalDefaultFiltersEnabled?: boolean;
    onRegisterApi?: (api: FiltersBaseAPI) => void;
  }>(),
  {
    parentEntityIdentifiers: () => [],
    enableSaveSearchFilters: true,
    shouldUseStateForRoute: true,
    filtersNeedContext: undefined,
    additionalDefaultFiltersEnabled: false,
    onRegisterApi: undefined,
  },
);

const emit = defineEmits<{
  (
    event: "filterMatcherMappingPromise",
    filterMatcherMappingPromise: (entityType: Entitytyping) => Promise<void>,
  ): void;
  (
    event: "advancedFiltersPromise",
    advancedFiltersPromise: (entityType: Entitytyping) => Promise<void>,
  ): void;
  (
    event: "applyFilters",
    advancedFilterInputs: AdvancedFilterInput[],
    stateSaved: boolean,
    force: boolean,
  ): void;
  (event: "expandFilters", expandFilters: boolean): void;
}>();

const clearAllActiveFilters = ref<boolean>(false);
const contextMenuHandler = ref<ContextMenuHandler>(new ContextMenuHandler());
const displayedFilterOptions = ref<DropdownOption[]>([]);
const lastActiveFilter = ref<SavedSearchType | undefined>(undefined);
const matchers = ref<DropdownOption[]>([]);
// TODO: id & metadata_on_relation need to be removed
const filterMatcherMapping = ref<FilterMatcherMap>({
  id: [],
  text: [],
  date: [],
  number: [],
  selection: [],
  boolean: [],
  type: [],
  metadata_on_relation: [],
});
const { getStateForRoute, updateStateForRoute } = useStateManagement();
const { isSaved } = useEditMode();
const { t } = useI18n();
const {
  setActiveFilter: setActiveSavedFilter,
  getActiveFilter,
  getLastUsedFilterForRoute,
  addNewSavedFilterToLastUsedFiltersForRoute,
  addLastUsedFilterToStateForRoute,
} = useSaveSearchHepler();
const {
  filters,
  rawFilters,
  activeFilterCount,
  displayedFilters,
  initializeFilters,
  initializeNewAdvancedFilters,
  transformFilterInputIntoAdvancedFilters,
  getNormalizedFiltersForApi,
  setVariables,
  activateFilter,
  deactivateFilter,
  removeFilterFromList,
  resetFilters,
} = useFiltersBaseNew();

const config = inject("config") as any;
const parentEntity: any = inject("ParentEntityProvider");
const isPreviewElement: boolean = inject("IsPreviewElement", false);
const hasSavedSearch = config.features.hasSavedSearch || false;

const addFilterOptions = computed(() =>
  filters.value
    .filter((filter) => !filter.advancedFilter.isDisplayedByDefault)
    .filter((filter) => !filter.advancedFilter.hidden)
    .filter((filter) => filter.advancedFilter.label)
    .map((filter) => {
      return {
        label: t(filter.advancedFilter.label || ""),
        value: t(filter.advancedFilter.label || ""),
      };
    }),
);

const selectedSavedFilter = computed(() => {
  return getActiveFilter();
});

const filterMatcherMappingPromise = async () => {
  if (props.predefinedFilters && props.predefinedFilters.length > 0) return;

  return apolloClient
    .query<GetFilterMatcherMappingQuery>({
      query: GetFilterMatcherMappingDocument,
      fetchPolicy: "no-cache",
    })
    .then((result) => {
      filterMatcherMapping.value = result.data
        .FilterMatcherMapping as FilterMatcherMap;
      handleFilterMatcherMapping(filterMatcherMapping.value);
    });
};

const getMatchers = (type: AdvancedFilterTypes) => {
  return matchers.value.filter((option) =>
    filterMatcherMapping.value[type].includes(option.value),
  );
};

const advancedFiltersPromise = async (entityType: Entitytyping) => {
  if (props.predefinedFilters && props.predefinedFilters.length > 0) {
    await handlePredefinedAdvancedFilters();
    return;
  }

  const queue = [
    fetchEntityFilters({
      queryDocument: props.manipulationQuery?.filtersDocument,
      entityType,
    }),
    ...(props.additionalDefaultFiltersEnabled
      ? [
          fetchEntityFilters({
            queryDocument: undefined,
            entityType,
          }),
        ]
      : []),
  ];

  try {
    const result = await Promise.all(queue);
    rawFilters.value = Object.assign({}, ...result);

    await handleAdvancedFilters();
  } catch (error) {
    console.error("Failed to fetch advanced filters:", error);
  }
};

const fetchEntityFilters = async ({
  queryDocument,
  entityType,
}: {
  queryDocument?: any;
  entityType: Entitytyping;
}): Promise<AdvancedFilters> => {
  const variables = buildFilterVariables(entityType);

  const result = await apolloClient.query({
    query: queryDocument || GetAdvancedFiltersDocument,
    variables,
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
  });

  return result.data?.EntityTypeFilters?.advancedFilters;
};

const buildFilterVariables = (entityType: Entitytyping) => {
  const variables: Record<string, any> = { entityType };

  if (props.filtersNeedContext) {
    variables.context = getContextValues();
  }

  return variables;
};

const handleFilterMatcherMapping = (filterMatcherMapping: FilterMatcherMap) => {
  const matcherSet = new Set<string>();
  Object.values(filterMatcherMapping).forEach((matcherArray) => {
    if (typeof matcherArray !== "string") {
      for (const matcher of matcherArray) {
        matcherSet.add(matcher);
      }
    }
  });

  matchers.value = Array.from(matcherSet).map((matcher) => {
    return {
      icon: DamsIcons.NoIcon,
      label: t(`filters.matcher-labels.${matcher}`),
      value: matcher,
    };
  });
};

const getContextValues = () => {
  const formId = inject("entityFormData")?.id;
  if (!formId) return;

  const formValues = useFormHelper().getForm(id)?.values;
  return props.filtersNeedContext?.map(
    (contextItem) => formValues[contextItem],
  );
};

const handleAdvancedFilters = () => {
  filters.value = [];

  if (!rawFilters.value) return;

  const shouldUseState =
    props.shouldUseStateForRoute &&
    props.route.name !== "SingleEntity" &&
    !isPreviewElement;

  const { filtersToUse, fromState } = getFiltersFromState(shouldUseState);
  if (!filtersToUse) return;

  initializeFilters({
    advancedFilters: filtersToUse,
    fromState,
  });

  if (shouldUseState && !fromState) {
    saveFiltersToState();
  }

  applyFilters();
};

const handlePredefinedAdvancedFilters = async () => {
  const advancedFilters = transformFilterInputIntoAdvancedFilters(
    props.predefinedFilters,
  );

  await initializeFilters({
    advancedFilters,
    fromState: false,
  });

  applyFilters();
  return true;
};

const getFiltersFromState = (shouldUseState: boolean) => {
  if (!shouldUseState) {
    return {
      filtersToUse: rawFilters.value,
      fromState: false,
    };
  }

  const state = getStateForRoute(props.route);
  const hasStateFilters = !!state?.filterListItems?.length;

  return {
    filtersToUse: hasStateFilters ? state.filterListItems : rawFilters.value,
    fromState: hasStateFilters,
  };
};

const saveFiltersToState = () => {
  updateStateForRoute(props.route, {
    filterListItems: JSON.parse(JSON.stringify(filters.value)),
  });
};

const applyFilters = (saveState = false, force = true) => {
  if (saveState && props.shouldUseStateForRoute) saveFiltersToState();

  emit("applyFilters", getNormalizedFiltersForApi(), saveState, force);
};

const getAngleIcon = computed<DamsIcons>(() =>
  props.expandFilters ? DamsIcons.AngleUp : DamsIcons.AngleDown,
);

const toggleDisplayedFilters = () => {
  filters.value.forEach((filter) => {
    filter.isDisplayed =
      displayedFilterOptions.value
        .map((option) => option.label)
        .includes(t(filter.advancedFilter.label || "")) ||
      !!filter.advancedFilter.isDisplayedByDefault;
  });
};

const initializeAndActivateNewFilter = (
  advancedFilters: AdvancedFilters,
  value: any,
) => {
  initializeNewAdvancedFilters(advancedFilters);
  Object.values(advancedFilters).forEach((advancedFilter: AdvancedFilter) => {
    activateFilter(advancedFilter.key, value);
  });
  applyFilters(false);
};

onMounted(() => {
  if (props.onRegisterApi) {
    props.onRegisterApi({
      initializeAndActivateNewFilter: initializeAndActivateNewFilter,
      removeFilterFromList: removeFilterFromList,
      getNormalizedFiltersForApi: getNormalizedFiltersForApi,
    });
  }
  emit("filterMatcherMappingPromise", filterMatcherMappingPromise);
  emit("advancedFiltersPromise", advancedFiltersPromise);
  lastActiveFilter.value = getLastUsedFilterForRoute(props.route);
  setVariables({
    parentIds: props.parentEntityIdentifiers,
    entityType: props.entityType,
    entity: parentEntity?.value,
  });
});

if (props.parentEntityIdentifiers.length > 0)
  watch(
    () => isSaved.value,
    () => {
      if (isSaved.value) {
        applyFilters();
      }
    },
  );
watch(displayedFilterOptions, () => toggleDisplayedFilters());
watch(clearAllActiveFilters, () => {
  if (clearAllActiveFilters.value) {
    clearAllFilters({ saveState: true, clearSavedFilter: true });
  }
});

watch(selectedSavedFilter, () => {
  if (!selectedSavedFilter.value) {
    addLastUsedFilterToStateForRoute(props.route, undefined);
    lastActiveFilter.value = undefined;
    return clearAllFilters({ saveState: false, clearSavedFilter: false });
  }

  initializeFilters({
    advancedFilters: selectedSavedFilter.value.value,
    fromState: true,
  });

  addNewSavedFilterToLastUsedFiltersForRoute(
    props.route,
    selectedSavedFilter.value,
  );
  addLastUsedFilterToStateForRoute(props.route, selectedSavedFilter.value);
  lastActiveFilter.value = selectedSavedFilter.value;

  applyFilters(true);
});

watch(
  () => props.entityType,
  () => {
    setActiveSavedFilter(null);
    lastActiveFilter.value = getLastUsedFilterForRoute(props.route);
  },
);

const clearAllFilters = async ({
  saveState = false,
  clearSavedFilter = false,
}: {
  saveState: boolean;
  clearSavedFilter?: boolean;
}) => {
  let displayedFilterOption: DropdownOption | undefined = {
    label: "",
    value: "",
  };
  while (displayedFilterOption !== undefined)
    displayedFilterOption = displayedFilterOptions.value.pop();
  toggleDisplayedFilters();

  await resetFilters();

  setTimeout(() => (clearAllActiveFilters.value = false), 50);

  if (clearSavedFilter) {
    setActiveSavedFilter(null);
    lastActiveFilter.value = undefined;
    addLastUsedFilterToStateForRoute(props.route, undefined);
  }

  applyFilters(saveState);
};
</script>

<style>
.scrollable {
  overflow-y: auto;
  height: 70vh;
}
</style>
