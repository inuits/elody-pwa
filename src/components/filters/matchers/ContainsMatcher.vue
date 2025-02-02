<template>
  <BaseInputTextNumberDatetime
    v-model="input"
    input-style="default"
    type="text"
    :placeholder="t('filters.matcher-placeholders.keyword')"
  />
</template>

<script lang="ts" setup>
import type { AdvancedFilterInput } from "@/generated-types/queries";
import type { FilterListItem } from "@/composables/useStateManagement";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import { defineEmits, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const props = withDefaults(
  defineProps<{
    filter: FilterListItem;
    relatedActiveFilter: string[];
    lastTypedValue: string | number;
  }>(),
  {
    relatedActiveFilter: () => [],
    lastTypedValue: "",
  }
);

const emit = defineEmits<{
  (
    event: "newAdvancedFilterInput",
    advancedFilterInput: AdvancedFilterInput,
    force: boolean
  ): void;
  (event: "newInputValue", inputValue: string | number): void;
}>();

const { t } = useI18n();

const input = ref<string | number>();
const force = ref<boolean>(false);

const setVariablesFromInput = () => {
  input.value = props.filter.inputFromState?.value || "";
  if (props.relatedActiveFilter) input.value = props.relatedActiveFilter?.value;
  force.value = Boolean(props.filter.inputFromState);
};

onMounted(() => {
  setVariablesFromInput();

  if (props.lastTypedValue) {
    input.value = props.lastTypedValue;
    force.value = true;
    emitNewAdvancedFilterInput();
  }
});

const emitNewAdvancedFilterInput = () => {
  const newAdvancedFilterInput: AdvancedFilterInput = {
    type: props.filter.advancedFilter.type,
    parent_key: props.filter.advancedFilter.parentKey,
    key: props.filter.advancedFilter.key,
    value: input.value ? input.value : undefined,
    match_exact: false,
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
  emitNewAdvancedFilterInput();

  if (typeof input.value !== "undefined") {
    emit("newInputValue", input.value);
  }
});
</script>

<style></style>
