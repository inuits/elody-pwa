<template>
  <SelectionFilter
    ref="filterComponentRef"
    :filter="filter"
    :last-typed-value="lastTypedValue"
    @update-value="$emit('updateValue', $event)"
    @filter-options="$emit('filterOptions', $event)"
    @new-input-value="$emit('newInputValue', $event)"
  />
</template>

<script lang="ts" setup>
import { ref } from "vue";
import SelectionFilter from "./exactMatcher/ExactSelectionFilter.vue";

defineProps({
  filter: { type: Object, required: true },
  lastTypedValue: { type: String, default: "" },
});

defineEmits(["updateValue", "filterOptions", "newInputValue"]);

const filterComponentRef = ref();

const reset = () => {
  filterComponentRef.value?.reset();
};

defineExpose({ reset });
</script>
