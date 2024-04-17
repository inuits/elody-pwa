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
import { defineEmits, onMounted, onUpdated, ref, watch } from "vue";
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

const input = ref<string | number>();
const force = ref<boolean>(false);

const setVariablesFromInput = () => {
  input.value = props.filter.inputFromState?.value || "";
  force.value = Boolean(props.filter.inputFromState);
}
onMounted(() => {
  setVariablesFromInput();
});
onUpdated(() => {
  setVariablesFromInput();
});

watch(input, () => {
  const newAdvancedFilterInput: AdvancedFilterInput = {
    type: props.filter.advancedFilter.type,
    parent_key: props.filter.advancedFilter.parentKey,
    key: props.filter.advancedFilter.key,
    value: input.value ? input.value : undefined,
    match_exact: false,
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

<style></style>
