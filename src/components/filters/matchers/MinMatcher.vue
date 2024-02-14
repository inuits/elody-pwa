<template>
  <BaseInputTextNumberDatetime
    v-model="input"
    input-style="default"
    :type="determineInputType"
    :placeholder="determinePlaceholder"
  />
</template>

<script lang="ts" setup>
import type { FilterListItem } from "@/composables/useStateManagement";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import {
  AdvancedFilterTypes,
  type AdvancedFilterInput,
} from "@/generated-types/queries";
import { computed, defineEmits, onMounted, ref, watch } from "vue";
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

const input = ref<number | string>();
const force = ref<boolean>(false);
const determineInputType = computed<"number" | "datetime-local">(() => {
  if (props.filter.advancedFilter.type === AdvancedFilterTypes.Date)
    return "datetime-local";
  return "number";
});
const determinePlaceholder = computed(() => {
  if (props.filter.advancedFilter.type === AdvancedFilterTypes.Number)
    return t("filters.matcher-placeholders.number");
  return t("filters.matcher-placeholders.date");
});

onMounted(() => {
  input.value = props.filter.inputFromState?.value;
  force.value = Boolean(props.filter.inputFromState);
});

watch(input, () => {
  const newAdvancedFilterInput: AdvancedFilterInput = {
    type: props.filter.advancedFilter.type,
    parent_key: props.filter.advancedFilter.parentKey,
    key: props.filter.advancedFilter.key,
    value: {
      min: input.value,
      included: false,
    },
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
