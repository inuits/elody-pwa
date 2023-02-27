<template>
  <button
    type="button"
    :disabled="disabled"
    class="text-base flex justify-center items-center p-3 rounded transition-colors duration-300 disabled:cursor-auto"
    :class="[
      `${selectedButtonStyle.bgColor} ${selectedButtonStyle.txtColor}`,
      `${selectedButtonStyle.hoverStyle.bgColor} ${selectedButtonStyle.hoverStyle.txtColor}`,
      `${selectedButtonStyle.activeStyle.bgColor} ${selectedButtonStyle.activeStyle.txtColor}`,
      `${selectedButtonStyle.disabledStyle.bgColor} ${selectedButtonStyle.disabledStyle.txtColor}`,
      label ? `pl-1.5` : ``,
    ]"
  >
    <unicon
      v-if="props.icon !== 'no-icon'"
      :name="Unicons[props.icon].name"
      height="16"
    />
    <span v-if="label" class="ml-0.5 leading-4">{{ label }}</span>
  </button>
</template>

<script lang="ts" setup>
import type { DamsIcons } from "@/types";
import { Unicons } from "@/types";
import { computed } from "vue";

type PseudoStyle = {
  txtColor: string;
  bgColor: string;
};
const hoverStyle: PseudoStyle = {
  txtColor: "hover:text-accent-normal",
  bgColor: "hover:bg-neutral-lightest",
};
const activeStyle: PseudoStyle = {
  txtColor: "active:text-accent-normal",
  bgColor: "active:bg-accent-light",
};
const disabledStyle: PseudoStyle = {
  txtColor: "disabled:text-text-light",
  bgColor: "disabled:bg-neutral-lightest",
};

type Button = {
  txtColor: string;
  bgColor: string;
  hoverStyle: PseudoStyle;
  activeStyle: PseudoStyle;
  disabledStyle: PseudoStyle;
};
const defaultButton: Button = {
  txtColor: "text-text-body",
  bgColor: "bg-neutral-lightest",
  hoverStyle: hoverStyle,
  activeStyle: activeStyle,
  disabledStyle: disabledStyle,
};
const blueButton: Button = {
  txtColor: "text-neutral-white",
  bgColor: "bg-accent-normal",
  hoverStyle: hoverStyle,
  activeStyle: activeStyle,
  disabledStyle: disabledStyle,
};

type ButtonStyle = "default" | "blue";
const buttonStyles: Record<ButtonStyle, Button> = {
  default: defaultButton,
  blue: blueButton,
};

const props = withDefaults(
  defineProps<{
    label: string;
    loading: boolean;
    icon: DamsIcons | "no-icon";
    buttonStyle: ButtonStyle;
    disabled: boolean;
  }>(),
  {
    loading: false,
    icon: "no-icon",
    buttonStyle: "default",
    disabled: false,
  }
);

const selectedButtonStyle = computed<Button>(() => {
  return buttonStyles[props.buttonStyle];
});
</script>
