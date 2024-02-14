<template>
  <BaseInputTextNumberDatetime
    disabled
    input-style="default"
    type="text"
    :model-value="''"
  />
</template>

<script lang="ts" setup>
import type { AdvancedFilterInput } from "@/generated-types/queries";
import type { FilterListItem } from "@/composables/useStateManagement";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import { defineEmits, onBeforeUnmount, onMounted, ref } from "vue";

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

const force = ref<boolean>(false);

onMounted(() => {
  force.value = Boolean(props.filter.inputFromState);

  const newAdvancedFilterInput: AdvancedFilterInput = {
    type: props.filter.advancedFilter.type,
    parent_key: props.filter.advancedFilter.parentKey,
    key: props.filter.advancedFilter.key,
    value: "",
  };
  if (props.filter.advancedFilter.lookup)
    newAdvancedFilterInput.lookup = {
      from: props.filter.advancedFilter.lookup.from,
      local_field: props.filter.advancedFilter.lookup.local_field,
      foreign_field: props.filter.advancedFilter.lookup.foreign_field,
      as: props.filter.advancedFilter.lookup.as,
    };
  emit("newAdvancedFilterInput", newAdvancedFilterInput, force.value);
});

onBeforeUnmount(() => {
  const newAdvancedFilterInput: AdvancedFilterInput = {
    type: props.filter.advancedFilter.type,
    parent_key: props.filter.advancedFilter.parentKey,
    key: props.filter.advancedFilter.key,
    value: undefined,
  };
  if (props.filter.advancedFilter.lookup)
    newAdvancedFilterInput.lookup = {
      from: props.filter.advancedFilter.lookup.from,
      local_field: props.filter.advancedFilter.lookup.local_field,
      foreign_field: props.filter.advancedFilter.lookup.foreign_field,
      as: props.filter.advancedFilter.lookup.as,
    };
  emit("newAdvancedFilterInput", newAdvancedFilterInput, false);
});
</script>

<style></style>
