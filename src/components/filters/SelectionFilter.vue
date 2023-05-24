<template>
  <component :is="componentMap[checkIfOptionsMoreThan10()]" :filter="filter" />
</template>

<script lang="ts" setup>
import ChecklistOptions from "@/components/filters/ChecklistOptions.vue";
import AutocompleteOptions from "@/components/filters/AutoCompleteOptions.vue";
import type { AdvancedFilter } from "@/composables/useFilterHelper";

const props = defineProps<{
  filter: AdvancedFilter;
}>();

const componentMap: any = {
  selection: AutocompleteOptions,
  checklist: ChecklistOptions,
};

const checkIfOptionsMoreThan10 = (): string => {
  if (props.filter.options?.length > 10) {
    return "selection";
  }
  return "checklist";
};
</script>

<style></style>
