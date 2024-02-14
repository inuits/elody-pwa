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

const min = ref<number | string>();
const max = ref<number | string>();
const force = ref<boolean>(false);

const emitNewAdvancedFilterInput = () => {
  if (min.value && max.value) {
    const newAdvancedFilterInput: AdvancedFilterInput = {
      type: props.filter.advancedFilter.type,
      parent_key: props.filter.advancedFilter.parentKey,
      key: props.filter.advancedFilter.key,
      value: {
        min: min.value,
        max: max.value,
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
  }
};

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
  min.value = props.filter.inputFromState?.value.min;
  max.value = props.filter.inputFromState?.value.max;
  force.value = Boolean(props.filter.inputFromState);
});

watch(min, () => emitNewAdvancedFilterInput());
watch(max, () => emitNewAdvancedFilterInput());
</script>
