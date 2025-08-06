<template>
  <div class="grow">
    <div v-if="isDateTimeInput">
      <BaseInputTextNumberDatetime
        class="mb-2"
        v-model="dateValue"
        input-style="default"
        type="date"
        :placeholder="placeholder"
      />
      <BaseInputTextNumberDatetime
        v-if="filter.advancedFilter.showTimeForDateFilter"
        v-model="timeValue"
        input-style="default"
        type="time"
        :placeholder="placeholder"
      />
    </div>
    <BaseInputTextNumberDatetime
      v-else
      v-model="inputValue"
      input-style="default"
      :type="inputType"
      :placeholder="placeholder"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { AdvancedFilterTypes } from "@/generated-types/queries";
import { extractDate, extractTime } from "@/helpers";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";

const props = defineProps({
  filter: { type: Object, required: true },
  lastTypedValue: { type: String, default: "" },
});

const emit = defineEmits(["updateValue"]);

const { t } = useI18n();

const inputValue = ref<string | number | undefined>();
const dateValue = ref<string | undefined>();
const timeValue = ref<string | undefined>();

const inputType = computed(() => {
  return props.filter.advancedFilter.type === AdvancedFilterTypes.Number
    ? "number"
    : "text";
});

const isDateTimeInput = computed(() => {
  return props.filter.advancedFilter.type === AdvancedFilterTypes.Date;
});

const placeholder = computed(() => {
  switch (props.filter.advancedFilter.type) {
    case AdvancedFilterTypes.Number:
      return t("filters.matcher-placeholders.number");
    case AdvancedFilterTypes.Date:
      return t("filters.matcher-placeholders.date");
    default:
      return t("filters.matcher-placeholders.keyword");
  }
});

if (props.filter.advancedFilter.type === AdvancedFilterTypes.Date) {
  dateValue.value = extractDate(props.filter.inputFromState?.value);
  timeValue.value = extractTime(props.filter.inputFromState?.value);
} else {
  inputValue.value = props.lastTypedValue || props.filter.inputFromState?.value;
}

watch([inputValue, dateValue, timeValue], () => {
  let value;
  if (isDateTimeInput.value) {
    value = timeValue.value
      ? `${dateValue.value}T${timeValue.value}`
      : dateValue.value;
  } else {
    value = inputValue.value;
  }

  emit("updateValue", value, Boolean(props.filter.inputFromState));
});

const reset = () => {
  dateValue.value = "";
  timeValue.value = "";
  inputValue.value = "";
};

defineExpose({
  reset,
});
</script>
