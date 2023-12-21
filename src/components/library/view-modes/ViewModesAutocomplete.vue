<template>
  <BaseLibrary
    bulk-operations-context=""
    :list-item-route-name="getEntityIdFromRoute() as string"
    :filter-type="metadataKeyToGetOptionsFor as Entitytyping"
    :select-input-field-type="selectType"
    :relation-type="relationType"
    :select-input-field-value="dropdownValue"
  ></BaseLibrary>
</template>

<script lang="ts" setup>
import { type DropdownOption, Entitytyping } from "@/generated-types/queries";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import { getEntityIdFromRoute } from "@/helpers";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: string[] | string | undefined;
    metadataKeyToGetOptionsFor?: string | "no-key";
    selectType?: "multi" | "single";
    dropdownOptions: DropdownOption[];
    relationType: string;
  }>(),
  {
    selectType: "multi",
    label: "",
    metadataKeyToGetOptionsFor: "no-key",
  }
);

const dropdownValue = computed<string[]>(() => {
  if (!props.modelValue) return [];
  if (typeof props.modelValue === "string") return [props.modelValue];
  return props.modelValue;
});
</script>

<style></style>
