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
      v-for="(filter, i) in filters.advancedFilters"
      :key="filter.key"
      class="filters w-full lg:h-1770"
    >
      <FilterAccordion>
        <template #title>
          <Label :color="neutral - 0" class="text-neutral-900" :name="filter.label" />
        </template>
        <template #content>
          <TextFilter
            v-if="filter.type === 'tekst'"
            v-model:inputValue="initialFilters[i]"
            :filterkey="filter.key"
            :text="filter.label"
          />
          <ChecklistFilter
            v-if="filter.type === 'checklist'"
            v-model:listValue="initialFilters[i]"
            :filterkey="filter.key"
          />
          <MinmaxFilter
            v-if="filter.type === 'minmax'"
            v-model:minmaxValue="initialFilters[i]"
            :filterkey="filter.key"
          />
          <MultiFilter
            v-if="filter.type === 'multiselect'"
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
  import Label from '@/components/base/Label.vue';

  export default defineComponent({
    name: 'FilterSideBar',
    components: {
      FilterAccordion,
      BaseButton,
      MinmaxFilter,
      TextFilter,
      ChecklistFilter,
      MultiFilter,
      Label,
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

      const { result: filters } = useQuery(GetAdvancedFiltersDocument);

      watch(initialFilters.value, () => {
        activeFilters.value = [];

        for (let i = 0; i < initialFilters.value.length; i++) {
          if (
            initialFilters.value[i] !== undefined &&
            initialFilters.value[i].value !== undefined
          ) {
            activeFilters.value.push(initialFilters.value[i]);
          }
        }
      });

      const applyFilters = () => {
        console.log('activeFilters.value');
        console.log(activeFilters.value);
        emit('update:activeFilters', activeFilters.value);
      };

      const clearFilters = () => {
        for (let i = 0; i < initialFilters.value.length; i++) {
          initialFilters.value[i] = {
            key: initialFilters.value[i].key,
            value: undefined,
          };
        }
      };

      return {
        filters,
        activeCount,
        applyFilters,
        initialFilters,
        clearFilters,
        AdvancedFilterTypes,
        activeFilters,
      };

      //je kan nu filters.advancedFilters gebruiken
    },
  });
</script>
