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
        <AndOrToggle v-model:AndOrValue="EnOfKeuze" texton="En" textoff="Of" />
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
      v-for="(filter, i) in filters?.advancedFilters"
      :key="filter.key"
      class="filters w-full lg:h-1770"
    >
      <FilterAccordion
        :active="
          initialFilters[i]
            ? typeof initialFilters[i].value != 'object'
              ? initialFilters[i].value != undefined
                ? true
                : false
              : typeof initialFilters[i].value == 'object'
              ? Array.isArray(initialFilters[i].value)
                ? initialFilters[i].value.length > 0
                  ? true
                  : false
                : (initialFilters[i].value.min != undefined &&
                    initialFilters[i].value.min !== 0) ||
                  (initialFilters[i].value.max != undefined &&
                    initialFilters[i].value.max !== 0)
                ? true
                : false
              : false
            : undefined
        "
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
          />
          <MinmaxFilter
            v-if="filter.type === AdvancedFilterTypes.Minmax"
            v-model:minmaxValue="initialFilters[i]"
            :filterkey="filter.key"
          />
          <MultiFilter
            v-if="filter.type === AdvancedFilterTypes.Multiselect"
            v-model:MultiselectValue="initialFilters[i]"
            :filterkey="filter.key"
          />
        </template>
      </FilterAccordion>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, watch, ref, computed } from 'vue';
  import FilterAccordion from '@/components/base/FilterAccordion.vue';
  import { useQuery } from '@vue/apollo-composable';
  import { AdvancedFilterTypes, GetAdvancedFiltersDocument } from '@/queries';
  import BaseButton from '@/components/base/BaseButton.vue';
  import MinmaxFilter from '@/components/base/MinmaxFilter.vue';
  import TextFilter from '@/components/base/TextFilter.vue';
  import ChecklistFilter from '@/components/base/ChecklistFilter.vue';
  import MultiFilter from '@/components/base/MultiFilter.vue';
  import AndOrToggle from './base/AndOrToggle.vue';
  import { AdvancedSearchInput, AdvancedInputType } from '@/queries';

  export default defineComponent({
    name: 'FilterSideBar',
    components: {
      FilterAccordion,
      BaseButton,
      MinmaxFilter,
      TextFilter,
      ChecklistFilter,
      MultiFilter,
      AndOrToggle,
    },

    emits: ['update:activeFilters'],
    setup(props, { emit }) {
      type filterObject = {
        key: string;
        value: object | string | string[] | undefined;
      };

      const initialFilters = ref<filterObject[]>([]);
      const activeFilters = ref<filterObject[]>([]);
      const activeCount = computed(() => activeFilters.value.length);
      const EnOfKeuze = ref<boolean>(true);

      const { result: filters } = useQuery(GetAdvancedFiltersDocument);

      watch(initialFilters.value, () => {
        activeFilters.value = [];

        initialFilters.value.forEach((initialFilter) => {
          if (Array.isArray(initialFilter.value)) {
            //IS VALUE EEN ARRAY
            initialFilter.value.length > 0 //IS ARRAY LANGER ALS 0
              ? activeFilters.value.push(initialFilter)
              : null; // NIKS
          } else if (initialFilter.value != undefined) {
            activeFilters.value.push(initialFilter);
          }
        });
      });

      const applyFilters = () => {
        emit('update:activeFilters', activeFilters.value);
      };

      const clearFilters = () => {
        activeFilters.value = [];
        initialFilters.value.forEach((e) => {
          typeof e.value == 'string'
            ? (e.value = undefined)
            : typeof e.value == 'object'
            ? Array.isArray(e.value)
              ? (e.value = undefined)
              : (e.value = { min: undefined, max: undefined })
            : null;
        });
      };

      return {
        filters,
        activeCount,
        applyFilters,
        initialFilters,
        clearFilters,
        AdvancedFilterTypes,
        activeFilters,
        EnOfKeuze,
      };

      //je kan nu filters.advancedFilters gebruiken
    },
  });
</script>
