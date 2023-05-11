<template>
  <component :is="componentMap[checkIfOptionsMoreThan10()]" :filter="filter" />
</template>

<script lang="ts" setup>
import ChecklistFilterNew from "@/components/filters/ChecklistFilterNew.vue";
import MultiFilterNew from "@/components/filters/MultiFilterNew.vue";
import type { AdvancedFilter } from "@/composables/useFilterHelper";

const props = defineProps<{
  filter: AdvancedFilter;
}>();

const componentMap: any = {
  selection: MultiFilterNew,
  checklist: ChecklistFilterNew,
};

const checkIfOptionsMoreThan10 = (): string => {
  if (props.filter.options?.length > 10) {
    return "selection";
  }
  return "checklist";
};
</script>

<style></style>
