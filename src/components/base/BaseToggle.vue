<template>
  <div
    class="flex items-center justify-center w-9 h-9 rounded bg-neutral-white cursor-pointer select-none"
    :class="{
      'drop-shadow-[0_0_3px_rgba(9,30,66,0.13)]':
        isPartOfToggleGroup && !toggleOn,
    }"
    @click="
      () => {
        emit('turnAllTogglesInGroupOff');
        emit('update:modelValue', !toggleOn);
      }
    "
  >
    <unicon
      v-if="toggleOn"
      :class="{ 'text-text-light': isPartOfToggleGroup }"
      :name="Unicons[props.iconOn].name"
      :height="iconHeight"
    />
    <unicon v-else :name="Unicons[props.iconOff].name" :height="iconHeight" />
  </div>
</template>

<script lang="ts" setup>
import type { DamsIcons } from "@/generated-types/queries";
import { toRefs } from "vue";
import { Unicons } from "@/types";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    iconOn: DamsIcons;
    iconOff: DamsIcons;
    iconHeight?: number;
    isPartOfToggleGroup?: boolean;
  }>(),
  {
    iconHeight: 18,
    isPartOfToggleGroup: false,
  }
);

const emit = defineEmits<{
  (event: "turnAllTogglesInGroupOff"): void;
  (event: "update:modelValue", modelValue: boolean): void;
}>();

const { modelValue: toggleOn } = toRefs(props);
</script>
