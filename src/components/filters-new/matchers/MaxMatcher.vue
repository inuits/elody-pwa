<template>
  <BaseInputTextNumberDatetime
    v-model="input"
    input-style="default"
    :type="determineInputType"
  />
</template>

<script lang="ts" setup>
import {
  AdvancedFilterTypes,
  type AdvancedFilter,
  type AdvancedFilterInput,
} from "@/generated-types/queries";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import { computed, defineEmits, ref, watch } from "vue";

const props = defineProps<{
  filter: AdvancedFilter;
}>();

const emit = defineEmits<{
  (
    event: "newAdvancedFilterInput",
    advancedFilterInput: AdvancedFilterInput
  ): void;
}>();

const input = ref<number | string>();
const determineInputType = computed<"number" | "datetime-local">(() => {
  if (props.filter.type === AdvancedFilterTypes.Date) return "datetime-local";
  return "number";
});

watch(input, () =>
  emit("newAdvancedFilterInput", {
    type: props.filter.type,
    key: props.filter.key,
    value: {
      max: input.value,
      included: false,
    },
  })
);
</script>
