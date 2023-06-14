<template>
  <div
    v-if="
      filter.type !== AdvancedFilterTypes.Selection && !Array.isArray(input)
    "
  >
    <BaseInputTextNumber
      v-model="input"
      input-style="default"
      :type="filter.type === AdvancedFilterTypes.Number ? 'number' : 'text'"
    />
  </div>
  <div v-else>
    <div
      v-if="useAutocomplete && (Array.isArray(input) || input === undefined)"
    >
      <BaseInputAutocomplete
        v-model="input"
        :options="autocompleteOptions"
        @search-change="(value: string) => getAutocompleteOptions(value)"
      />
    </div>
    <div v-else>
      <BaseInputCheckbox
        v-for="option in filterOptions"
        v-model="option.isSelected"
        :key="option.key"
        :class="{ 'mb-2': option.isSelected }"
        :label="option.key"
        :item="{ id: option.key }"
        :bulk-operations-context="BulkOperationsContextEnum.FilterOptions"
        input-style="accentNormal"
      />
    </div>
  </div>
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
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import BaseInputTextNumber from "@/components/base/BaseInputTextNumber.vue";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";
import { computed, defineEmits, onMounted, reactive, ref, watch } from "vue";
import { useQuery } from "@vue/apollo-composable";

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

const input = ref<string | number | string[]>();

const refetchFilterOptionsEnabled = ref<boolean>(false);
const filterOptionsQueryVariables = ref<GetFilterOptionsQueryVariables>();
const { refetch: refetchFilterOptions, onResult: onFilterOptionsResult } =
  useQuery<GetFilterOptionsQuery>(
    GetFilterOptionsDocument,
    filterOptionsQueryVariables,
    () => ({ enabled: refetchFilterOptionsEnabled.value })
  );

const filterOptions = reactive<{ isSelected: boolean; key: string }[]>([]);
onFilterOptionsResult((result) => {
  const options = result.data?.FilterOptions;
  if (options) {
    input.value = [];
    options.forEach((option) =>
      filterOptions.push({ isSelected: false, key: option })
    );
    emit(
      "filterOptions",
      filterOptions.map((option) => option.key)
    );
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
  () => ({ enabled: refetchAutocompleteOptionsEnabled.value })
);

const autocompleteOptions = ref<string[]>([]);
const getAutocompleteOptions = (value: string) => {
  clearAutocompleteOptions();
  if (value.length < 3) return;

  if (
    props.filter.type === AdvancedFilterTypes.Selection &&
    props.filter.advancedFilterInputForRetrievingOptions
  ) {
    autocompleteOptionsQueryVariables.value = {
      input: {
        type: props.filter.advancedFilterInputForRetrievingOptions.type,
        key: props.filter.advancedFilterInputForRetrievingOptions.key,
        value,
        provide_value_options_for_key:
          props.filter.advancedFilterInputForRetrievingOptions
            .provide_value_options_for_key,
      },
      limit: 999999,
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
  setTimeout(() => (refetchAutocompleteOptionsEnabled.value = false), 150);
});

const clearAutocompleteOptions = () => {
  let autocompleteOption: string | undefined = "";
  while (autocompleteOption !== undefined)
    autocompleteOption = autocompleteOptions.value.pop();
};

const useAutocomplete = computed<boolean>(() => filterOptions.length > 10);

onMounted(() => {
  if (
    props.filter.type === AdvancedFilterTypes.Selection &&
    props.filter.advancedFilterInputForRetrievingOptions
  ) {
    filterOptionsQueryVariables.value = {
      input: {
        type: props.filter.advancedFilterInputForRetrievingOptions.type,
        key: props.filter.advancedFilterInputForRetrievingOptions.key,
        value: props.filter.advancedFilterInputForRetrievingOptions.value,
        provide_value_options_for_key:
          props.filter.advancedFilterInputForRetrievingOptions
            .provide_value_options_for_key,
      },
      limit: 11,
    };

    refetchFilterOptionsEnabled.value = true;
    refetchFilterOptions();
  }
});

watch(
  filterOptions,
  () =>
    (input.value = filterOptions
      .filter((option) => option.isSelected)
      .map((option) => option.key))
);
watch(input, () => {
  let value;
  if (Array.isArray(input.value))
    if (useAutocomplete.value) value = Object.values(input.value);
    else value = input.value.length > 0 ? input.value : [];
  else value = input.value ? input.value : undefined;

  emit("newAdvancedFilterInput", {
    type: props.filter.type,
    key: props.filter.key,
    value,
    match_exact: true,
  });
});
</script>
