<template>
  <BaseInputAutocomplete
    v-model="input"
    :options="autocompleteOptions"
    :placeholder="t('filters.matcher-placeholders.ID')"
    autocomplete-style="default"
    @search-change="(value: string) => getAutocompleteOptions(value)"
  />
</template>

<script lang="ts" setup>
import type { FilterListItem } from "@/composables/useStateManagement";
import {
  AdvancedFilterTypes,
  GetFilterOptionsDocument,
  type AdvancedFilterInput,
  type DropdownOption,
  type GetFilterOptionsQuery,
  type GetFilterOptionsQueryVariables,
} from "@/generated-types/queries";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import { defineEmits, onMounted, ref, watch } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { useI18n } from "vue-i18n";

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

const { t } = useI18n();

const input = ref<DropdownOption[]>();
const force = ref<boolean>(false);

const refetchEnabled = ref<boolean>(false);
const queryVariables = ref<GetFilterOptionsQueryVariables>();
const { refetch, onResult } = useQuery<GetFilterOptionsQuery>(
  GetFilterOptionsDocument,
  queryVariables,
  () => ({ enabled: refetchEnabled.value })
);

const autocompleteOptions = ref<DropdownOption[]>([]);
const getAutocompleteOptions = (value: string) => {
  clearAutocompleteOptions();
  if (value.length < 3) return;

  if (
    props.filter.advancedFilter.type === AdvancedFilterTypes.Id &&
    props.filter.advancedFilter.advancedFilterInputForRetrievingOptions
  ) {
    queryVariables.value = {
      input: {
        type: props.filter.advancedFilter
          .advancedFilterInputForRetrievingOptions.type,
        parent_key:
          props.filter.advancedFilter.advancedFilterInputForRetrievingOptions
            .parent_key,
        key: props.filter.advancedFilter.advancedFilterInputForRetrievingOptions
          .key,
        value,
        metadata_key_as_label:
          props.filter.advancedFilter.advancedFilterInputForRetrievingOptions
            .metadata_key_as_label,
        item_types:
          props.filter.advancedFilter.advancedFilterInputForRetrievingOptions
            .item_types ?? [],
        provide_value_options_for_key: true,
      },
      limit: 999999,
    };
    if (
      props.filter.advancedFilter.advancedFilterInputForRetrievingOptions.lookup
    )
      queryVariables.value.input.lookup = {
        from: props.filter.advancedFilter
          .advancedFilterInputForRetrievingOptions.lookup.from,
        local_field:
          props.filter.advancedFilter.advancedFilterInputForRetrievingOptions
            .lookup.local_field,
        foreign_field:
          props.filter.advancedFilter.advancedFilterInputForRetrievingOptions
            .lookup.foreign_field,
        as: props.filter.advancedFilter.advancedFilterInputForRetrievingOptions
          .lookup.as,
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
  let autocompleteOption: DropdownOption | undefined = { label: "", value: "" };
  while (autocompleteOption !== undefined)
    autocompleteOption = autocompleteOptions.value.pop();
};

onMounted(() => {
  input.value = props.filter.inputFromState?.value || [];
  force.value = Boolean(props.filter.inputFromState);
});

watch(input, () => {
  const value = input.value
    ? Object.values(input.value).map((option) => option.value)
    : undefined;

  const newAdvancedFilterInput: AdvancedFilterInput = {
    type: props.filter.advancedFilter.type,
    parent_key: props.filter.advancedFilter.parentKey,
    key: props.filter.advancedFilter.key,
    value,
    match_exact: true,
  };
  if (props.filter.advancedFilter.lookup)
    newAdvancedFilterInput.lookup = {
      from: props.filter.advancedFilter.lookup.from,
      local_field: props.filter.advancedFilter.lookup.local_field,
      foreign_field: props.filter.advancedFilter.lookup.foreign_field,
      as: props.filter.advancedFilter.lookup.as,
    };
  emit("newAdvancedFilterInput", newAdvancedFilterInput, force.value);
  force.value = false;
});
</script>
