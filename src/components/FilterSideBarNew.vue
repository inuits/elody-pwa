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
      v-for="(filter, i) in filters"
      :key="filter?.key"
      class="filters w-full lg:h-1770"
    >
      <FilterAccordionNew
        v-show="!filter.hidden"
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
  AdvancedInputType,
  Asset,
  type FilterInput,
  type GetAdvancedFiltersQuery,
} from "@/generated-types/queries";
import type { PredefinedEntities } from "@/components/base/BaseLibrary.vue";
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

const { clearInitialFilters, initialFilters, activeCount, clickedFilter } =
  useFilterSideBarHelperNew();

const emit = defineEmits<{
  (event: "activeFilters", initialFilters: FilterInput[]): void;
}>();

const filters = ref<any[]>([]);
const { onResult } = useQuery<GetAdvancedFiltersQuery>(
  GetAdvancedFiltersDocument,
  {
    entityType: props.advancedFiltersChoice,
  }
);
onResult((queryResult) => {
  if (queryResult.data.advancedFilters) {
    const returnArray: any[] = [];
    // Todo use object or key string names for filters
    let i: number = 0;
    Object.values(queryResult.data.advancedFilters).forEach((value) => {
      if (typeof value !== "string") {
        if (value && value.defaultValue && value?.type === "selection") {
          initialFilters.value[i] = {
            isActive: true,
            input: {
              key: value.key,
              type: AdvancedInputType.SelectionInput,
              multiSelectInput: { value: [value.defaultValue] },
            },
          };
        }
        returnArray.push(value);
        i++;
      }
    });
    filters.value = returnArray;
  }

  if (filters.value.length > 0) {
    applyFilters();
  }
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

// const queryVariables = reactive<GetEntitiesQueryVariables>({
//   limit: 20,
//   skip: 1,
//   searchValue: {
//     value: "",
//     isAsc: false,
//     order_by: "Title",
//   },
//   advancedSearchValue: [],
//   searchInputType: "AdvancedInputType" as SearchInputType,
// });

const predefinedEntities = ref<PredefinedEntities>({
  usePredefinedEntities: true,
  entities: [],
});

const entities = ref<Asset[]>(predefinedEntities.value?.entities || []);

// const { refetch, onResult, result } = useQuery(
//   GetEntitiesDocument,
//   queryVariables,
//   {
//     notifyOnNetworkStatusChange: true,
//   }
// );

watch(
  () => predefinedEntities?.value.entities,
  () => {
    if (predefinedEntities?.value.entities) {
      entities.value = predefinedEntities?.value.entities;
    }
  },
  { immediate: true }
);

// onResult((t) => {
//   if (
//     clickedFilter.value?.type === "selection" ||
//     clickedFilter.value?.type === "SelectionInput"
//   ) {
//     t.data?.Entities.results.forEach((e) => {
//       let titles = e.teaserMetadata.filter((f) => f.key === "title");
//       if (titles.length > 0) {
//         let title = titles[0];
//         clickedFilter.value = {
//           ...clickedFilter.value,
//           options: [{ value: title.label, label: title.value }],
//         };
//         queryVariables.advancedSearchValue = [
//           {
//             type: "SelectionInput",
//             key: "type",
//             selectionInput: {
//               value: [title.value],
//             },
//           },
//         ];
//         console.log("Clicked filter waarde : ", clickedFilter.value);
//         console.log("Dit is de queryVariable", queryVariables);
//       }
//     });
//   }
// });

// const getFilterOptionsWhenNoOptionsAvailable = (
//   advancedFilter: AdvancedFilter
// ) => {
//   clickedFilter.value = advancedFilter;
//   queryVariables.advancedSearchValue = [
//     {
//       type: "SelectionInput",
//       key: "type",
//       selectionInput: {
//         value: [advancedFilter.key],
//       },
//     },
//   ];
//   console.log("dit is vanuit de methode :", queryVariables.advancedSearchValue);
// };
</script>
<style></style>
