<template>
  <div
    class="lg:w-2/6 md:w-full lg:border-l-2 lg:border-r-2 border-solid border-neutral-30"
  >
    <div>
      <div class="flex justify-between m-3">
        <p class="text-xl font-medium">Filter</p>
        <p class="bg-blue-50 text-blue-300 rounded-md px-2 py-1">
          {{ activeCount }} actief
        </p>
      </div>
      <div
        class="flex justify-between border-solid border-b-2 border-neutral-30 px-3 pb-3"
      >
        <!-- <AndOrToggle v-model:AndOrValue="AndOrChoice" texton="En" textoff="Of" /> -->
        <BaseButton
          bg-color="blue-50"
          bg-hover-color="blue-75"
          label="Clear All"
          txt-color="blue-300"
          class="disabled:cursor-not-allowed disabled:opacity-50"
          @click="clearFilters"
        />
        <BaseButton
          bg-color="blue-400"
          bg-hover-color="blue-300"
          txt-color="neutral-0"
          label="Apply Filter(s)"
          @click="applyFilters"
        />
      </div>
    </div>
    <div
      v-for="(filter, i) in filters?.advancedFilters"
      :key="filter.key"
      class="filters w-full lg:h-1770"
    >
      <FilterAccordion
        :active="initialFilters[i] && initialFilters[i].isActive"
        :label="filter.label"
      >
        <template #content>
          <TextFilter
            v-if="filter.type === AdvancedFilterTypes.Tekst"
            v-model:inputValue="initialFilters[i]"
            :filterkey="filter.key"
            :text="filter.label"
          />
          <ChecklistFilter
            v-if="filter.type === AdvancedFilterTypes.Checklist"
            v-model:listValue="initialFilters[i]"
            :filterkey="filter.key"
            :accepted-entity-types="acceptedEntityTypes"
          />
          <MinmaxFilter
            v-if="filter.type === AdvancedFilterTypes.Minmax"
            v-model:minmaxValue="initialFilters[i]"
            :filterkey="filter.key"
            :is-relation="filter.isRelation"
          />
          <MultiFilter
            v-if="filter.type === AdvancedFilterTypes.Multiselect"
            v-model:multiSelectValue="initialFilters[i]"
            :filterkey="filter.key"
          />
        </template>
      </FilterAccordion>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref, computed, PropType } from 'vue';
  import FilterAccordion from '@/components/base/FilterAccordion.vue';
  import { useQuery } from '@vue/apollo-composable';
  import { AdvancedFilterTypes, GetAdvancedFiltersDocument } from '@/queries';
  import BaseButton from '@/components/base/BaseButton.vue';
  import MinmaxFilter from '@/components/base/MinmaxFilter.vue';
  import TextFilter from '@/components/base/TextFilter.vue';
  import ChecklistFilter from '@/components/base/ChecklistFilter.vue';
  import MultiFilter from '@/components/base/MultiFilter.vue';
  // import AndOrToggle from './base/AndOrToggle.vue';
  import {
    clearAdvancedSearchInput,
    FilterInList,
    getActiveFilters,
  } from '@/composables/useFilterHelper';

  export default defineComponent({
    name: 'FilterSideBar',
    components: {
      FilterAccordion,
      BaseButton,
      MinmaxFilter,
      TextFilter,
      ChecklistFilter,
      MultiFilter,
      // AndOrToggle,
    },
    props: {
      advancedFiltersChoice: {
        type: String,
        default: 'entityFilters',
      },
      acceptedEntityTypes: {
        type: Array as PropType<string[]>,
        default: () => [],
        required: false,
      },
    },
    emits: ['activeFilters'],
    setup(props, { emit }) {
      const initialFilters = ref<FilterInList[]>([]);
      const activeCount = computed(() => getActiveFilters(initialFilters.value).length);
      const AndOrChoice = ref<boolean>(true);
      const { result: filters } = useQuery(GetAdvancedFiltersDocument, {
        choice: props.advancedFiltersChoice,
      });

      const applyFilters = () => {
        const returnArray = initialFilters.value.map((filter: FilterInList) => {
          return filter.input;
        });
        emit('activeFilters', returnArray);
      };

      const clearFilters = () => {
        initialFilters.value = clearAdvancedSearchInput(initialFilters.value);
      };

      applyFilters();

      return {
        filters,
        activeCount,
        applyFilters,
        initialFilters,
        clearFilters,
        AdvancedFilterTypes,
        AndOrChoice,
      };
    },
  });
</script>
