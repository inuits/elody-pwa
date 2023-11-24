<template>
  <div>
    <span class="text-sm text-text-body">minimum</span>
    <BaseInputTextNumberDatetime
      v-model="min"
      input-style="default"
      :type="determineInputType"
      :placeholder="determinePlaceholder"
    />
  </div>
  <div>
    <span class="text-sm text-text-body">maximum</span>
    <BaseInputTextNumberDatetime
      v-model="max"
      input-style="default"
      :type="determineInputType"
      :placeholder="determinePlaceholder"
    />
  </div>
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

const min = ref<number | string>();
const max = ref<number | string>();

const emitNewAdvancedFilterInput = () => {
  if (min.value && max.value)
    emit("newAdvancedFilterInput", {
      type: props.filter.type,
      parent_key: props.filter.parentKey,
      key: props.filter.key,
      value: {
        min: min.value,
        max: max.value,
      },
    });
};

const determineInputType = computed<"number" | "datetime-local">(() => {
  if (props.filter.type === AdvancedFilterTypes.Date) return "datetime-local";
  return "number";
});
const determinePlaceholder = computed(() => {
  if (props.filter.type === AdvancedFilterTypes.Number)
    return t("filters.matcher-placeholders.number");
  return t("filters.matcher-placeholders.date");
});

watch(min, () => emitNewAdvancedFilterInput());
watch(max, () => emitNewAdvancedFilterInput());
</script>
