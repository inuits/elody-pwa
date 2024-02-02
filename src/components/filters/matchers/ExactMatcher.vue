<template>
  <div
    class="grow"
    v-if="
      filter.type !== AdvancedFilterTypes.Selection && !Array.isArray(input)
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
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  AdvancedFilterTypes,
  GetFilterOptionsDocument,
  type AdvancedFilter,
  type AdvancedFilterInput,
  type DropdownOption,
  type GetFilterOptionsQuery,
  type GetFilterOptionsQueryVariables,
} from "@/generated-types/queries";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";
import { computed, defineEmits, onMounted, reactive, ref, watch } from "vue";
import { useQuery } from "@vue/apollo-composable";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  filter: AdvancedFilter;
}>();

const emit = defineEmits<{
  (
    event: "newAdvancedFilterInput",
    advancedFilterInput: AdvancedFilterInput
  ): void;
  (event: "filterOptions", filterOptions: string[]): void;
}>();

const { t } = useI18n();

const input = ref<string | number | DropdownOption[]>();
const showSpinner = ref<boolean>(false);

const refetchFilterOptionsEnabled = ref<boolean>(false);
const filterOptionsQueryVariables = ref<GetFilterOptionsQueryVariables>();
const { refetch: refetchFilterOptions, onResult: onFilterOptionsResult } =
  useQuery<GetFilterOptionsQuery>(
    GetFilterOptionsDocument,
    filterOptionsQueryVariables,
    () => ({ enabled: refetchFilterOptionsEnabled.value })
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
  if (value.length < 3) return;

  if (
    props.filter.type === AdvancedFilterTypes.Selection &&
    props.filter.advancedFilterInputForRetrievingOptions
  ) {
    autocompleteOptionsQueryVariables.value = {
      input: {
        lookup: props.filter.advancedFilterInputForRetrievingOptions.lookup,
        type: props.filter.advancedFilterInputForRetrievingOptions.type,
        parent_key:
          props.filter.advancedFilterInputForRetrievingOptions.parent_key,
        key: props.filter.advancedFilterInputForRetrievingOptions.key,
        value,
        metadata_key_as_label:
          props.filter.advancedFilterInputForRetrievingOptions
            .metadata_key_as_label,
        item_types:
          props.filter.advancedFilterInputForRetrievingOptions.item_types ?? [],
        provide_value_options_for_key: true,
      },
      limit: 999999,
    };
    if (props.filter.advancedFilterInputForRetrievingOptions.lookup)
      autocompleteOptionsQueryVariables.value.input.lookup = {
        from: props.filter.advancedFilterInputForRetrievingOptions.lookup.from,
        local_field:
          props.filter.advancedFilterInputForRetrievingOptions.lookup
            .local_field,
        foreign_field:
          props.filter.advancedFilterInputForRetrievingOptions.lookup
            .foreign_field,
        as: props.filter.advancedFilterInputForRetrievingOptions.lookup.as,
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
    if (props.filter.type === AdvancedFilterTypes.Number) return "number";
    if (props.filter.type === AdvancedFilterTypes.Date) return "datetime-local";
    return "text";
  }
);
const determinePlaceholder = computed(() => {
  if (props.filter.type === AdvancedFilterTypes.Number)
    return t("filters.matcher-placeholders.number");
  if (props.filter.type === AdvancedFilterTypes.Date)
    return t("filters.matcher-placeholders.date");
  return t("filters.matcher-placeholders.keyword");
});

onMounted(() => {
  if (
    props.filter.type === AdvancedFilterTypes.Selection &&
    props.filter.advancedFilterInputForRetrievingOptions
  ) {
    showSpinner.value = true;
    filterOptionsQueryVariables.value = {
      input: {
        type: props.filter.advancedFilterInputForRetrievingOptions.type,
        parent_key:
          props.filter.advancedFilterInputForRetrievingOptions.parent_key,
        key: props.filter.advancedFilterInputForRetrievingOptions.key,
        value: props.filter.advancedFilterInputForRetrievingOptions.value,
        metadata_key_as_label:
          props.filter.advancedFilterInputForRetrievingOptions
            .metadata_key_as_label,
        item_types:
          props.filter.advancedFilterInputForRetrievingOptions.item_types ?? [],
        provide_value_options_for_key: true,
      },
      limit: 11,
    };
    if (props.filter.advancedFilterInputForRetrievingOptions.lookup)
      filterOptionsQueryVariables.value.input.lookup = {
        from: props.filter.advancedFilterInputForRetrievingOptions.lookup.from,
        local_field:
          props.filter.advancedFilterInputForRetrievingOptions.lookup
            .local_field,
        foreign_field:
          props.filter.advancedFilterInputForRetrievingOptions.lookup
            .foreign_field,
        as: props.filter.advancedFilterInputForRetrievingOptions.lookup.as,
      };

    refetchFilterOptionsEnabled.value = true;
    refetchFilterOptions();
  }
});

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
    type: props.filter.type,
    parent_key: props.filter.parentKey,
    key: props.filter.key,
    value,
    match_exact: true,
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
