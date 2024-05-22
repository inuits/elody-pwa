<template>
  <div
    class="grow"
    v-if="
      filter.advancedFilter.type !== AdvancedFilterTypes.Selection &&
      !Array.isArray(input)
    "
  >
    <BaseInputTextNumberDatetime
      v-model="input"
      input-style="default"
      :type="determineInputType"
      :placeholder="determinePlaceholder"
    />
  </div>
  <div v-else class="grow">
    <div
      v-if="useAutocomplete && (Array.isArray(input) || input === undefined)"
    >
      <BaseInputAutocomplete
        v-model="input"
        :options="autocompleteOptions"
        autocomplete-style="default"
        :placeholder="determinePlaceholder"
        :noOptionsText="dropdownNoOptionsText"
        @search-change="(value: string) => getAutocompleteOptions(value)"
      />
    </div>
    <div v-else>
      <div v-if="showSpinner" class="flex items-center justify-center">
        <spinner-loader />
      </div>
      <div v-else>
        <BaseInputCheckbox
          v-for="filterOption in filterOptions"
          v-model="filterOption.isSelected"
          :key="filterOption.option.value"
          :class="{ 'mb-2': filterOption.isSelected }"
          :label="filterOption.option.label"
          :item="{ id: filterOption.option.value }"
          :bulk-operations-context="BulkOperationsContextEnum.FilterOptions"
          input-style="accentNormal"
          :ignore-bulk-operations="true"
        />
      </div>
    </div>
  </div>
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
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";
import { computed, defineEmits, onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useQuery } from "@vue/apollo-composable";

const props = defineProps<{
  filter: FilterListItem;
  relatedActiveFilters: string[];
}>();

const emit = defineEmits<{
  (
    event: "newAdvancedFilterInput",
    advancedFilterInput: AdvancedFilterInput,
    force: boolean
  ): void;
  (event: "filterOptions", filterOptions: string[]): void;
}>();

const { t } = useI18n();

const input = ref<string | number | DropdownOption[]>();
const dropdownInputLength = ref<number>(0);
const dropdownNoOptionsText = computed(() =>
  dropdownInputLength.value < 3
    ? t("filters.minDropdownSearchCharacters")
    : undefined
);
const force = ref<boolean>(false);
const showSpinner = ref<boolean>(false);

const refetchFilterOptionsEnabled = ref<boolean>(false);
const filterOptionsQueryVariables = ref<GetFilterOptionsQueryVariables>();
const { refetch: refetchFilterOptions, onResult: onFilterOptionsResult } =
  useQuery<GetFilterOptionsQuery>(
    GetFilterOptionsDocument,
    filterOptionsQueryVariables,
    () => ({
      enabled: refetchFilterOptionsEnabled.value,
      fetchPolicy: "no-cache",
    })
  );

const filterOptions = reactive<
  { isSelected: boolean; option: DropdownOption }[]
>([]);
onFilterOptionsResult((result) => {
  const options = result.data?.FilterOptions;
  if (options) {
    input.value = [];
    options.forEach((option) =>
      filterOptions.push({ isSelected: false, option })
    );
    emit(
      "filterOptions",
      filterOptions.map((filterOption) => filterOption.option.value)
    );
    showSpinner.value = false;
  }
});

const refetchAutocompleteOptionsEnabled = ref<boolean>(false);
const autocompleteOptionsQueryVariables = ref<GetFilterOptionsQueryVariables>();
const {
  refetch: refetchAutocompleteOptions,
  onResult: onAutocompleteOptionsResult,
} = useQuery<GetFilterOptionsQuery>(
  GetFilterOptionsDocument,
  autocompleteOptionsQueryVariables,
  () => ({
    enabled: refetchAutocompleteOptionsEnabled.value,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "no-cache",
  })
);

const autocompleteOptions = ref<DropdownOption[]>([]);
const getAutocompleteOptions = (value: string) => {
  clearAutocompleteOptions();
  dropdownInputLength.value = value.length;
  if (value.length < 3) return;

  if (
    props.filter.advancedFilter.type === AdvancedFilterTypes.Selection &&
    props.filter.advancedFilter.advancedFilterInputForRetrievingOptions
  ) {
    autocompleteOptionsQueryVariables.value = {
      input: {
        lookup:
          props.filter.advancedFilter.advancedFilterInputForRetrievingOptions
            .lookup,
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
      autocompleteOptionsQueryVariables.value.input.lookup = {
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

    refetchAutocompleteOptionsEnabled.value = true;
    refetchAutocompleteOptions();
  }
};
onAutocompleteOptionsResult((result) => {
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

const useAutocomplete = computed<boolean>(
  () => filterOptions.length > 10 || filterOptions.length === 0
);
const determineInputType = computed<"text" | "number" | "datetime-local">(
  () => {
    if (props.filter.advancedFilter.type === AdvancedFilterTypes.Number)
      return "number";
    if (props.filter.advancedFilter.type === AdvancedFilterTypes.Date)
      return "datetime-local";
    return "text";
  }
);
const determinePlaceholder = computed(() => {
  if (props.filter.advancedFilter.type === AdvancedFilterTypes.Number)
    return t("filters.matcher-placeholders.number");
  if (props.filter.advancedFilter.type === AdvancedFilterTypes.Date)
    return t("filters.matcher-placeholders.date");
  return t("filters.matcher-placeholders.keyword");
});

onMounted(() => {
  if (
    props.filter.advancedFilter.type === AdvancedFilterTypes.Selection &&
    props.filter.advancedFilter.advancedFilterInputForRetrievingOptions
  ) {
    showSpinner.value = true;
    filterOptionsQueryVariables.value = {
      input: {
        type: props.filter.advancedFilter
          .advancedFilterInputForRetrievingOptions.type,
        parent_key:
          props.filter.advancedFilter.advancedFilterInputForRetrievingOptions
            .parent_key,
        key: props.filter.advancedFilter.advancedFilterInputForRetrievingOptions
          .key,
        value:
          props.filter.advancedFilter.advancedFilterInputForRetrievingOptions
            .value,
        metadata_key_as_label:
          props.filter.advancedFilter.advancedFilterInputForRetrievingOptions
            .metadata_key_as_label,
        item_types:
          props.filter.advancedFilter.advancedFilterInputForRetrievingOptions
            .item_types ?? [],
        provide_value_options_for_key: true,
      },
      limit: 11,
    };
    if (
      props.filter.advancedFilter.advancedFilterInputForRetrievingOptions.lookup
    )
      filterOptionsQueryVariables.value.input.lookup = {
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

    refetchFilterOptionsEnabled.value = true;
    refetchFilterOptions();
  }

  input.value = props.filter.inputFromState?.value;
  force.value = Boolean(props.filter.inputFromState);
});

watch(
  () => props.relatedActiveFilters,
  () => {
    if (!props.relatedActiveFilters) return;
    filterOptions.filter((filter) => {
      filter.isSelected = props.relatedActiveFilters.includes(
        filter.option.value
      );
    });
  }
);

watch(
  filterOptions,
  () =>
    (input.value = filterOptions
      .filter((filterOption) => filterOption.isSelected)
      .map((filterOption) => filterOption.option))
);
watch(input, () => {
  let value;
  if (Array.isArray(input.value))
    if (useAutocomplete.value)
      value = Object.values(input.value).map((option) => option.value);
    else
      value =
        input.value.length > 0
          ? input.value.map((filterOption) => filterOption.value)
          : [];
  else value = input.value ? input.value : undefined;

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
