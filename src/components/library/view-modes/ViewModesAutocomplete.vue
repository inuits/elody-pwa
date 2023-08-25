<template>
  <BaseInputAutocomplete
    v-model="inputValue"
    :options="autocompleteOptions"
    :select-type="selectType"
    :label="label"
    autocomplete-style="defaultWithBorder"
    @search-change="(value: string) => getAutocompleteOptions(value)"
  />
</template>

<script lang="ts" setup>
import {
  AdvancedFilterTypes,
  GetFilterOptionsDocument,
  type GetFilterOptionsQuery,
  type GetFilterOptionsQueryVariables,
} from "@/generated-types/queries";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import { computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";

const props = withDefaults(
  defineProps<{
    modelValue: string[] | string | undefined;
    metadataKeyToGetOptionsFor: string;
    selectType?: "multi" | "single";
    label?: string;
  }>(),
  {
    selectType: "multi",
    label: "",
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: string[] | string | undefined): void;
}>();

const inputValue = computed<string[] | undefined>({
  get() {
    if (typeof props.modelValue === "string") return [props.modelValue];
    return props.modelValue;
  },
  set(value) {
    if (typeof props.modelValue === "string")
      emit("update:modelValue", value?.[0]);
    emit("update:modelValue", value);
  },
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

const autocompleteOptions = ref<string[]>([]);
const getAutocompleteOptions = (value: string) => {
  clearAutocompleteOptions();
  if (value.length < 3) return;

  autocompleteOptionsQueryVariables.value = {
    input: {
      type: AdvancedFilterTypes.Text,
      key: props.metadataKeyToGetOptionsFor,
      value,
      provide_value_options_for_key: true,
    },
    limit: 999999,
  };

  refetchAutocompleteOptionsEnabled.value = true;
  refetchAutocompleteOptions();
};
onAutocompleteOptionsResult((result) => {
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
</script>

<style></style>
