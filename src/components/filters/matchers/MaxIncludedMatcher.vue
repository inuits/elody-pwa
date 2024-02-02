<template>
  <BaseInputTextNumberDatetime
    v-model="input"
    input-style="default"
    :type="determineInputType"
    :placeholder="determinePlaceholder"
  />
</template>

<script lang="ts" setup>
import {
  AdvancedFilterTypes,
  type AdvancedFilter,
  type AdvancedFilterInput,
} from "@/generated-types/queries";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import { computed, defineEmits, ref, watch } from "vue";
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

const input = ref<number | string>();
const determineInputType = computed<"number" | "datetime-local">(() => {
  if (props.filter.type === AdvancedFilterTypes.Date) return "datetime-local";
  return "number";
});
const determinePlaceholder = computed(() => {
  if (props.filter.type === AdvancedFilterTypes.Number)
    return t("filters.matcher-placeholders.number");
  return t("filters.matcher-placeholders.date");
});

watch(input, () => {
  const newAdvancedFilterInput: AdvancedFilterInput = {
    type: props.filter.type,
    parent_key: props.filter.parentKey,
    key: props.filter.key,
    value: {
      max: input.value,
      included: true,
    },
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
