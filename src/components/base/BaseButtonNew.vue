<template>
  <button
    type="button"
    :disabled="disabled"
    :class="[
      label ? `pl-1.5` : ``,
      `${selectedStyle.bgColor} ${selectedStyle.txtColor}`,
      `text-base flex justify-center items-center p-3 rounded transition-colors duration-300`,
    ]"
  >
    <unicon
      v-if="props.icon !== 'no-icon'"
      :name="icon"
      height="16"
      :fill="`${selectedStyle.txtColor}`"
    />
    <span v-if="label" class="ml-0.5 leading-4">{{ label }}</span>
  </button>
</template>

<script lang="ts" setup>
import type { DamsIcons } from "@/types";
import { computed } from "vue";

type ButtonColors = {
  txtColor: string;
  bgColor: string;
  hoverStyle: ButtonColors | "is-hover-style";
};

type ButtonStyles = "default" | "active" | "disabled";
type ButtonStylesObject = Record<ButtonStyles, ButtonColors>;

const hoverStyle: ButtonColors = {
  txtColor: "text-accent-light",
  bgColor: "bg-neutral-lightest",
  hoverStyle: "is-hover-style",
};
const defaultStyle: ButtonColors = {
  txtColor: "text-text-body",
  bgColor: "bg-neutral-lightest",
  hoverStyle: hoverStyle,
};
const activeStyle: ButtonColors = {
  txtColor: "text-text-body",
  bgColor: "bg-neutral-lightest",
  hoverStyle: hoverStyle,
};
const disabledStyle: ButtonColors = {
  txtColor: "text-accent-normal",
  bgColor: "bg-accent-light",
  hoverStyle: hoverStyle,
};

const buttonStyles: ButtonStylesObject = {
  default: defaultStyle,
  active: activeStyle,
  disabled: disabledStyle,
};

const props = withDefaults(
  defineProps<{
    label: string;
    loading: boolean;
    icon: DamsIcons | "no-icon";
    buttonStyle: ButtonStyles;
    disabled: boolean;
  }>(),
  {
    loading: false,
    icon: "no-icon",
    buttonStyle: "default",
    disabled: false,
  }
);

const selectedStyle = computed<ButtonColors>(() => {
  return props.disabled
    ? buttonStyles.disabled
    : buttonStyles[props.buttonStyle];
});
</script>
