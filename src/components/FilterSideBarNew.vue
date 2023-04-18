<template>
  <div
    class="lg:w-2/6 md:w-full lg:border-l-2 lg:border-r-2 border-solid border-neutral-50"
    v-on:keydown.enter="applyFilters()"
  >
    <div>
      <div class="flex flex-col py-3 px-3 align-center">
        <div>
          <p class="pl-1 text-xl font-medium">{{ $t("filter.filter") }}</p>
        </div>
        <div class="mt-2 flex justify-between">
          <p
            v-if="activeCount === 0"
            class="bg-neutral-lightest text-neutral-60 rounded-md h-10 w-3/12 text-center pt-1"
          >
            {{ activeCount }} {{ $t("filter.active") }}
          </p>
          <p
            v-if="activeCount > 0"
            class="bg-neutral-lightest text-neutral-700 rounded-md h-10 w-3/12 text-center pt-1"
          >
            {{ activeCount }} {{ $t("filter.active") }}
          </p>
          <p
            v-if="pickedSavedSearch"
            class="bg-neutral-lightest text-neutral-lightest rounded-md px-2 py-1 my-1"
          >
            {{ pickedSavedSearch?.metadata[0]?.value }}
          </p>
          <saved-searches
            :initialFilters="initialFilters"
            @removedSelectedSearch="removedSelectedSearch()"
          />
        </div>
      </div>
      <div
        class="flex justify-between border-solid border-b-2 border-neutral-50 px-3 pb-3"
      >
        <BaseButtonNew
          button-style="default"
          :label="$t('filter.clear')"
          @click="clearFilters()"
          class="w-3/12"
        />
        <BaseButtonNew
          button-style="default"
          :label="$t('filter.apply')"
          @click="applyFilters()"
          class="w-8/12"
        />
      </div>
    </div>
    <div
      v-for="(filter, i) in filters?.advancedFilters"
      :key="filter?.key"
      class="filters w-full lg:h-1770"
    >
      <FilterAccordion
        :active="initialFilters[i] && initialFilters[i].isActive"
        :label="filter?.label ? filter?.label : ''"
      >
        <template #content>
          <component
            :is="componentMap[filter.type]"
            v-model:value="initialFilters[i]"
            @update:value="triggerInitialfilter($event, i)"
            :filter="filter"
            :text="filter?.label"
            :accepted-entity-types="acceptedEntityTypes"
          />
        </template>
      </FilterAccordion>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineEmits, defineProps } from "vue";
import SavedSearches from "@/components/SavedSearches.vue";
import FilterAccordion from "@/components/base/FilterAccordion.vue";
import ChecklistFilter from "@/components/base/ChecklistFilterNew.vue";
import TextFilter from "@/components/base/TextFilterNew.vue";
import MinMaxFilter from "@/components/base/filters/MinmaxFilterNew.vue";
import DateFilter from "@/components/base/filters/DateFilter.vue";
import { useSavedSearchHelper } from "@/composables/useSavedSearchHelper";
import type { FilterInList } from "@/composables/useFilterHelper";
import { useQuery } from "@vue/apollo-composable";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { GetAdvancedFiltersDocument } from "@/generated-types/queries";
import { useFilterSideBarHelperNew } from "@/composables/useFilterSideBarHelperNew";
import type { FilterInput } from "@/generated-types/queries";
import BooleanFilter from "@/components/base/filters/BooleanFilter.vue";
import SelectionFilter from "@/components/base/filters/SelectionFilter.vue";
const props = defineProps<{
  advancedFiltersChoice?: "entityFilters";
  acceptedEntityTypes: string[];
}>();

const componentMap: any = {
  checklist: ChecklistFilter,
  text: TextFilter,
  minmax: MinMaxFilter,
  selection: SelectionFilter,
  date: DateFilter,
  boolean: BooleanFilter,
};

const { pickedSavedSearch, clearTypename, setPickedSavedSearch } =
  useSavedSearchHelper();

const { clearInitialFilters, initialFilters, activeCount } =
  useFilterSideBarHelperNew();

const emit = defineEmits<{
  (event: "activeFilters", initialFilters: FilterInput[]): void;
}>();

const { result: filters } = useQuery(GetAdvancedFiltersDocument, {
  choice: props.advancedFiltersChoice,
});

const triggerInitialfilter = (event: any, index: number) => {
  initialFilters.value[index] = event;
};

const applyFilters = () => {
  const returnArray = initialFilters.value.map((filter: FilterInList) => {
    filter = JSON.parse(JSON.stringify(filter));
    clearTypename(filter.input);
    return filter.input;
  });
  emit("activeFilters", returnArray);
};

const clearFilters = () => {
  clearInitialFilters(props.acceptedEntityTypes);
  setPickedSavedSearch(undefined);
  applyFilters();
};

const removedSelectedSearch = () => {
  clearFilters();
};
</script>
<style></style>
