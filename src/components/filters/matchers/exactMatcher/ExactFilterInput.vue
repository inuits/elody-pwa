<template>
  <div class="grow">
    <BaseInputTextNumberDatetime
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
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";

const props = defineProps({
  filter: { type: Object, required: true },
  lastTypedValue: { type: String, default: "" },
});

const emit = defineEmits(["updateValue"]);

const { t } = useI18n();

const inputValue = ref<string | number | undefined>(
  props.lastTypedValue || props.filter.inputFromState?.value
);

const inputType = computed(() => {
  const filterType = props.filter.advancedFilter.type;
  
  if (filterType === AdvancedFilterTypes.Date) {
    return props.filter.advancedFilter.showTimeForDateFilter 
      ? "datetime-local" 
      : "date";
  }
  
  return filterType === AdvancedFilterTypes.Number ? "number" : "text";
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

watch(inputValue, (newValue) => {
  emit("updateValue", newValue, Boolean(props.filter.inputFromState));
});

const reset = () => {
  inputValue.value = "";
};

defineExpose({
  reset,
});
</script>