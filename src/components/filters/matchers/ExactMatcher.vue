<template>
  <div
    class="grow"
    v-if="
      (filter.advancedFilter.type !== AdvancedFilterTypes.Selection &&
        !Array.isArray(input)) ||
      filter.advancedFilter.type === AdvancedFilterTypes.Boolean
    "
  >
    <div
      v-if="
        Array.isArray(determineInputType) && determineInputType?.length === 2
      "
    >
      <BaseInputTextNumberDatetime
        class="mb-2"
        v-model="input"
        input-style="default"
        :type="determineInputType[0]"
        :placeholder="determinePlaceholder"
      />
      <BaseInputTextNumberDatetime
        v-if="filter.advancedFilter.showTimeForDateFilter"
        v-model="inputTime"
        input-style="default"
        :type="determineInputType[1]"
        :placeholder="determinePlaceholder"
      />
    </div>
    <div v-else>
      <BaseInputTextNumberDatetime
        v-if="filter.advancedFilter.type !== AdvancedFilterTypes.Boolean"
        v-model="input"
        input-style="default"
        :type="determineInputType"
        :placeholder="determinePlaceholder"
      />
      <div
        v-if="filter.advancedFilter.type === AdvancedFilterTypes.Boolean"
        class="flex gap-2"
      >
        <BaseInputCheckbox
          v-for="(filterOption, idx) in booleanFilterOptions"
          v-model="filterOption.isSelected"
          :disabled="input?.length === 1 && filterOption.value !== input?.[0]"
          :key="idx"
          :label="String(filterOption.value)"
          :bulkOperationsContext="BulkOperationsContextEnum.FilterOptions"
          input-style="accentNormal"
          :ignore-bulk-operations="true"
        />
      </div>
    </div>
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
          :bulkOperationsContext="BulkOperationsContextEnum.FilterOptions"
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
  AutocompleteSelectionOptions,
  GetFilterOptionsDocument,
  type AdvancedFilterInput,
  type AdvancedFilterInputType,
  type DropdownOption,
  type GetFilterOptionsQuery,
  type GetFilterOptionsQueryVariables,
  type LookupInput,
} from "@/generated-types/queries";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import {
  addCurrentTimeZoneToDateTimeString,
  extractDate,
  extractTime,
  isDateTime,
} from "@/helpers";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";
import { computed, defineEmits, onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useQuery } from "@vue/apollo-composable";
import { useRoute } from "vue-router";

const props = withDefaults(
  defineProps<{
    filter: FilterListItem;
    relatedActiveFilter: string[];
    lastTypedValue: string;
  }>(),
  {
    relatedActiveFilter: () => [],
    lastTypedValue: "",
  },
);

const emit = defineEmits<{
  (
    event: "newAdvancedFilterInput",
    advancedFilterInput: AdvancedFilterInput,
    force: boolean,
  ): void;
  (event: "filterOptions", filterOptions: string[]): void;
  (event: "newInputValue", input: string | number): void;
}>();

const route = useRoute();
const { t } = useI18n();

const input = ref<string | number | DropdownOption[] | boolean[]>();
const inputTime = ref<number | string | undefined>(undefined);
const totalInput = computed(() =>
  inputTime.value ? `${input.value}T${inputTime.value}` : input.value,
);

const dropdownInputLength = ref<number>(0);
const dropdownNoOptionsText = computed(() =>
  dropdownInputLength.value < 3
    ? t("filters.minDropdownSearchCharacters")
    : undefined,
);
const force = ref<boolean>(false);
const showSpinner = ref<boolean>(false);

const mapOptionsFilterInput = (
  advancedFilterInputForRetrievingOptions: AdvancedFilterInputType[],
  value?: any,
) => {
  const optionsFilterInput: AdvancedFilterInput[] = [];
  for (const filterInput of advancedFilterInputForRetrievingOptions) {
    const lookup: LookupInput = {
      from: filterInput.lookup?.from || "",
      local_field: filterInput.lookup?.local_field || "",
      foreign_field: filterInput.lookup?.foreign_field || "",
      as: filterInput.lookup?.as || "",
    };
    optionsFilterInput.push({
      lookup: filterInput.lookup ? lookup : undefined,
      type: filterInput.type,
      key: filterInput.key,
      value: value
        ? filterInput.value === "*"
          ? value
          : filterInput.value
        : filterInput.value,
      metadata_key_as_label: filterInput.metadata_key_as_label,
      item_types: filterInput.item_types ?? [],
      provide_value_options_for_key:
        filterInput.type !== AdvancedFilterTypes.Type,
    });
  }
  return optionsFilterInput;
};

const refetchFilterOptionsEnabled = ref<boolean>(false);
const filterOptionsQueryVariables = ref<GetFilterOptionsQueryVariables>();
const { refetch: refetchFilterOptions, onResult: onFilterOptionsResult } =
  useQuery<GetFilterOptionsQuery>(
    GetFilterOptionsDocument,
    filterOptionsQueryVariables,
    () => ({
      enabled: refetchFilterOptionsEnabled.value,
      fetchPolicy: "no-cache",
    }),
  );

const booleanFilterOptions = reactive<
  { isSelected: boolean; value: boolean }[]
>([
  { isSelected: false, value: true },
  { isSelected: false, value: false },
]);

const filterOptions = reactive<
  { isSelected: boolean; option: DropdownOption }[]
>([]);
onFilterOptionsResult((result) => {
  const options = result.data?.FilterOptions;
  if (options) {
    input.value = [];
    options.forEach((option) => {
      const isSelected =
        props.relatedActiveFilter &&
        props.relatedActiveFilter?.value?.includes(option.value);
      filterOptions.push({ isSelected: isSelected, option });
    });
    emit(
      "filterOptions",
      filterOptions.map((filterOption) => filterOption.option.value),
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
  }),
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
      input: mapOptionsFilterInput(
        props.filter.advancedFilter.advancedFilterInputForRetrievingOptions,
        value,
      ),
      limit: 999999,
      entityType: route.meta.entityType as string,
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

const useAutocomplete = computed<boolean>(() => {
  if (
    props.filter.advancedFilter.selectionOption ===
    AutocompleteSelectionOptions.Autocomplete
  )
    return true;
  if (
    props.filter.advancedFilter.selectionOption ===
    AutocompleteSelectionOptions.Checkboxlist
  )
    return false;
  return filterOptions.length > 10 || filterOptions.length === 0;
});
const determineInputType = computed<"text" | "number" | ["date", "time"]>(
  () => {
    if (props.filter.advancedFilter.type === AdvancedFilterTypes.Number)
      return "number";
    if (props.filter.advancedFilter.type === AdvancedFilterTypes.Date)
      return ["date", "time"];
    return "text";
  },
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
      input: mapOptionsFilterInput(
        props.filter.advancedFilter.advancedFilterInputForRetrievingOptions,
      ),
      limit: 11,
      entityType: route.meta.entityType as string,
    };

    refetchFilterOptionsEnabled.value = true;
    refetchFilterOptions();
  }

  input.value =
    props.filter.advancedFilter.type === "date"
      ? extractDate(props.filter.inputFromState?.value)
      : props.filter.inputFromState?.value;
  inputTime.value =
    props.filter.advancedFilter.type === "date"
      ? extractTime(props.filter.inputFromState?.value)
      : undefined;
  force.value = Boolean(props.filter.inputFromState);

  if (props.filter.advancedFilter.type === AdvancedFilterTypes.Boolean) {
    booleanFilterOptions.forEach((option) => {
      option.isSelected =
        Array.isArray(input.value) && input.value.includes(option.value);
    });
  }

  if (props.filter.advancedFilter.type !== "date" && props.lastTypedValue) {
    input.value = props.lastTypedValue;
    force.value = true;
    emitNewAdvancedFilterInput();
  }
});

watch(
  () => props.relatedActiveFilter,
  async () => {
    if (props.relatedActiveFilter) {
      filterOptions.forEach((option) => {
        let isSelected = props.relatedActiveFilter?.value?.includes(
          option.option.value,
        );
        option.isSelected = isSelected;
      });
      return;
    }
    filterOptions.filter((filter) => {
      filter.isSelected = false;
    });
  },
  { immediate: true, deep: true },
);

watch(
  filterOptions,
  () =>
    (input.value = filterOptions
      .filter((filterOption) => filterOption.isSelected)
      .map((filterOption) => filterOption.option)),
);

watch(
  booleanFilterOptions,
  () =>
    (input.value = booleanFilterOptions
      .filter((filterOption) => filterOption.isSelected)
      .map((filterOption) => filterOption.value)),
);

const emitNewAdvancedFilterInput = () => {
  let value;
  if (Array.isArray(input.value))
    if (useAutocomplete.value)
      value = Object.values(input.value).map((option) => option.value);
    else
      value =
        input.value.length > 0
          ? input.value.map((filterOption) => filterOption.value)
          : [];
  else
    value = totalInput.value
      ? isDateTime(totalInput.value)
        ? addCurrentTimeZoneToDateTimeString(totalInput.value)
        : totalInput.value
      : undefined;

  if (props.filter.advancedFilter.type === AdvancedFilterTypes.Boolean) {
    value = Array.isArray(input.value) && input.value[0];
  }

  const newAdvancedFilterInput: AdvancedFilterInput = {
    type: props.filter.advancedFilter.type,
    parent_key: props.filter.advancedFilter.parentKey,
    key: props.filter.advancedFilter.key,
    value,
    match_exact: true,
    aggregation: props.filter.advancedFilter.aggregation,
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
};

watch(input, () => {
  if (typeof input.value === "string") {
    emit("newInputValue", input.value);
  }

  emitNewAdvancedFilterInput();
});
watch(inputTime, () => emitNewAdvancedFilterInput());
</script>
