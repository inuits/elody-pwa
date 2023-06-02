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
          class="w-4/12"
          :label="$t('filter.clear')"
          button-style="default"
        />
        <BaseButtonNew
          class="grow"
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
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  DamsIcons,
  GetAdvancedFiltersDocument,
  GetFilterMatcherMappingDocument,
  type AdvancedFilter,
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
import { defineProps, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useQuery } from "@vue/apollo-composable";

export type FilterListItem = {
  isActive: boolean;
  advancedFilter: AdvancedFilter;
};

const props = defineProps<{
  entityType: string;
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

const { onResult: onAdvancedFiltersResult } = useQuery<GetAdvancedFiltersQuery>(
  GetAdvancedFiltersDocument,
  { entityType: props.entityType }
);
onAdvancedFiltersResult((result) => {
  const advancedFilters: Maybe<AdvancedFilters> | undefined = (
    result.data.EntityTypeFilters as BaseEntity
  ).advancedFilters;
  if (!advancedFilters) return;

  Object.values(advancedFilters).forEach((advancedFilter) => {
    if (typeof advancedFilter !== "string") {
      filters.value.push({
        isActive: !!advancedFilter.defaultValue,
        advancedFilter,
      });
    }
  });
});

const applyFilters = () => {};
</script>
