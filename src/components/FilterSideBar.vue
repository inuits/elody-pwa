<template>
  <div
    class="lg:w-2/6 md:w-full lg:border-l-2 lg:border-r-2 border-solid border-neutral-50"
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
            {{ pickedSavedSearch.metadata[0].value }}
          </p>

          <saved-searches :initialFilters="initialFilters" />
        </div>
      </div>
      <div
        class="flex justify-between border-solid border-b-2 border-neutral-50 px-3 pb-3"
      >
        <!-- <AndOrToggle v-model:AndOrValue="AndOrChoice" texton="En" textoff="Of" /> -->
        <BaseButton
          bg-color="blue-50"
          bg-hover-color="blue-75"
          :label="$t('filter.clear')"
          txt-color="blue-300"
          class="disabled:cursor-not-allowed disabled:opacity-50"
          @click="clearFilters"
        />
        <BaseButton
          bg-color="blue-400"
          bg-hover-color="blue-300"
          txt-color="neutral-0"
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
        :label="filter?.label"
      >
        <template #content>
          <TextFilter
            v-if="filter?.type === AdvancedFilterTypes.Tekst"
            v-model:inputValue="initialFilters[i]"
            :filterkey="filter?.key"
            :text="filter?.label"
          />
          <ChecklistFilter
            v-if="filter?.type === AdvancedFilterTypes.Checklist"
            v-model:listValue="initialFilters[i]"
            :filterkey="filter?.key"
            :accepted-entity-types="acceptedEntityTypes"
          />
          <MinmaxFilter
            v-if="filter?.type === AdvancedFilterTypes.Minmax"
            v-model:minmaxValue="initialFilters[i]"
            :filterkey="filter?.key"
            :is-relation="filter?.isRelation"
          />
          <!-- {{initialFilters[i]}} -->
          <MultiFilter
            v-if="filter?.type === AdvancedFilterTypes.Multiselect"
            v-model:multiSelectValue="initialFilters[i]"
            :filterkey="filter?.key"
          />
        </template>
      </FilterAccordion>
    </div>
    <!-- <pre>
      {{initialFilters}}
    </pre> -->
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from "vue";
import type { PropType } from "vue";
import FilterAccordion from "@/components/base/FilterAccordion.vue";
import { useQuery } from "@vue/apollo-composable";
import { AdvancedFilterTypes, GetAdvancedFiltersDocument } from "@/queries";
import BaseButton from "@/components/base/BaseButton.vue";
import MinmaxFilter from "@/components/base/MinmaxFilter.vue";
import TextFilter from "@/components/base/TextFilter.vue";
import ChecklistFilter from "@/components/base/ChecklistFilter.vue";
import MultiFilter from "@/components/base/MultiFilter.vue";
import { Unicons } from "@/types";
import SavedSearches from "@/components/SavedSearches.vue";
// import AndOrToggle from './base/AndOrToggle.vue';
import { useSavedSearchHelper } from "../composables/useSavedSearchHelper";

import {
  clearAdvancedSearchInput,
  getActiveFilters,
} from "@/composables/useFilterHelper";
import type { FilterInList } from "@/composables/useFilterHelper";

export default defineComponent({
  name: "FilterSideBar",
  components: {
    FilterAccordion,
    BaseButton,
    MinmaxFilter,
    TextFilter,
    ChecklistFilter,
    MultiFilter,
    SavedSearches,
    // AndOrToggle,
  },
  props: {
    advancedFiltersChoice: {
      type: String,
      default: "entityFilters",
    },
    acceptedEntityTypes: {
      type: Array as PropType<string[]>,
      default: () => [],
      required: false,
    },
  },
  emits: ["activeFilters"],
  setup(props, { emit }) {
    const initialFilters = ref<FilterInList[]>([]);
    const activeCount = computed(
      () => getActiveFilters(initialFilters.value).length
    );
    const AndOrChoice = ref<boolean>(true);
    const { result: filters } = useQuery(GetAdvancedFiltersDocument, {
      choice: props.advancedFiltersChoice,
    });

    const applyFilters = () => {
      const returnArray = initialFilters.value.map((filter: FilterInList) => {
        if (filter.input.minMaxInput)
          filter.input.minMaxInput["__typename"] = undefined;
        if (filter.input.multiSelectInput)
          filter.input.multiSelectInput["__typename"] = undefined;
        if (filter.input.textInput)
          filter.input.textInput["__typename"] = undefined;
        if (filter.input) filter.input["__typename"] = undefined;
        return filter.input;
      });
      emit("activeFilters", returnArray);
    };

    const clearFilters = () => {
      initialFilters.value = clearAdvancedSearchInput(
        initialFilters.value,
        props.acceptedEntityTypes
      );
      pickedSavedSearch.value = undefined;
    };

    applyFilters();

    onMounted(() => {
      if (props.acceptedEntityTypes.length > 0) {
        applyFilters();
      }
    });

    const { pickedSavedSearch } = useSavedSearchHelper();

    watch(
      () => pickedSavedSearch.value,
      () => {
        if (pickedSavedSearch.value) {
          pickedSavedSearch.value.definition.forEach((filter) => {
            initialFilters.value.forEach((inFilter) => {
              console.log(filter.key, inFilter.input.key);
              if (filter.key === inFilter.input.key) {
                inFilter.input = filter;
                inFilter.isActive = true;
              }
            });
          });
        }
      }
    );

    return {
      filters,
      activeCount,
      applyFilters,
      initialFilters,
      clearFilters,
      AdvancedFilterTypes,
      AndOrChoice,
      Unicons,
      pickedSavedSearch,
    };
  },
});
</script>
