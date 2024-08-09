<template>
  <div>
    <span class="text-sm text-text-body">minimum</span>
    <div
      v-if="
        Array.isArray(determineInputType) && determineInputType?.length === 2
      "
    >
      <BaseInputTextNumberDatetime
        class="mb-2"
        v-model="min"
        input-style="default"
        :type="determineInputType[0]"
        :placeholder="determinePlaceholder"
      />
      <BaseInputTextNumberDatetime
        v-if="filter.advancedFilter.showTimeForDateFilter"
        v-model="minTime"
        input-style="default"
        :type="determineInputType[1]"
        :placeholder="determinePlaceholder"
      />
    </div>
    <div v-else>
      <BaseInputTextNumberDatetime
        v-model="min"
        input-style="default"
        :type="determineInputType"
        :placeholder="determinePlaceholder"
      />
    </div>
  </div>
  <div>
    <span class="text-sm text-text-body">maximum</span>
    <div
      v-if="
        Array.isArray(determineInputType) && determineInputType?.length === 2
      "
    >
      <BaseInputTextNumberDatetime
        class="mb-2"
        v-model="max"
        input-style="default"
        :type="determineInputType[0]"
        :placeholder="determinePlaceholder"
      />
      <BaseInputTextNumberDatetime
        v-if="filter.advancedFilter.showTimeForDateFilter"
        v-model="maxTime"
        input-style="default"
        :type="determineInputType[1]"
        :placeholder="determinePlaceholder"
      />
    </div>
    <div v-else>
      <BaseInputTextNumberDatetime
        v-model="max"
        input-style="default"
        :type="determineInputType"
        :placeholder="determinePlaceholder"
      />
    </div>
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

const min = ref<number | string>();
const minTime = ref<number | string | undefined>(undefined);
const max = ref<number | string>();
const maxTime = ref<number | string | undefined>(undefined);
const force = ref<boolean>(false);

const totalMin = computed(() =>
  minTime.value ? `${min.value}T${minTime.value}` : min.value
);
const totalMax = computed(() =>
  maxTime.value ? `${max.value}T${maxTime.value}` : max.value
);

const emitNewAdvancedFilterInput = () => {
  if (min.value && max.value) {
    const newAdvancedFilterInput: AdvancedFilterInput = {
      type: props.filter.advancedFilter.type,
      parent_key: props.filter.advancedFilter.parentKey,
      key: props.filter.advancedFilter.key,
      value: {
        min: isDateTime(totalMin.value)
          ? addCurrentTimeZoneToDateTimeString(totalMin.value)
          : totalMin.value,
        max: isDateTime(totalMax.value)
          ? addCurrentTimeZoneToDateTimeString(totalMax.value)
          : totalMax.value,
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
  }
};

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
  max.value = extractDate(props.filter.inputFromState?.value?.max);
  maxTime.value = extractTime(props.filter.inputFromState?.value?.max);
  min.value = extractDate(props.filter.inputFromState?.value?.min);
  minTime.value = extractTime(props.filter.inputFromState?.value?.min);
  force.value = Boolean(props.filter.inputFromState);
});

watch(min, () => emitNewAdvancedFilterInput());
watch(minTime, () => emitNewAdvancedFilterInput());
watch(max, () => emitNewAdvancedFilterInput());
watch(maxTime, () => emitNewAdvancedFilterInput());
</script>
