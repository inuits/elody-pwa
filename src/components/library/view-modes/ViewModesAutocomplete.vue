<template>
  <base-input-autocomplete
    autocomplete-style="defaultWithBorder"
    :options="options"
    ta
    :select-type="selectType"
    :model-value="selectedDropdownOptions"
    @update:model-value="
            (value) => {
              replaceRelationsFromSameType(
                mapDropdownOptionsToBulkProcessableItem([...value]),
                relationType as string,
              );
              selectedDropdownOptions = [...value];
            }
          "
  />
</template>

<script lang="ts" setup>
import {
  AdvancedFilterTypes,
  type BaseEntity,
  DamsIcons,
  type DropdownOption,
  type Entitytyping,
  SearchInputType,
} from "@/generated-types/queries";
import { computed, onMounted, ref, watch } from "vue";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { apolloClient } from "@/main";
import type { ApolloClient } from "@apollo/client/core";
import { getEntityTitle } from "@/helpers";
import { useFormHelper } from "@/composables/useFormHelper";
import { useGetDropdownOptions } from "@/composables/useGetDropdownOptions";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";

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

const selectedDropdownOptions = ref<DropdownOption[]>([]);
const { replaceRelationsFromSameType } = useFormHelper();
const { initialize, options } = useGetDropdownOptions(
  props.metadataKeyToGetOptionsFor as Entitytyping,
  "fetchAll"
);

onMounted(async () => {
  await initialize();
});

const dropdownValue = computed<string[]>(() => {
  if (!props.modelValue) return [];
  if (typeof props.modelValue === "string") return [props.modelValue];
  return props.modelValue;
});

const mapDropdownOptionsToBulkProcessableItem = (
  dropdownOptions: DropdownOption[]
): InBulkProcessableItem[] => {
  const inBulkProcessableItems: InBulkProcessableItem[] = [];
  dropdownOptions.forEach((dropdownOption: DropdownOption) => {
    inBulkProcessableItems.push({
      id: dropdownOption.value,
      value: dropdownOption.label,
    });
  });
  return inBulkProcessableItems;
};
</script>

<style></style>
