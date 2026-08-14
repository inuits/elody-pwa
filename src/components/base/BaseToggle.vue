<template>
  <!-- Toggle is a real button: pressed = sunken surface, no shadows. -->
  <button
    type="button"
    :aria-pressed="toggleOn"
    class="flex items-center justify-center w-9 h-9 rounded-input border-none cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-accent-accent"
    :class="
      toggleOn && isPartOfToggleGroup
        ? 'bg-surface-sunken text-text-light'
        : 'bg-background-light hover:bg-accent-wash'
    "
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
  </button>
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
