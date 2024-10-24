<template>
  <div class="relative w-full mx-auto">
    <BaseSlider
      v-model="sliderValue"
      :min="min"
      :max="max"
      @update:model-value="updateValuesFromSlider"
    />

    <div class="flex justify-between relative w-full mb-8 mt-2">
      <div
        class="absolute top-2 w-px h-2.5"
        v-for="(number, index) in ticks"
        :key="number"
        :style="{ left: `${getLeftPosition(index)}%` }"
      >
        <div class="w-px h-2.5 bg-gray-300" />
        <div
          v-if="index === 0 || index % 2 === 0"
          class="relative text-center text-sm text-gray-300 left-1/2 w-max transform translate-x-[-50%]"
        >
          {{ number }}
        </div>
      </div>
    </div>

    <div
      class="flex flex-row justify-between pt-3 text-md font-normal leading-5 gap-1"
    >
      <div class="flex flex-col">
        <div class="flex items-center justify-start gap-2">
          <div>From:</div>
          <div class="w-12 h-10">
            <BaseInputTextNumberDatetime
              v-model="from"
              type="number"
              :min="min"
              input-style="default"
              @input="handleFromChange"
            />
          </div>
          <div v-if="unit">{{ unit }}</div>
        </div>
        <div v-if="hasFromInputError" class="text-red-default">
          {{ $t("filters.rangeFilterFromInputError") }}
        </div>
      </div>
      <div class="flex flex-col">
        <div class="flex items-center justify-end gap-2">
          <div>To:</div>
          <div class="w-12 h-10">
            <BaseInputTextNumberDatetime
              :modelValue="to"
              type="number"
              input-style="default"
              :max="max"
              :min="min"
              @input="handleToChange"
            />
          </div>
          <div v-if="unit">{{ unit }}</div>
        </div>
        <div v-if="hasToInputError" class="text-red-default text-right">
          {{ $t("filters.rangeFilterToInputError") }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watch } from "vue";
import BaseSlider from "@/components/base/BaseSlider.vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import { useBaseRangeSlider } from "@/composables/useBaseRangeSlider";

const props = defineProps<{
  from: number;
  to: number;
  min: number;
  max: number;
  unit?: string;
}>();

const emit = defineEmits<{
  (event: "updateRange", range: number[]): void;
}>();

const {
  from,
  to,
  min,
  max,
  unit,
  sliderValue,
  ticks,
  hasFromInputError,
  hasToInputError,
  handleFromChange,
  handleToChange,
  getLeftPosition,
  updateValuesFromSlider,
} = useBaseRangeSlider({
  initialFrom: props.from ?? props.min,
  initialTo: props.to ?? props.max,
  minValue: props.min,
  maxValue: props.max,
});

watch(
  () => [from.value, to.value],
  ([newFrom, newTo]) => {
    emit("updateRange", [newFrom, newTo]);
  }
);

watch(
  () => [props.from, props.to],
  ([newFrom, newTo]) => {
    from.value = newFrom;
    to.value = newTo;
  },
  { immediate: true }
);

watch(
  () => sliderValue.value,
  (newSliderValue: number[]) => {
    emit("updateRange", newSliderValue);
  }
);
</script>
