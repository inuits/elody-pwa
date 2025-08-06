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
import { onMounted, ref, watch } from "vue";
import BaseRangeSlider from "@/components/base/BaseRangeSlider.vue";

const props = defineProps<{
  filter: FilterListItem;
}>();

const emit = defineEmits<{
  (event: "updateValue", value: { min: number; max: number }): void;
}>();

const min = ref<number>(0);
const max = ref<number>(0);

const from = ref<number>(0);
const to = ref<number>(0);
const force = ref<boolean>(false);
const unit = ref<string | undefined>(props.filter.advancedFilter?.unit);

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

watch([from, to], () => {
  emit("updateValue", {
    min: from.value,
    max: to.value,
  });
});

const reset = () => {
  from.value = 0;
  to.value = 0;
};

defineExpose({
  reset,
});
</script>
