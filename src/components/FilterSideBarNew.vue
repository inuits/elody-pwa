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
      <FilterAccordionNew
        :active="initialFilters[i] && initialFilters[i].isActive"
        :label="filter?.label ? filter?.label : ''"
        @toggled="getFilterOptionsWhenNoOptionsAvailable(filter)"
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
      </FilterAccordionNew>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineEmits, defineProps, reactive, ref, watch } from "vue";
import SavedSearches from "@/components/SavedSearches.vue";
import FilterAccordionNew from "@/components/base/FilterAccordionNew.vue";
import TextFilter from "@/components/filters/TextFilterNew.vue";
import MinMaxFilter from "@/components/filters/MinmaxFilterNew.vue";
import { useSavedSearchHelper } from "@/composables/useSavedSearchHelper";
import type { FilterInList } from "@/composables/useFilterHelper";
import { useQuery } from "@vue/apollo-composable";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { GetAdvancedFiltersDocument } from "@/generated-types/queries";
import { useFilterSideBarHelperNew } from "@/composables/useFilterSideBarHelperNew";
import SelectionFilter from "@/components/filters/SelectionFilter.vue";
import {
  type AdvancedFilter,
  GetEntitiesDocument,
  type GetEntitiesQueryVariables,
  SearchInputType,
  type Asset,
  type FilterInput,
} from "../generated-types/queries";
import type { PredefinedEntities } from "./base/BaseLibrary.vue";
const props = defineProps<{
  advancedFiltersChoice?: "entityFilters";
  acceptedEntityTypes: string[];
}>();

const componentMap: any = {
  text: TextFilter,
  minmax: MinMaxFilter,
  selection: SelectionFilter,
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

const queryVariables = reactive<GetEntitiesQueryVariables>({
  limit: 20,
  skip: 1,
  searchValue: {
    value: "",
    isAsc: false,
    order_by: "Title",
  },
  advancedSearchValue: [],
  searchInputType: "AdvancedInputType" as SearchInputType,
});

const predefinedEntities = ref<PredefinedEntities>({
  usePredefinedEntities: true,
  entities: [],
});

const entities = ref<Asset[]>(predefinedEntities.value?.entities || []);

console.log("Dit zijn je entities", entities.value);

const { refetch } = useQuery(GetEntitiesDocument, queryVariables, {
  notifyOnNetworkStatusChange: true,
});

watch(
  () => predefinedEntities?.value.entities,
  () => {
    if (predefinedEntities?.value.entities) {
      entities.value = predefinedEntities?.value.entities;
    }
  },
  { immediate: true }
);

const getFilterOptionsWhenNoOptionsAvailable = (
  advancedFilter: AdvancedFilter
) => {
  queryVariables.advancedSearchValue = [
    {
      type: "MultiSelectInput",
      key: "type",
      multiSelectInput: {
        value: [advancedFilter.key],
      },
    },
  ];
};
</script>
<style></style>
