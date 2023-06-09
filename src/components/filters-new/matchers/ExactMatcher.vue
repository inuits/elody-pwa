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
    <BaseInputCheckbox
      v-for="option in filterOptions"
      :key="option.key"
      :class="{ 'mb-2': option.isSelected }"
      v-model="option.isSelected"
      :label="option.key"
      :item="{ id: option.key }"
      :bulk-operations-context="BulkOperationsContextEnum.FilterOptions"
      input-style="accentNormal"
    />
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
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import BaseInputTextNumber from "@/components/base/BaseInputTextNumber.vue";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";
import { defineEmits, onMounted, reactive, ref, watch } from "vue";
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

const input = ref<string | number | string[]>("");
const refetchEnabled = ref<boolean>(false);
const queryVariables = ref<GetFilterOptionsQueryVariables>();
const { refetch, onResult } = useQuery<GetFilterOptionsQuery>(
  GetFilterOptionsDocument,
  queryVariables,
  () => ({ enabled: refetchEnabled.value })
);
const filterOptions = reactive<{ isSelected: boolean; key: string }[]>([]);

onResult((result) => {
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

onMounted(() => {
  if (
    props.filter.type === AdvancedFilterTypes.Selection &&
    props.filter.advancedFilterInputForRetrievingOptions
  ) {
    queryVariables.value = {
      input: {
        type: props.filter.advancedFilterInputForRetrievingOptions.type,
        key: props.filter.advancedFilterInputForRetrievingOptions.key,
        value: props.filter.advancedFilterInputForRetrievingOptions.value,
        provide_value_options_for_key:
          props.filter.advancedFilterInputForRetrievingOptions
            .provide_value_options_for_key,
      },
    };
    refetchEnabled.value = true;
    refetch();
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
    value = input.value.length > 0 ? input.value : [];
  else value = input.value ? input.value : undefined;

  emit("newAdvancedFilterInput", {
    type: props.filter.type,
    key: props.filter.key,
    value,
    match_exact: true,
  });
});
</script>

<style></style>
