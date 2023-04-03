<template>
  <div
    class="lg:w-2/6 md:w-full lg:border-l-2 lg:border-r-2 border-solid border-neutral-50"
    v-on:keydown.enter="applyFilters"
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
          @click="clearFilters"
        />
        <BaseButtonNew
          button-style="default"
          :label="$t('filter.apply')"
          @click="applyFilters"
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
          <TextFilter
            v-if="filter?.type === AdvancedFilterTypes.Tekst"
            v-model:inputValue="initialFilters[i]"
            :filter="filter"
            :text="filter?.label"
          />
          <ChecklistFilter
            v-if="filter?.type === AdvancedFilterTypes.Checklist"
            v-model:listValue="initialFilters[i]"
            :filter="filter"
            :accepted-entity-types="acceptedEntityTypes"
          />
          <MinmaxFilter
            v-if="filter?.type === AdvancedFilterTypes.Minmax"
            v-model:minmaxValue="initialFilters[i]"
            :filter="filter"
            :is-relation="filter.isRelation ? filter.isRelation : false"
          />
          <MultiFilter
            v-if="filter?.type === AdvancedFilterTypes.Multiselect"
            v-model:multiSelectValue="initialFilters[i]"
            :filter="filter"
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
import MinmaxFilter from "@/components/base/MinmaxFilter.vue";
import TextFilter from "@/components/base/TextFilter.vue";
import ChecklistFilter from "@/components/base/ChecklistFilter.vue";
import MultiFilter from "@/components/base/MultiFilter.vue";
import { useSavedSearchHelper } from "@/composables/useSavedSearchHelper";
import { FilterInList } from "@/composables/useFilterHelper";
import { useQuery } from "@vue/apollo-composable";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import {
  AdvancedFilterTypes,
  GetAdvancedFiltersDocument,
} from "@/generated-types/queries";
import { useFilterSideBarHelperNew } from "@/composables/useFilterSideBarHelperNew";

const props = defineProps<{
  advancedFiltersChoice: {
    type: string;
    default: "entityFilters";
  };
  acceptedEntityTypes: string[];
}>();

const { pickedSavedSearch, clearTypename, setPickedSavedSearch } =
  useSavedSearchHelper();

const { clearInitialFilters, initialFilters, activeCount } =
  useFilterSideBarHelperNew();

const emit = defineEmits<{
  (event: "activeFilters", initialFilters: FilterInList[]);
}>();

const { result: filters } = useQuery(GetAdvancedFiltersDocument, {
  choice: props.advancedFiltersChoice,
});

const applyFilters = () => {
  const returnArray = initialFilters.value.map((filter: FilterInList) => {
    filter = JSON.parse(JSON.stringify(filter));
    clearTypename(filter.input);
    if (filter.input) filter.input["__typename"] = undefined;
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
