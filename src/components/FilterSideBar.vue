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
      <FilterAccordion>
        <template #title>{{
          filter.label.charAt(0).toUpperCase() + filter.label.slice(1)
        }}</template>
        <template #content>
          <TextFilter
            v-if="filter.type === 'tekst'"
            v-model:inputValue="selectedFilters[i]"
            :text="filter.label"
          />
          <ChecklistFilter v-if="filter.type === 'checklist'" :options="filter.options" />
          <MinmaxFilter
            v-if="filter.type === 'minmax'"
            v-model:minmaxValue="selectedFilters[i]"
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

      watch(result, (value) => {
        console.log(result.value);
      });

      const selectedFilters = ref([]);
      const filterObjects = ref<object[]>([]);
      const activeCount = selectedFilters.value.length;

      const applyFilters = () => {
        filterObjects.value = [];

        for (let i = 0; i < selectedFilters.value.length; i++) {
          if (selectedFilters.value[i] != undefined && selectedFilters.value[i] != '') {
            filterObjects.value.push({
              key: result.value.advancedFilters[i].key,
              value: selectedFilters.value[i],
            });
          }
        }
        
        console.log(filterObjects.value);
      };

      const clearFilters = () => {
        selectedFilters.value = [];
      };

      return { result, activeCount, applyFilters, selectedFilters, clearFilters };

      //je kan nu result.advancedFilters gebruiken
    },
  });
</script>
