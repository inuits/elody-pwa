<template>
  <div
    v-if="Array.isArray(determineInputType) && determineInputType?.length === 2"
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
      v-model="input"
      input-style="default"
      :type="determineInputType"
      :placeholder="determinePlaceholder"
    />
  </div>
</template>

<script lang="ts" setup>
import type { FilterListItem } from "@/composables/useStateManagement";
import {
  AdvancedFilterTypes,
  type AdvancedFilterInput,
} from "@/generated-types/queries";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import {
  addCurrentTimeZoneToDateTimeString,
  extractDate,
  extractTime,
  isDateTime,
} from "@/helpers";
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
const inputTime = ref<number | string | undefined>(undefined);
const totalInput = computed(() =>
  inputTime.value ? `${input.value}T${inputTime.value}` : input.value
);

const force = ref<boolean>(false);
const determineInputType = computed<"number" | ["date", "time"]>(() => {
  if (props.filter.advancedFilter.type === AdvancedFilterTypes.Date)
    return ["date", "time"];
  return "number";
});
const determinePlaceholder = computed(() => {
  if (props.filter.advancedFilter.type === AdvancedFilterTypes.Number)
    return t("filters.matcher-placeholders.number");
  return t("filters.matcher-placeholders.date");
});

onMounted(() => {
  input.value = extractDate(props.filter.inputFromState?.value?.min);
  inputTime.value = extractTime(props.filter.inputFromState?.value?.min);
  force.value = Boolean(props.filter.inputFromState);
  force.value = Boolean(props.filter.inputFromState);
});

const emitNewAdvancedFilterInput = () => {
  const newAdvancedFilterInput: AdvancedFilterInput = {
    type: props.filter.advancedFilter.type,
    parent_key: props.filter.advancedFilter.parentKey,
    key: props.filter.advancedFilter.key,
    value: {
      min: isDateTime(totalInput.value)
        ? addCurrentTimeZoneToDateTimeString(totalInput.value)
        : totalInput.value,
      included: false,
    },
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

watch(input, () => emitNewAdvancedFilterInput());
watch(inputTime, () => emitNewAdvancedFilterInput());
</script>
