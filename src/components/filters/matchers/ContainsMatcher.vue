<template>
  <BaseInputTextNumberDatetime
    v-model="input"
    input-style="default"
    type="text"
    :placeholder="t('filters.matcher-placeholders.keyword')"
  />
</template>

<script lang="ts" setup>
import type {
  AdvancedFilter,
  AdvancedFilterInput,
} from "@/generated-types/queries";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import { defineEmits, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  filter: AdvancedFilter;
}>();

const emit = defineEmits<{
  (
    event: "newAdvancedFilterInput",
    advancedFilterInput: AdvancedFilterInput
  ): void;
}>();

const { t } = useI18n();

const input = ref<string | number>("");

watch(input, () => {
  const newAdvancedFilterInput: AdvancedFilterInput = {
    type: props.filter.type,
    parent_key: props.filter.parentKey,
    key: props.filter.key,
    value: input.value ? input.value : undefined,
    match_exact: false,
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

<style></style>
