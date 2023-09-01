<template>
  <BaseInputTextNumberDatetime
    v-model="input"
    input-style="default"
    type="text"
  />
</template>

<script lang="ts" setup>
import type {
  AdvancedFilter,
  AdvancedFilterInput,
} from "@/generated-types/queries";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
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
    parent_key: props.filter.parentKey,
    key: props.filter.key,
    value: input.value ? input.value : undefined,
    match_exact: false,
  })
);
</script>

<style></style>
