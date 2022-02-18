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
        <BaseButton
          bg-color="blue-50"
          bg-hover-color="blue-75"
          label="Clear All"
          txt-color="blue-300"
          :disabled="activeCount == 0"
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
      v-for="(filter, i) in result.advancedFilters"
      :key="filter.key"
      class="filters w-full lg:h-1770"
    >
      <FilterAccordion :actief="filterValues[i] === undefined ? true : false">
        <template #title>{{
          filter.label.charAt(0).toUpperCase() + filter.label.slice(1)
        }}</template>
        <template #content>
          <TextFilter
            v-if="filter.type === 'tekst'"
            v-model:inputValue="filterValues[i]"
            :filterkey="filter.key"
            :text="filter.label"
          />
          <ChecklistFilter
            v-if="filter.type === 'checklist'"
            v-model:listValue="filterValues[i]"
            :filterkey="filter.key"
          />
          <MinmaxFilter
            v-if="filter.type === 'minmax'"
            v-model:minmaxValue="filterValues[i]"
            :filterkey="filter.key"
          />
        </template>
      </FilterAccordion>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, watch, ref } from 'vue';
  import FilterAccordion from '@/components/base/FilterAccordion.vue';
  import { useQuery } from '@vue/apollo-composable';
  import { AdvancedFilterTypes, GetAdvancedFiltersDocument } from '@/queries';
  import gql from 'graphql-tag';
  import BaseButton from '@/components/base/BaseButton.vue';
  import MinmaxFilter from '@/components/base/MinmaxFilter.vue';
  import TextFilter from '@/components/base/TextFilter.vue';
  import ChecklistFilter from '@/components/base/ChecklistFilter.vue';

  export default defineComponent({
    name: 'FilterSideBar',
    components: {
      FilterAccordion,
      BaseButton,
      MinmaxFilter,
      TextFilter,
      ChecklistFilter,
    },
    setup() {
      const { result } = useQuery(gql`
        query getAdvancedFilters {
          advancedFilters {
            label
            type
            key
          }
        }
      `);

      const filterValues = ref<Array<object | undefined>>([]);
      const filterObjects = ref<Array<object | undefined>>([]);
      const activeCount = ref<number>(0);
      const andorbool = ref<boolean>(false);

      watch(filterValues.value, () => {
        filterObjects.value = [];

        for (let i = 0; i < filterValues.value.length; i++) {
          if (filterValues.value[i] != undefined) {
            filterObjects.value.push(filterValues.value[i]);
          }
        }

        activeCount.value = filterObjects.value.length;
      });

      const applyFilters = () => {
        console.log(filterObjects.value);
      };

      const clearFilters = () => {
        for (let i = 0; i < filterValues.value.length; i++) {
          filterValues.value[i] = undefined;
        }
      };

      return { result, activeCount, applyFilters, filterValues, clearFilters };

      //je kan nu result.advancedFilters gebruiken
    },
  });
</script>
