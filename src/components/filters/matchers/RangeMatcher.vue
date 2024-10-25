<template>
  <BaseRangeSlider
    :from="from"
    :to="to"
    :min="min"
    :max="max"
    :unit="unit"
    @updateRange="updateValues"
  />
</template>

<script lang="ts" setup>
import type { FilterListItem } from "@/composables/useStateManagement";
import { type AdvancedFilterInput } from "@/generated-types/queries";
import { onMounted, ref, watch } from "vue";
import BaseRangeSlider from "@/components/base/BaseRangeSlider.vue";

const props = defineProps<{
  filter: FilterListItem;
}>();

const emit = defineEmits<{
  (
    event: "newAdvancedFilterInput",
    advancedFilterInput: AdvancedFilterInput,
    force: boolean
  ): void;
}>();

const min = ref<number>(0);
const max = ref<number>(0);

const from = ref<number>(0);
const to = ref<number>(0);
const force = ref<boolean>(false);
const unit = ref<string | undefined>(props.filter.advancedFilter?.unit);

const emitNewAdvancedFilterInput = () => {
  if (from.value && to.value) {
    const newAdvancedFilterInput: AdvancedFilterInput = {
      type: props.filter.advancedFilter.type,
      parent_key: props.filter.advancedFilter.parentKey,
      key: props.filter.advancedFilter.key,
      value: {
        min: from.value,
        max: to.value,
      },
      aggregation: props.filter.advancedFilter.aggregation,
    };
    if (props.filter.advancedFilter.lookup)
      newAdvancedFilterInput.lookup = {
        from: props.filter.advancedFilter.lookup.from,
        local_field: props.filter.advancedFilter.lookup.local_field,
        foreign_field: props.filter.advancedFilter.lookup.foreign_field,
        as: props.filter.advancedFilter.lookup.as,
      };
    emit("newAdvancedFilterInput", newAdvancedFilterInput, force.value);
    force.value = false;
  }
};

const updateValues = (values: number[]) => {
  const [newFrom, newTo] = values;
  from.value = newFrom;
  to.value = newTo;
};

onMounted(() => {
  min.value = props.filter.advancedFilter?.min || 0;
  max.value = props.filter.advancedFilter?.max || 0;
  from.value = props.filter.inputFromState?.value?.min ?? min.value;
  to.value = props.filter.inputFromState?.value?.max ?? max.value;
  force.value = Boolean(props.filter.inputFromState);
});

watch(from, () => emitNewAdvancedFilterInput());
watch(to, () => emitNewAdvancedFilterInput());
</script>
