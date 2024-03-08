<template>
  <div
    class="relative h-full bg-neutral-white w-full"
    :class="expandFilters ? 'rounded-t' : 'rounded-xl'"
    @keydown.enter="applyFilters(true)"
  >
    <div
      class="flex justify-between items-center px-4 h-12 border-t border-x select-none cursor-pointer"
      :class="
        expandFilters
          ? 'border-neutral-light rounded-t'
          : 'border-neutral-white rounded-xl'
      "
      @click="() => emit('expandFilters', expandFilters)"
    >
      <span class="text-text-body text-xl font-bold">
        {{ t("filters.filter") }}
      </span>
      <div class="flex">
        <span class="text-text-body">
          {{ activeFilterCount }} {{ t("filters.active") }}
        </span>
        <unicon
          class="text-text-body ml-4"
          :name="Unicons[getAngleIcon].name"
        />
      </div>
    </div>

    <div
      class="absolute w-full rounded-b bg-neutral-white"
      :class="
        expandFilters
          ? 'scrollable border-x border-b-2 border-neutral-light'
          : ''
      "
    >
      <div v-if="expandFilters" class="p-4">
        <div class="flex justify-between gap-4 pb-4">
          <BaseButtonNew
            class="!w-1/3"
            :label="t('filters.clear')"
            button-style="default"
            @click="() => (clearAllActiveFilters = true)"
          />
          <BaseButtonNew
            :label="t('filters.apply')"
            button-style="accentNormal"
            @click="applyFilters(true)"
          />
          <!--          <BaseButtonNew-->
          <!--            :icon="DamsIcons.EllipsisV"-->
          <!--            class="!w-1/5"-->
          <!--            @click.stop="(event: MouseEvent) => contextMenuHandler.openContextMenu({x: event.clientX, y: event.clientY})"-->
          <!--          />-->
        </div>
        <div>
          <BaseInputAutocomplete
            v-model="displayedFilterOptions"
            :options="
              filters
                .filter((filter) => !filter.advancedFilter.isDisplayedByDefault)
                .filter((filter) => !filter.advancedFilter.hidden)
                .filter((filter) => filter.advancedFilter.label)
                .map((filter) => {
                  return {
                    label: t(filter.advancedFilter.label || ''),
                    value: t(filter.advancedFilter.label || ''),
                  };
                })
            "
            :placeholder="t('filters.add-filter')"
            autocomplete-style="defaultWithBorder"
          />
        </div>
      </div>

      <div v-if="expandFilters && matchers.length > 0">
        <FiltersListItem
          v-for="filter in filters.filter((filter) => filter.isDisplayed)"
          :key="filter.advancedFilter.key || ''"
          :filter="filter"
          :matchers="
            matchers.filter((option) =>
              filterMatcherMapping[filter.advancedFilter.type].includes(
                option.value
              )
            )
          "
          :clear-all-active-filters="clearAllActiveFilters"
          @activate-filter="(filterInput: AdvancedFilterInput, matcher: DropdownOption | undefined) => {
            filter.isActive = true;
            filter.inputFromState = filterInput;
            filter.selectedMatcher = matcher;
            activeFilters = activeFilters.filter(activeFilter => activeFilter.key !== filterInput.key);
            activeFilters.push(filterInput);
          }"
          @deactivate-filter="
            (key) => {
              const filter = filters.filter(
                (filter) => filter.advancedFilter.key === key
              )[0];
              filter.isActive = false;
              filter.inputFromState = undefined;
              filter.selectedMatcher = undefined;
              activeFilters = activeFilters.filter(
                (filter) => filter.key !== key
              );
            }
          "
        />
      </div>
    </div>
    <base-context-menu :context-menu="contextMenuHandler.getContextMenu()"
      ><saved-searches
    /></base-context-menu>
  </div>
</template>

<script lang="ts" setup>
import type { RouteLocationNormalizedLoaded } from "vue-router";
import {
  AdvancedFilterTypes,
  DamsIcons,
  Entitytyping,
  GetAdvancedFiltersDocument,
  GetFilterMatcherMappingDocument,
  type AdvancedFilterInput,
  type AdvancedFilters,
  type BaseEntity,
  type DropdownOption,
  type FilterMatcherMap,
  type GetFilterMatcherMappingQuery,
  type Maybe,
} from "@/generated-types/queries";
import {
  useStateManagement,
  type FilterListItem,
} from "@/composables/useStateManagement";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseContextMenu from "@/components/base/BaseContextMenu.vue";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import FiltersListItem from "@/components/filters/FiltersListItem.vue";
import SavedSearches from "@/components/SavedSearches.vue";
import useEditMode from "@/composables/useEdit";
import { apolloClient } from "@/main";
import { computed, defineProps, onMounted, ref, watch } from "vue";
import { ContextMenuHandler } from "@/components/context-menu-actions/ContextMenuHandler";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import { useQueryVariablesFactory } from "@/composables/useQueryVariablesFactory";

const props = withDefaults(
  defineProps<{
    expandFilters: boolean;
    manipulationQuery: object | undefined;
    parentEntityIdentifiers?: string[];
    route: RouteLocationNormalizedLoaded;
    setAdvancedFilters: Function;
  }>(),
  {
    parentEntityIdentifiers: () => [],
  }
);

const emit = defineEmits<{
  (
    event: "filterMatcherMappingPromise",
    filterMatcherMappingPromise: (entityType: Entitytyping) => Promise<void>
  ): void;
  (
    event: "advancedFiltersPromise",
    advancedFiltersPromise: (entityType: Entitytyping) => Promise<void>
  ): void;
  (event: "applyFilters", advancedFilterInputs: AdvancedFilterInput[]): void;
  (event: "expandFilters", expandFilters: boolean): void;
}>();

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
const activeFilterCount = ref<number>(0);
const activeFilters = ref<AdvancedFilterInput[]>([]);
const advancedFilters = ref<Maybe<AdvancedFilters>>();
const clearAllActiveFilters = ref<boolean>(false);
const contextMenuHandler = ref<ContextMenuHandler>(new ContextMenuHandler());
const displayedFilterOptions = ref<DropdownOption[]>([]);
const filters = ref<FilterListItem[]>([]);
const matchers = ref<DropdownOption[]>([]);
const { getStateForRoute, updateStateForRoute } = useStateManagement();
const { isSaved } = useEditMode();
const { setAdvancedFilterInputs } = useQueryVariablesFactory();
const { t } = useI18n();

const filterMatcherMappingPromise = async () => {
  return apolloClient
    .query<GetFilterMatcherMappingQuery>({
      query: GetFilterMatcherMappingDocument,
    })
    .then((result) => {
      filterMatcherMapping.value = result.data.FilterMatcherMapping;
      handleFilterMatcherMapping();
    });
};

const advancedFiltersPromise = async (entityType: Entitytyping) => {
  return apolloClient
    .query({
      query: props.manipulationQuery?.filtersDocument
        ? props.manipulationQuery.filtersDocument
        : GetAdvancedFiltersDocument,
      variables: { entityType },
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
    })
    .then((result) => {
      advancedFilters.value = (
        result.data?.EntityTypeFilters as BaseEntity
      )?.advancedFilters;
      if (advancedFilters.value) {
        //if (props.manipulationQuery?.filtersDocument)
        //  setAdvancedFilterInputs(advancedFilters.value);
        handleAdvancedFilters();
      }
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
  if (!advancedFilters.value) return;
  filters.value = [];
  activeFilters.value = [];
  const state = getStateForRoute(props.route);

  if (!state?.filterListItems || state.filterListItems.length == 0) {
    Object.values(advancedFilters.value).forEach((advancedFilter) => {
      if (typeof advancedFilter !== "string") {
        let hiddenFilter: AdvancedFilterInput | undefined;
        if (advancedFilter.hidden) {
          hiddenFilter = {
            type: advancedFilter.type,
            parent_key: advancedFilter.parentKey,
            key: advancedFilter.key,
            value: advancedFilter.defaultValue,
            item_types: advancedFilter.itemTypes,
            match_exact: true,
            edge_collection: advancedFilter.edgeCollection,
          };
          if (advancedFilter.lookup)
            hiddenFilter.lookup = {
              from: advancedFilter.lookup.from,
              local_field: advancedFilter.lookup.local_field,
              foreign_field: advancedFilter.lookup.foreign_field,
              as: advancedFilter.lookup.as,
            };

          if (
            advancedFilter.parentKey === "relations" ||
            advancedFilter.parentKey === "edge" ||
            (advancedFilter.type === AdvancedFilterTypes.Selection &&
              advancedFilter.hidden) // this needs a refactor
          ) {
            if (props.parentEntityIdentifiers.length > 0) {
              hiddenFilter.value = props.parentEntityIdentifiers;
              if (advancedFilter.itemTypes)
                activeFilters.value = [hiddenFilter];
              else activeFilters.value.push(hiddenFilter);
            }
          } else activeFilters.value.push(hiddenFilter);
        }

        filters.value.push({
          isActive: advancedFilter.type === AdvancedFilterTypes.Type,
          isDisplayed: advancedFilter.isDisplayedByDefault ?? false,
          advancedFilter,
          inputFromState: hiddenFilter,
          selectedMatcher: undefined,
        });
      }
    });
    updateStateForRoute(props.route, {
      filterListItems: JSON.parse(JSON.stringify(filters.value)),
    });
  } else {
    filters.value = state?.filterListItems;
    activeFilters.value = filters.value
      .filter((filter) => filter.isActive && filter.inputFromState)
      .map((filter) => filter.inputFromState) as AdvancedFilterInput[];
  }

  applyFilters();
};

const applyFilters = (saveState = false) => {
  if (saveState)
    updateStateForRoute(props.route, {
      filterListItems: JSON.parse(JSON.stringify(filters.value)),
    });
  emit("applyFilters", activeFilters.value);
};

const getAngleIcon = computed<DamsIcons>(() =>
  props.expandFilters ? DamsIcons.AngleUp : DamsIcons.AngleDown
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
});

if (props.parentEntityIdentifiers.length > 0)
  watch(
    () => isSaved.value,
    () => {
      if (isSaved.value) applyFilters();
    }
  );
watch(displayedFilterOptions, () => toggleDisplayedFilters());
watch(activeFilters, () => {
  activeFilterCount.value = 0;
  filters.value.forEach((filter) => {
    if (filter.advancedFilter.hidden) return;
    activeFilterCount.value += filter.isActive ? 1 : 0;
  });
});
watch(clearAllActiveFilters, () => {
  if (clearAllActiveFilters.value) {
    let displayedFilterOption: DropdownOption | undefined = {
      label: "",
      value: "",
    };
    while (displayedFilterOption !== undefined)
      displayedFilterOption = displayedFilterOptions.value.pop();
    toggleDisplayedFilters();

    activeFilters.value = activeFilters.value.filter((activeFilter) =>
      filters.value
        .filter((filter) => !!filter.advancedFilter.hidden)
        .map((filter) => filter.advancedFilter.key)
        .includes(activeFilter.key)
    );
    filters.value.forEach((filter) => {
      if (filter.advancedFilter.hidden) return;
      filter.isActive = false;
      filter.inputFromState = undefined;
      filter.selectedMatcher = undefined;
    });
    setTimeout(() => (clearAllActiveFilters.value = false), 50);
    applyFilters(true);
  }
});
</script>

<style>
.scrollable {
  overflow-y: auto;
  height: 70vh;
}
</style>
