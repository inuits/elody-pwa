<template>
  <button
    data-cy="base-button"
    type="button"
    :class="[
      `bg-${bgColor} text-sm flex justify-center items-center px-3 py-2 rounded transition-colors duration-300 m-1`,
      loading
        ? `text-${bgColor}`
        : `text-${txtColor} hover:bg-${bgHoverColor} hover:brightness-90`,
      label ? `pl-1.5` : ``,
    ]"
  >
    <unicon
      v-if="icon"
      :name="icon"
      :height="iconHeight"
      :fill="loading ? 'fill-neutral-20' : 'fill-neutral-white'"
    />
    <span v-if="label" class="ml-0.5 leading-4">{{ label }}</span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { Unicons } from "@/types";

export default defineComponent({
  name: "BaseButton",
  props: {
    label: {
      type: [String],
      required: false,
      default: undefined,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      required: false,
      default: undefined,
    },
    bgColor: {
      type: String,
      default: "neutral-20",
    },
    bgHoverColor: {
      type: String,
      default: "neutral-70",
    },
    txtColor: {
      type: String,
      default: "neutral-700",
    },
    iconColor: {
      type: String,
      default: "neutral-700",
    },
    borderColor: {
      type: String,
      default: "transparent",
    },
    iconHeight: {
      type: Number,
      default: 16,
    },
  },
});
</script>
<style scoped></style>
