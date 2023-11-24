<template>
  <BaseInputTextNumberDatetime
    disabled
    input-style="default"
    type="text"
    :model-value="''"
  />
</template>

<script lang="ts" setup>
import type {
  AdvancedFilter,
  AdvancedFilterInput,
} from "@/generated-types/queries";
import { defineEmits, onBeforeUnmount, onMounted } from "vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";

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
    parent_key: props.filter.parentKey,
    key: props.filter.key,
    value: "*",
  })
);

onBeforeUnmount(() =>
  emit("newAdvancedFilterInput", {
    type: props.filter.type,
    parent_key: props.filter.parentKey,
    key: props.filter.key,
    value: undefined,
  })
);
</script>

<style></style>
