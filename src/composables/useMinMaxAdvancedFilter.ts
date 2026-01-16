// @/composables/useMinMaxAdvancedFilterNew.ts
import { computed, ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { AdvancedFilterTypes } from "@/generated-types/queries";
import { addCurrentTimeZoneToDateTimeString, isDateTime } from "@/helpers";
import type { FilterListItem } from "@/composables/useStateManagement";

const isEmptyValue = (value: unknown) => {
  return value == null || value === undefined || value === "";
};

export function useMinMaxAdvancedFilter(
  filter: FilterListItem,
  emitEvent: (event: string, ...args: any[]) => void,
) {
  const { t } = useI18n();

  const inputMin = ref<number | string | undefined>();
  const inputMax = ref<number | string | undefined>();

  const determineInputType = computed<"date"|"datetime-local"|"number">(() => {
    const isDateType = filter.advancedFilter.type === AdvancedFilterTypes.Date;
    const isTimeShown = isDateType && filter.advancedFilter.showTimeForDateFilter;

    if (isDateType) {
      return isTimeShown ? "datetime-local" : "date";
    }
    return "number";
  });

  const determinePlaceholder = computed(() => {
    return filter.advancedFilter.type === AdvancedFilterTypes.Number
      ? t("filters.matcher-placeholders.number")
      : t("filters.matcher-placeholders.date");
  });

  const isNumberType = computed(
    () => filter.advancedFilter.type === AdvancedFilterTypes.Number,
  );

  const normalizeValue = (value: number | string | undefined) => {
    if (isEmptyValue(value)) return undefined;
    return isDateTime(value) ? addCurrentTimeZoneToDateTimeString(value as string) : value;
  };

  const emitNewAdvancedFilterInput = () => {
    const value = isEmptyValue(inputMin.value) && isEmptyValue(inputMax.value)
      ? undefined
      : {
          min: normalizeValue(inputMin.value),
          max: normalizeValue(inputMax.value),
          included: true,
        };
    emitEvent("updateValue", value);
  };

  watch([inputMin, inputMax], emitNewAdvancedFilterInput);

  onMounted(() => {
    inputMin.value = filter.inputFromState?.value?.min;
    inputMax.value = filter.inputFromState?.value?.max;
  });

  return {
    inputMin,
    inputMax,
    determineInputType,
    determinePlaceholder,
    isNumberType,
  };
}