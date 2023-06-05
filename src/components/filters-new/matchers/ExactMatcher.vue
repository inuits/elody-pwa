<template>
  <BaseInputTextNumber
    v-model="input"
    input-style="default"
    :type="filter.type === AdvancedFilterTypes.Number ? 'number' : 'text'"
  />
</template>

<script lang="ts" setup>
import BaseInputTextNumber from "@/components/base/BaseInputTextNumber.vue";
import {
  AdvancedFilterTypes,
  type AdvancedFilter,
  type AdvancedFilterInput,
} from "@/generated-types/queries";
import { defineEmits, ref, watch } from "vue";

const props = defineProps<{
  filter: AdvancedFilter;
}>();

const emit = defineEmits<{
  (
    event: "newAdvancedFilterInput",
    advancedFilterInput: AdvancedFilterInput
  ): void;
}>();

const input = ref<string | number>("");

watch(input, () =>
  emit("newAdvancedFilterInput", {
    type: props.filter.type,
    key: props.filter.key,
    value: input.value ? input.value : undefined,
    match_exact: true,
  })
);
</script>

<style></style>
