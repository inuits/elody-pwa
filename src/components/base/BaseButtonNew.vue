<template>
  <button
    type="button"
    :disabled="disable"
    :class="[
      label ? `pl-1.5` : ``,
      !disable
        ? `bg-[var(--color-accent-normal)] text-[var(--color-neutral-white)]`
        : `bg-[var(--color-neutral-lightest)] text-[var(--color-text-light)]`,
      `text-base flex justify-center items-center p-3 rounded transition-colors duration-300`,
    ]"
  >
    <unicon
      v-if="icon"
      :name="icon"
      height="16"
      :fill="
        !disable ? 'var(--color-neutral-white)' : `var(--color-text-light)`
      "
    />
    <span v-if="label" class="ml-0.5 leading-4">{{ label }}</span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { Unicons } from "@/types";

type Button = {
  bg: string;
  text: string;
};

export default defineComponent({
  name: "BaseButton",
  setup() {
    const uploadButton: Button = {
      bg: "var(--color-accent-normal)",
      text: "var(--color-neutral-white)",
    };

    return {
      uploadButton,
    };
  },
  props: {
    label: {
      type: [String],
      required: false,
      default: undefined,
    },
    disable: {
      type: Boolean,
      default: true,
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
      default: "var(--color-neutral-700)",
    },
    borderColor: {
      type: String,
      default: "transparent",
    },
  },
});
</script>
