<template>
  <BaseInputAutocomplete
    v-model="input"
    :options="autocompleteOptions"
    autocomplete-style="default"
    @search-change="(value: string) => getAutocompleteOptions(value)"
  />
</template>

<script lang="ts" setup>
import {
  AdvancedFilterTypes,
  GetFilterOptionsDocument,
  type AdvancedFilter,
  type AdvancedFilterInput,
  type GetFilterOptionsQuery,
  type GetFilterOptionsQueryVariables,
} from "@/generated-types/queries";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import { defineEmits, ref, watch } from "vue";
import { useQuery } from "@vue/apollo-composable";

const props = defineProps<{
  filter: AdvancedFilter;
}>();

const emit = defineEmits<{
  (
    event: "newAdvancedFilterInput",
    advancedFilterInput: AdvancedFilterInput
  ): void;
}>();

const input = ref<string[]>([]);

const refetchEnabled = ref<boolean>(false);
const queryVariables = ref<GetFilterOptionsQueryVariables>();
const { refetch, onResult } = useQuery<GetFilterOptionsQuery>(
  GetFilterOptionsDocument,
  queryVariables,
  () => ({ enabled: refetchEnabled.value })
);

const autocompleteOptions = ref<string[]>([]);
const getAutocompleteOptions = (value: string) => {
  clearAutocompleteOptions();
  if (value.length < 3) return;

  if (
    props.filter.type === AdvancedFilterTypes.Id &&
    props.filter.advancedFilterInputForRetrievingOptions
  ) {
    queryVariables.value = {
      input: {
        type: props.filter.advancedFilterInputForRetrievingOptions.type,
        parent_key:
          props.filter.advancedFilterInputForRetrievingOptions.parent_key,
        key: props.filter.advancedFilterInputForRetrievingOptions.key,
        value,
        item_types:
          props.filter.advancedFilterInputForRetrievingOptions.item_types ?? [],
        provide_value_options_for_key: true,
      },
      limit: 999999,
    };

    refetchEnabled.value = true;
    refetch();
  }
};
onResult((result) => {
  clearAutocompleteOptions();
  let options = result.data?.FilterOptions;
  if (!options) options = [];
  autocompleteOptions.value.push(...options);
});

const clearAutocompleteOptions = () => {
  let autocompleteOption: string | undefined = "";
  while (autocompleteOption !== undefined)
    autocompleteOption = autocompleteOptions.value.pop();
};

watch(input, () => {
  const value = input.value ? Object.values(input.value) : undefined;

  emit("newAdvancedFilterInput", {
    type: props.filter.type,
    parent_key: props.filter.parentKey,
    key: props.filter.key,
    value,
    match_exact: true,
  });
});
</script>
