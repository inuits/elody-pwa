<template>
  <component
    :is="activeFilterComponent"
    ref="filterComponentRef"
    :filter="filter"
    :last-typed-value="lastTypedValue"
    @update-value="$emit('updateValue', $event)"
    @filter-options="$emit('filterOptions', $event)"
    @new-input-value="$emit('newInputValue', $event)"
  />
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { AdvancedFilterTypes } from "@/generated-types/queries";
import InputFilter from "./exactMatcher/ExactFilterInput.vue";
import BooleanFilter from "./exactMatcher/BooleanFilter.vue";

const props = defineProps({
  filter: { type: Object, required: true },
  lastTypedValue: { type: String, default: "" },
});

defineEmits(["updateValue", "filterOptions", "newInputValue"]);

const filterComponentRef = ref();

const activeFilterComponent = computed(() => {
  if (props.filter.advancedFilter.type === AdvancedFilterTypes.Boolean) {
    return BooleanFilter;
  }
  return InputFilter;
});

const reset = () => {
  filterComponentRef.value?.reset();
};

defineExpose({ reset });
</script>
