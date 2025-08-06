<template>
  <component
    :is="activeFilterComponent"
    ref="exactFilterComponentRef"
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
import SelectionFilter from "./exactMatcher/ExactSelectionFilter.vue";
import BooleanFilter from "./exactMatcher/BooleanFilter.vue";

const props = defineProps({
  filter: { type: Object, required: true },
  lastTypedValue: { type: String, default: "" },
});

defineEmits(["updateValue", "filterOptions", "newInputValue"]);

const exactFilterComponentRef = ref();

const activeFilterComponent = computed(() => {
  switch (props.filter.advancedFilter.type) {
    case AdvancedFilterTypes.Boolean:
      return BooleanFilter;
    case AdvancedFilterTypes.Selection:
      return SelectionFilter;
    default:
      return InputFilter;
  }
});

const reset = () => {
  if (exactFilterComponentRef.value) {
    exactFilterComponentRef?.value?.reset();
  }
};

defineExpose({
  reset,
});
</script>
