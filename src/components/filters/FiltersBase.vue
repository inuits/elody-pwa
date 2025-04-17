<template>
  <div
    data-cy="filter-base"
    class="relative h-full bg-neutral-white w-full"
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
        'absolute w-full rounded-b bg-neutral-white',
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
          :related-active-filter="
            activeFilters.filter(
              (activeFilter) =>
                JSON.stringify(activeFilter.key) ===
                JSON.stringify(filter.advancedFilter.key),
            )[0]
          "
          :matchers="
            matchers.filter((option) =>
              filterMatcherMapping[filter.advancedFilter.type].includes(
                option.value,
              ),
            )
          "
          :clear-all-active-filters="clearAllActiveFilters"
          @activate-filter="
            (
              filterInput: AdvancedFilterInput,
              matcher: DropdownOption | undefined,
            ) => {
              filter.isActive = true;
              filter.inputFromState = filterInput;
              filter.selectedMatcher = matcher;
              activeFilters = activeFilters.filter(
                (activeFilter) => activeFilter.key !== filterInput.key,
              );
              let index = activeFilters.findIndex(
                (activeFilter) =>
                  JSON.stringify(activeFilter.key) ===
                  JSON.stringify(filterInput.key),
              );
              if (index !== -1) activeFilters.splice(index, 1, filterInput);
              else activeFilters.push(filterInput);
            }
          "
          @deactivate-filter="
            (key, forceApply = false) => {
              const filter = filters.filter(
                (filter) => filter.advancedFilter.key === key,
              )[0];
              if (filter.advancedFilter.hidden) return;
              filter.isActive = false;
              filter.inputFromState = undefined;
              filter.selectedMatcher = undefined;
              activeFilters = activeFilters.filter(
                (filter) => JSON.stringify(filter.key) !== JSON.stringify(key),
              );
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
import { useRoute } from "vue-router";
import {
  type AdvancedFilterInput,
  type AdvancedFilters,
  AdvancedFilterTypes,
  type BaseEntity,
  DamsIcons,
  type DropdownOption,
  EntitySubelement,
  Entitytyping,
  type FilterMatcherMap,
  GetAdvancedFiltersDocument,
  GetFilterMatcherMappingDocument,
  type GetFilterMatcherMappingQuery,
  type Maybe,
  TypeModals,
} from "@/generated-types/queries";
import { useStateManagement } from "@/composables/useStateManagement";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseContextMenu from "@/components/base/BaseContextMenu.vue";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import FiltersListItem from "@/components/filters/FiltersListItem.vue";
import SavedSearches from "@/components/SavedSearches.vue";
import useEditMode from "@/composables/useEdit";
import { apolloClient, auth } from "@/main";
import { computed, defineProps, inject, onMounted, ref, watch } from "vue";
import { ContextMenuHandler } from "@/components/context-menu-actions/ContextMenuHandler";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import {
  type SavedSearchType,
  useSaveSearchHepler,
} from "@/composables/useSaveSearchHepler";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { useFiltersBase } from "@/composables/useFiltersBase";
import { useFormHelper } from "@/composables/useFormHelper";
import { useBaseModal } from "@/composables/useBaseModal";

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
  }>(),
  {
    parentEntityIdentifiers: () => [],
    enableSaveSearchFilters: true,
    shouldUseStateForRoute: true,
    filtersNeedContext: undefined,
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

const parentEntity: any = inject("ParentEntityProvider");
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
const advancedFilters = ref<Maybe<AdvancedFilters>>();
const clearAllActiveFilters = ref<boolean>(false);
const contextMenuHandler = ref<ContextMenuHandler>(new ContextMenuHandler());
const displayedFilterOptions = ref<DropdownOption[]>([]);
const lastActiveFilter = ref<SavedSearchType | undefined>(undefined);
const matchers = ref<DropdownOption[]>([]);
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
const router = useRoute();
const { dequeueAllItemsForBulkProcessing } = useBulkOperations();
const { filters, activeFilters, activeFilterCount, displayedFilters } =
  useFiltersBase();
const config = inject("config") as any;

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
  return apolloClient
    .query<GetFilterMatcherMappingQuery>({
      query: GetFilterMatcherMappingDocument,
      fetchPolicy: "no-cache",
    })
    .then((result) => {
      filterMatcherMapping.value = result.data.FilterMatcherMapping;
      handleFilterMatcherMapping();
    });
};

const advancedFiltersPromise = async (entityType: Entitytyping) => {
  const variables = { entityType: entityType, context: undefined };
  if (props.filtersNeedContext) {
    variables.context = [];
    const formValues = useFormHelper().getForm(
      inject("entityFormData").id,
    )?.values;
    props.filtersNeedContext.forEach((contextItem) => {
      variables.context.push(formValues[contextItem]);
    });
  }

  return apolloClient
    .query({
      query: props.manipulationQuery?.filtersDocument
        ? props.manipulationQuery.filtersDocument
        : GetAdvancedFiltersDocument,
      variables: variables,
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
    })
    .then((result) => {
      advancedFilters.value = (
        result.data?.EntityTypeFilters as BaseEntity
      )?.advancedFilters;
      handleAdvancedFilters();
    });
};

const handleFilterMatcherMapping = () => {
  const matcherSet = new Set<string>();
  Object.values(filterMatcherMapping.value).forEach((matcherArray) => {
    if (typeof matcherArray !== "string")
      for (const matcher of matcherArray) matcherSet.add(matcher);
  });

  matchers.value = Array.from(matcherSet).map((matcher) => {
    return {
      icon: DamsIcons.NoIcon,
      label: t(`filters.matcher-labels.${matcher}`),
      value: matcher,
    };
  });
};

const handleAdvancedFilters = () => {
  filters.value = [];
  activeFilters.value = [];

  if (advancedFilters.value) {
    const state =
      props.shouldUseStateForRoute &&
      props.route.name !== "SingleEntity" &&
      getStateForRoute(props.route);
    if (!state?.filterListItems || state.filterListItems.length == 0) {
      Object.values(advancedFilters.value).forEach((advancedFilter) => {
        if (typeof advancedFilter !== "string") {
          let hiddenFilter: AdvancedFilterInput | undefined;
          if (advancedFilter.hidden || advancedFilter.defaultValue) {
            hiddenFilter = {
              type: advancedFilter.type,
              key: advancedFilter.key,
              value: advancedFilter.defaultValue,
              item_types: advancedFilter.itemTypes,
              parent_key: advancedFilter.parentKey,
              match_exact: true,
            };
            if (advancedFilter.lookup)
              hiddenFilter.lookup = {
                from: advancedFilter.lookup.from,
                local_field: advancedFilter.lookup.local_field,
                foreign_field: advancedFilter.lookup.foreign_field,
                as: advancedFilter.lookup.as,
              };

            if (
              advancedFilter.hidden &&
              advancedFilter.defaultValue === "entityType" &&
              !advancedFilter.doNotOverrideDefaultValue
            ) {
              hiddenFilter.value = router.meta.entityType;
            }

            if (
              advancedFilter.type === AdvancedFilterTypes.Selection &&
              advancedFilter.hidden &&
              !advancedFilter.doNotOverrideDefaultValue
            ) {
              if ( typeof advancedFilter.defaultValue === "string") {
                // Regex for adding ids of a relation in value
                const regex = /relations\.([^.]+)\.key/;
                const match = advancedFilter.defaultValue?.match(regex);
                if (match && match[1]) {
                  const ids = parentEntity.value.relationValues[match[1].split("$")[1]].map(relation => relation["key"]);
                  hiddenFilter.value = ids;
                  activeFilters.value.push(hiddenFilter);
                  return;
                }
              }

              // this needs a refactor
              if (props.parentEntityIdentifiers.length > 0) {
                if (
                  Array.isArray(hiddenFilter.value) &&
                  hiddenFilter?.value.length > 0
                ) {
                  hiddenFilter.value = [
                    ...props.parentEntityIdentifiers,
                    ...hiddenFilter?.value,
                  ];
                } else {
                  hiddenFilter.value = props.parentEntityIdentifiers;
                }
                if (advancedFilter.itemTypes)
                  activeFilters.value = [hiddenFilter];
                else activeFilters.value.push(hiddenFilter);
              } else if (advancedFilter.key === "type")
                activeFilters.value.push(hiddenFilter);
            } else activeFilters.value.push(hiddenFilter);
          }

          filters.value.push({
            isActive: advancedFilter.hidden || advancedFilter.defaultValue,
            isDisplayed: advancedFilter.isDisplayedByDefault ?? false,
            advancedFilter,
            inputFromState: hiddenFilter,
            selectedMatcher: undefined,
          });
        }
      });
      if (props.shouldUseStateForRoute)
        updateStateForRoute(props.route, {
          filterListItems: JSON.parse(JSON.stringify(filters.value)),
        });
    } else {
      filters.value = state?.filterListItems;
      activeFilters.value = filters.value
        .filter((filter) => filter.isActive && filter.inputFromState)
        .map((filter) => filter.inputFromState) as AdvancedFilterInput[];
    }
  }

  applyFilters();
};

const applyFilters = (saveState = false, force = true) => {
  if (saveState && props.shouldUseStateForRoute)
    updateStateForRoute(props.route, {
      filterListItems: JSON.parse(JSON.stringify(filters.value)),
    });
  if (!useBaseModal().getModalInfo(TypeModals.ElodyEntityTaggingModal).open)
    // Todo: Find out why this changes the filters when opening the modal, this is ugly
    emit("applyFilters", activeFilters.value, saveState, force);
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

onMounted(() => {
  emit("filterMatcherMappingPromise", filterMatcherMappingPromise);
  emit("advancedFiltersPromise", advancedFiltersPromise);
  lastActiveFilter.value = getLastUsedFilterForRoute(props.route);
});

if (props.parentEntityIdentifiers.length > 0)
  watch(
    () => isSaved.value,
    () => {
      if (isSaved.value) applyFilters();
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

  filters.value = selectedSavedFilter.value.value;
  activeFilters.value = filters.value
    .filter((filter) => filter.isActive && filter.inputFromState)
    .map((filter) => filter.inputFromState) as AdvancedFilterInput[];

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
    dequeueAllItemsForBulkProcessing(BulkOperationsContextEnum.FilterOptions);
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

  activeFilters.value = filters.value
    .filter((filter) => !!filter.advancedFilter.hidden)
    .map((filter) => filter.inputFromState);
  filters.value.forEach((filter) => {
    if (filter.advancedFilter.hidden) return;
    filter.isActive = false;
    filter.inputFromState = undefined;
    filter.selectedMatcher = undefined;
  });
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
