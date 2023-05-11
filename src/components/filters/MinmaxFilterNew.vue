<template>
  <div class="flex md:justify-around">
    <MinMaxField
      id="inputBox"
      v-model="inputFieldMin"
      :debounce="true"
      :placeholder="$t('filter.min')"
      :bg-color="'neutral-20'"
      :label="$t('filter.min')"
    />
    <MinMaxField
      v-model="inputFieldMax"
      :debounce="true"
      :placeholder="$t('filter.max')"
      :bg-color="'neutral-20'"
      :label="$t('filter.max')"
      :min="inputFieldMin ? inputFieldMin + 1 : undefined"
    />
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, computed } from "vue";
import {
  defaultReturnMinMaxObject,
  type FilterInList,
  type AdvancedFilter,
} from "@/composables/useFilterHelper";
import MinMaxField from "@/components/base/MinMaxField.vue";

const props = defineProps<{
  value?: FilterInList;
  filter: AdvancedFilter;
  isRelation: false;
}>();

const emit = defineEmits<{
  (event: "update:value", defaultMinMaxObject: FilterInList): void;
}>();

const inputFieldMin = computed<number | undefined>({
  get() {
    return props.value &&
      props.value?.input.minMaxInput &&
      props.value?.input.minMaxInput.min
      ? props.value?.input.minMaxInput.min
      : undefined;
  },
  set(value) {
    emit(
      "update:value",
      defaultReturnMinMaxObject(props.filter?.key, {
        min: value,
        max: inputFieldMax.value,
        isRelation: props.isRelation,
      })
    );
  },
});

const inputFieldMax = computed<number | undefined>({
  get() {
    return props.value &&
      props.value?.input.minMaxInput &&
      props.value?.input.minMaxInput.max
      ? props.value?.input.minMaxInput.max
      : undefined;
  },
  set(value) {
    emit(
      "update:value",
      defaultReturnMinMaxObject(props.filter?.key, {
        min: inputFieldMin.value,
        max: value,
        isRelation: props.isRelation,
      })
    );
  },
});
</script>

<style></style>
