<template>
  <div
    class="ml-6 bg-neutral-white border-[1px] border-neutral-light rounded lg:w-2/6 md:w-full"
    @keydown.enter="applyFilters()"
  >
    <div class="flex flex-col gap-4 p-4">
      <div>
        <span class="text-text-body text-xl font-bold">
          {{ $t("filter.filter") }}
        </span>
      </div>
      <div class="flex justify-between gap-4">
        <BaseButtonNew
          class="!w-1/3"
          :label="$t('filter.clear')"
          button-style="default"
          @click="() => (clearAllActiveFilters = true)"
        />
        <BaseButtonNew
          :label="$t('filter.apply')"
          button-style="accentAccent"
          @click="applyFilters()"
        />
      </div>
    </div>

    <div v-if="matchers.length > 0">
      <FiltersListItem
        v-for="filter in filters"
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
import FiltersListItem from "@/components/filters-new/FiltersListItem.vue";
import { defineProps, ref, toRefs, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useQuery } from "@vue/apollo-composable";

export type FilterListItem = {
  isActive: boolean;
  advancedFilter: AdvancedFilter;
};

const props = defineProps<{
  entityType: string;
}>();

const emit = defineEmits<{
  (event: "applyFilters", advancedFilterInputs: AdvancedFilterInput[]): void;
}>();

const { t } = useI18n();
const filterMatcherMapping = ref<FilterMatcherMap>({
  id: [],
  text: [],
  date: [],
  number: [],
  selection: [],
  boolean: [],
});
const matchers = ref<DropdownOption[]>([]);
const filters = ref<FilterListItem[]>([]);
const activeFilters = ref<AdvancedFilterInput[]>([]);
const clearAllActiveFilters = ref<boolean>(false);
const { entityType } = toRefs(props);

const { onResult: onFilterMatcherMappingResult } =
  useQuery<GetFilterMatcherMappingQuery>(GetFilterMatcherMappingDocument);
onFilterMatcherMappingResult((result) => {
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
    { enabled: true }
  );
onAdvancedFiltersResult((result) => {
  const advancedFilters: Maybe<AdvancedFilters> | undefined = (
    result.data.EntityTypeFilters as BaseEntity
  ).advancedFilters;
  if (!advancedFilters) return;

  filters.value = [];
  Object.values(advancedFilters).forEach((advancedFilter) => {
    if (typeof advancedFilter !== "string") {
      if (advancedFilter.defaultValue)
        activeFilters.value.push({
          type: AdvancedFilterTypes.Text,
          key: advancedFilter.key,
          value: advancedFilter.defaultValue,
          match_exact: true,
        });
      filters.value.push({
        isActive: !!advancedFilter.defaultValue,
        advancedFilter,
      });
    }
  });
});

const applyFilters = () => emit("applyFilters", activeFilters.value);

watch(activeFilters, () =>
  filters.value.forEach(
    (filter) =>
      (filter.isActive = activeFilters.value
        .map((activeFilter) => activeFilter.key)
        .includes(filter.advancedFilter.key))
  )
);
watch(clearAllActiveFilters, () => {
  if (clearAllActiveFilters.value) {
    activeFilters.value = activeFilters.value.filter((activeFilter) =>
      filters.value
        .filter((filter) => !!filter.advancedFilter.defaultValue)
        .map((filter) => filter.advancedFilter.key)
        .includes(activeFilter.key)
    );
    console.log(activeFilters.value);
    setTimeout(() => (clearAllActiveFilters.value = false), 50);
    applyFilters();
  }
});
watch(entityType, () => {
  activeFilters.value = [];
  refetch();
});
</script>
