<template>
  <div
    class="lg:w-2/6 md:w-full lg:border-l-2 lg:border-r-2 border-solid border-neutral-50"
    v-on:keydown.enter="applyFilters()"
  >
    <div>
      <div class="flex justify-between py-3 px-3 align-center">
        <div>
          <p class="pl-1 text-xl font-medium">{{ $t("filter.filter") }}</p>
        </div>
        <div class="flex justify-between gap-3">
          <p class="bg-blue-50 text-blue-300 rounded-md px-2 py-1 my-1">
            {{ activeCount }} {{ $t("filter.active") }}
          </p>
          <p
            v-if="pickedSavedSearch"
            class="bg-blue-50 text-blue-300 rounded-md px-2 py-1 my-1"
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
        />
        <BaseButtonNew
          button-style="default"
          :label="$t('filter.apply')"
          @click="applyFilters()"
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
            v-model="initialFilters[i]"
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
import checklist from "@/components/base/ChecklistFilter.vue";
import tekst from "@/components/base/TextFilter.vue";
import minmax from "@/components/base/MinmaxFilter.vue";
import multiselect from "@/components/base/MultiFilter.vue";
import { useSavedSearchHelper } from "@/composables/useSavedSearchHelper";
import type { FilterInList } from "@/composables/useFilterHelper";
import { useQuery } from "@vue/apollo-composable";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { GetAdvancedFiltersDocument } from "@/generated-types/queries";
import { useFilterSideBarHelperNew } from "@/composables/useFilterSideBarHelperNew";
import type { FilterInput } from "@/generated-types/queries";
const props = defineProps<{
  advancedFiltersChoice: {
    type: string;
    default: "entityFilters";
  };
  acceptedEntityTypes: string[];
}>();

const componentMap: any = {
  checklist: checklist,
  tekst: tekst,
  minmax: minmax,
  multiselect: multiselect,
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
