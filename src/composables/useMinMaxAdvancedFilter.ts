import { computed, ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  AdvancedFilterTypes,
  type AdvancedFilterInput,
} from "@/generated-types/queries";
import {
  addCurrentTimeZoneToDateTimeString,
  isDateTime,
  extractDate,
  extractTime,
} from "@/helpers";
import type { FilterListItem } from "@/composables/useStateManagement";

export function useMinMaxAdvancedFilter(
  filter: FilterListItem,
  emitEvent: (event: string, ...args: any[]) => void,
) {
  const { t } = useI18n();

  const inputMin = ref<number | string>();
  const inputMax = ref<number | string>();
  const inputTimeMin = ref<number | string | undefined>(undefined);
  const inputTimeMax = ref<number | string | undefined>(undefined);
  const force = ref<boolean>(false);

  const determineInputType = computed<"number" | ["date", "time"]>(() => {
    return filter.advancedFilter.type === AdvancedFilterTypes.Date
      ? ["date", "time"]
      : "number";
  });

  const determinePlaceholder = computed(() => {
    return filter.advancedFilter.type === AdvancedFilterTypes.Number
      ? t("filters.matcher-placeholders.number")
      : t("filters.matcher-placeholders.date");
  });

  const totalInputMin = computed(() => {
    if (isNumberType.value) return inputMin.value;
    return inputMin.value
      ? `${inputMin.value}T${inputTimeMin.value || "00:00:00"}`
      : undefined;
  });

  const totalInputMax = computed(() => {
    if (isNumberType.value) return inputMax.value;
    return inputMax.value
      ? `${inputMax.value}T${inputTimeMax.value || "00:00:00"}`
      : undefined;
  });

  const isNumberType = computed(
    () => filter.advancedFilter.type === AdvancedFilterTypes.Number,
  );

  const emitNewAdvancedFilterInput = () => {
    const value =
      totalInputMin.value || totalInputMax.value
        ? {
            min: totalInputMin.value
              ? isDateTime(totalInputMin.value)
                ? addCurrentTimeZoneToDateTimeString(totalInputMin.value)
                : totalInputMin.value
              : undefined,
            max: totalInputMax.value
              ? isDateTime(totalInputMax.value)
                ? addCurrentTimeZoneToDateTimeString(totalInputMax.value)
                : totalInputMax.value
              : undefined,
            included: true,
          }
        : undefined;

    const newAdvancedFilterInput: AdvancedFilterInput = {
      type: filter.advancedFilter.type,
      parent_key: filter.advancedFilter.parentKey,
      key: filter.advancedFilter.key,
      value,
      aggregation: filter.advancedFilter.aggregation,
    };

    if (filter.advancedFilter.lookup) {
      newAdvancedFilterInput.lookup = {
        from: filter.advancedFilter.lookup.from,
        local_field: filter.advancedFilter.lookup.local_field,
        foreign_field: filter.advancedFilter.lookup.foreign_field,
        as: filter.advancedFilter.lookup.as,
      };
    }
    emitEvent("newAdvancedFilterInput", newAdvancedFilterInput, force.value);
    force.value = false;
  };

  watch(
    [inputMin, inputTimeMin, inputMax, inputTimeMax],
    emitNewAdvancedFilterInput,
  );

  onMounted(() => {
    inputMin.value = isNumberType.value
      ? filter.inputFromState?.value?.min
      : extractDate(filter.inputFromState?.value?.min);
    inputTimeMin.value =
      extractTime(filter.inputFromState?.value?.min) || "00:00:00";

    inputMax.value = isNumberType.value
      ? filter.inputFromState?.value?.max
      : extractDate(filter.inputFromState?.value?.max);

    inputTimeMax.value = inputMax.value
      ? extractTime(filter.inputFromState?.value?.max) || "00:00:00"
      : undefined;
    force.value = Boolean(filter.inputFromState);
  });

  return {
    inputMin,
    inputMax,
    inputTimeMin,
    inputTimeMax,
    determineInputType,
    determinePlaceholder,
    isNumberType,
  };
}
