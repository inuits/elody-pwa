<template>
  <div
    class="ml-6 bg-neutral-white border-[1px] border-neutral-light rounded lg:w-2/6 md:w-full"
    v-on:keydown.enter="applyFilters()"
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

    <FiltersListItem
      v-for="filter in filters"
      :key="filter.advancedFilter.key"
      :filter="filter"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  GetAdvancedFiltersDocument,
  type AdvancedFilter,
  type AdvancedFilters,
  type BaseEntity,
  type GetAdvancedFiltersQuery,
  type Maybe,
} from "@/generated-types/queries";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import FiltersListItem from "@/components/filters-new/FiltersListItem.vue";
import { defineProps, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";

export type FilterListItem = {
  isActive: boolean;
  advancedFilter: AdvancedFilter;
};

const props = defineProps<{
  entityType: string;
}>();

const filters = ref<FilterListItem[]>([]);

const { onResult } = useQuery<GetAdvancedFiltersQuery>(
  GetAdvancedFiltersDocument,
  { entityType: props.entityType }
);

onResult((result) => {
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
