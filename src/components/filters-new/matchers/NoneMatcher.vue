<template></template>

<script lang="ts" setup>
import type {
  AdvancedFilter,
  AdvancedFilterInput,
} from "@/generated-types/queries";
import { defineEmits, onBeforeUnmount, onMounted } from "vue";

const props = defineProps<{
  filter: AdvancedFilter;
}>();

const emit = defineEmits<{
  (
    event: "newAdvancedFilterInput",
    advancedFilterInput: AdvancedFilterInput
  ): void;
}>();

onMounted(() =>
  emit("newAdvancedFilterInput", {
    type: props.filter.type,
    key: props.filter.key,
    value: "",
  })
);

onBeforeUnmount(() =>
  emit("newAdvancedFilterInput", {
    type: props.filter.type,
    key: props.filter.key,
    value: undefined,
  })
);
</script>

<style></style>
