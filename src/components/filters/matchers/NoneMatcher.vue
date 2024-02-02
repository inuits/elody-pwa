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

onMounted(() => {
  const newAdvancedFilterInput: AdvancedFilterInput = {
    type: props.filter.type,
    parent_key: props.filter.parentKey,
    key: props.filter.key,
    value: "",
  };
  if (props.filter.lookup)
    newAdvancedFilterInput.lookup = {
      from: props.filter.lookup.from,
      local_field: props.filter.lookup.local_field,
      foreign_field: props.filter.lookup.foreign_field,
      as: props.filter.lookup.as,
    };
  emit("newAdvancedFilterInput", newAdvancedFilterInput);
});

onBeforeUnmount(() => {
  const newAdvancedFilterInput: AdvancedFilterInput = {
    type: props.filter.type,
    parent_key: props.filter.parentKey,
    key: props.filter.key,
    value: undefined,
  };
  if (props.filter.lookup)
    newAdvancedFilterInput.lookup = {
      from: props.filter.lookup.from,
      local_field: props.filter.lookup.local_field,
      foreign_field: props.filter.lookup.foreign_field,
      as: props.filter.lookup.as,
    };
  emit("newAdvancedFilterInput", newAdvancedFilterInput);
});
</script>

<style></style>
