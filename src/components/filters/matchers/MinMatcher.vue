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

watch(input, () =>
  emit("newAdvancedFilterInput", {
    type: props.filter.type,
    parent_key: props.filter.parentKey,
    key: props.filter.key,
    value: {
      min: input.value,
      included: false,
    },
  })
);
</script>
