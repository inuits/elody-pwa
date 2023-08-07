<template>
  <div
    class="relative h-full bg-neutral-white w-full"
    :class="expandFilters ? 'rounded-t' : 'rounded-xl'"
    @keydown.enter="applyFilters()"
  >
    <div
      class="flex justify-between items-center px-4 h-12 border-t border-x select-none cursor-pointer"
      :class="
        expandFilters
          ? 'border-neutral-light rounded-t'
          : 'border-neutral-white rounded-xl'
      "
      @click="
        () => {
          emit('expandFilters', expandFilters);
        }
      "
    >
      <span class="text-text-body text-xl font-bold">
        {{ $t("filters.filter") }}
      </span>
      <div class="flex">
        <span class="text-text-body">
          {{ activeFilterCount }} {{ $t("filters.active") }}
        </span>
        <unicon
          class="text-text-body ml-4"
          :name="Unicons[getAngleIcon].name"
        />
      </div>
    </div>

    <div
      class="absolute w-full rounded-b bg-neutral-white"
      :class="expandFilters ? 'border-x border-b-2 border-neutral-light' : ''"
    >
      <div v-if="expandFilters" class="p-4">
        <div class="flex justify-between gap-4 pb-4">
          <BaseButtonNew
            class="!w-1/3"
            :label="$t('filters.clear')"
            button-style="default"
            @click="() => (clearAllActiveFilters = true)"
          />
          <BaseButtonNew
            :label="$t('filters.apply')"
            button-style="accentNormal"
            @click="applyFilters()"
          />
        </div>
        <div>
          <BaseInputAutocomplete
            v-model="labelsOfDisplayedFilters"
            :options="
              filters
                .filter((filter) => !filter.advancedFilter.isDisplayedByDefault)
                .filter((filter) => !filter.advancedFilter.defaultValue)
                .map((filter) => filter.advancedFilter.label)
            "
            :placeholder="t('filters.add-filter')"
            autocomplete-style="defaultWithBorder"
          />
        </div>
      </div>

      <div v-if="expandFilters && matchers.length > 0">
        <FiltersListItem
          v-for="filter in filters.filter((filter) => filter.isDisplayed)"
          :key="filter.advancedFilter.key"
          :filter="filter"
          :matchers="
            matchers.filter((option) =>
              filterMatcherMapping[filter.advancedFilter.type].includes(
                option.value
              )
            )
          "
          :clear-all-active-filters="clearAllActiveFilters"
          @activate-filter="(filter: AdvancedFilterInput) => {
            activeFilters = activeFilters.filter(activeFilter => activeFilter.key !== filter.key);
            activeFilters.push(filter);
          }"
          @deactivate-filter="(key: string) => activeFilters = activeFilters.filter(filter => filter.key !== key)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  AdvancedFilterTypes,
  DamsIcons,
  GetAdvancedFiltersDocument,
  GetFilterMatcherMappingDocument,
  type AdvancedFilter,
  type AdvancedFilterInput,
  type AdvancedFilters,
  type BaseEntity,
  type DropdownOption,
  type FilterMatcherMap,
  type GetAdvancedFiltersQuery,
  type GetFilterMatcherMappingQuery,
  type Maybe,
} from "@/generated-types/queries";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import FiltersListItem from "@/components/filters-new/FiltersListItem.vue";
import useEditMode from "@/composables/useEdit";
import { computed, defineProps, ref, toRefs, watch } from "vue";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import { useQuery } from "@vue/apollo-composable";

export type FilterListItem = {
  isActive: boolean;
  isDisplayed: boolean;
  advancedFilter: AdvancedFilter;
};

const props = defineProps<{
  entityType: string;
  expandFilters: boolean;
  parentEntityId?: string;
}>();

const emit = defineEmits<{
  (event: "applyFilters", advancedFilterInputs: AdvancedFilterInput[]): void;
  (event: "expandFilters", expandFilters: boolean): void;
}>();

const { t } = useI18n();
const filterMatcherMapping = ref<FilterMatcherMap>({
  id: [],
  text: [],
  date: [],
  number: [],
  selection: [],
  boolean: [],
  relation: [],
});
const matchers = ref<DropdownOption[]>([]);
const filters = ref<FilterListItem[]>([]);
const labelsOfDisplayedFilters = ref<string[]>([]);
const activeFilters = ref<AdvancedFilterInput[]>([]);
const activeFilterCount = ref<number>(0);
const clearAllActiveFilters = ref<boolean>(false);
const { entityType } = toRefs(props);
const { isSaved } = useEditMode();

const { onResult: onFilterMatcherMappingResult } =
  useQuery<GetFilterMatcherMappingQuery>(
    GetFilterMatcherMappingDocument,
    undefined,
    {
      enabled: true,
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
    }
  );
onFilterMatcherMappingResult((result) => {
  if (!result.data) return;
  filterMatcherMapping.value = result.data.FilterMatcherMapping;

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
});

const { refetch, onResult: onAdvancedFiltersResult } =
  useQuery<GetAdvancedFiltersQuery>(
    GetAdvancedFiltersDocument,
    { entityType: entityType.value },
    {
      enabled: true,
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
    }
  );
onAdvancedFiltersResult((result) => {
  const advancedFilters: Maybe<AdvancedFilters> | undefined = (
    result.data?.EntityTypeFilters as BaseEntity
  )?.advancedFilters;
  if (!advancedFilters) return;

  filters.value = [];
  Object.values(advancedFilters).forEach((advancedFilter) => {
    if (typeof advancedFilter !== "string") {
      if (advancedFilter.defaultValue) {
        const hiddenFilter: AdvancedFilterInput = {
          type: AdvancedFilterTypes.Text,
          key: advancedFilter.key,
          value: advancedFilter.defaultValue,
          match_exact: true,
        };

        if (advancedFilter.type === AdvancedFilterTypes.Relation) {
          if (props.parentEntityId) {
            hiddenFilter.type = advancedFilter.type;
            hiddenFilter.parent = props.parentEntityId;
            activeFilters.value.push(hiddenFilter);
          }
        } else activeFilters.value.push(hiddenFilter);
      }

      filters.value.push({
        isActive: !!advancedFilter.defaultValue,
        isDisplayed: advancedFilter.isDisplayedByDefault ?? false,
        advancedFilter,
      });
      if (entityType.value || props.parentEntityId) applyFilters();
    }
  });
});

const applyFilters = () => {
  emit("applyFilters", activeFilters.value);
};

const getAngleIcon = computed<DamsIcons>(() =>
  props.expandFilters ? DamsIcons.AngleUp : DamsIcons.AngleDown
);

if (props.parentEntityId)
  watch(isSaved, () => {
    if (isSaved) applyFilters();
  });
watch(labelsOfDisplayedFilters, () =>
  filters.value.forEach(
    (filter) =>
      (filter.isDisplayed =
        labelsOfDisplayedFilters.value.includes(filter.advancedFilter.label) ||
        filter.advancedFilter.isDisplayedByDefault)
  )
);
watch(activeFilters, () => {
  activeFilterCount.value = 0;

  filters.value.forEach((filter) => {
    filter.isActive = activeFilters.value
      .map((activeFilter) => activeFilter.key)
      .includes(filter.advancedFilter.key);
    activeFilterCount.value += filter.isActive ? 1 : 0;
  });
});
watch(clearAllActiveFilters, () => {
  if (clearAllActiveFilters.value) {
    labelsOfDisplayedFilters.value = [];
    activeFilters.value = activeFilters.value.filter((activeFilter) =>
      filters.value
        .filter((filter) => !!filter.advancedFilter.defaultValue)
        .map((filter) => filter.advancedFilter.key)
        .includes(activeFilter.key)
    );
    setTimeout(() => (clearAllActiveFilters.value = false), 50);
    applyFilters();
  }
});
watch(entityType, () => {
  clearAllActiveFilters.value = true;
  activeFilters.value = [];
  refetch({ entityType: entityType.value });
});
</script>
