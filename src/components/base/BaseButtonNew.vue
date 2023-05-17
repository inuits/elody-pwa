<template>
  <button
    type="button"
    :disabled="disabled"
    class="flex justify-center items-center w-full rounded transition-colors duration-300 disabled:cursor-auto"
    :class="[
      label ? `pl-1.5` : ``,
      `${selectedButtonStyle.bgColor} ${selectedButtonStyle.txtColor}`,
      `${selectedButtonStyle.hoverStyle.bgColor} ${selectedButtonStyle.hoverStyle.txtColor}`,
      `${selectedButtonStyle.activeStyle.bgColor} ${selectedButtonStyle.activeStyle.txtColor}`,
      `${selectedButtonStyle.disabledStyle.bgColor} ${selectedButtonStyle.disabledStyle.txtColor}`,
      { 'text-base p-3': buttonSize === 'normal' },
      { 'text-sm p-1.5': buttonSize === 'small' },
    ]"
  >
    <unicon
      v-if="props.icon !== DamsIcons.NoIcon"
      class="-ml-0.5"
      :name="Unicons[props.icon].name"
      :height="iconHeight"
    />
    <span v-if="label" class="ml-0.5 leading-4">{{ label }}</span>
  </button>
</template>

<script lang="ts" setup>
import { DamsIcons } from "@/generated-types/queries";
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
const normalAccentButton: Button = {
  txtColor: "text-neutral-white",
  bgColor: "bg-accent-normal",
  hoverStyle: hoverStyle,
  activeStyle: activeStyle,
  disabledStyle: disabledStyle,
};

type ButtonStyle = "default" | "normalAccent";
const buttonStyles: Record<ButtonStyle, Button> = {
  default: defaultButton,
  normalAccent: normalAccentButton,
};

type ButtonSize = "normal" | "small";

const props = withDefaults(
  defineProps<{
    label: string;
    icon?: DamsIcons;
    buttonStyle?: ButtonStyle;
    buttonSize?: ButtonSize;
    disabled?: boolean;
    iconHeight?: number;
    loading?: boolean;
  }>(),
  {
    icon: DamsIcons.NoIcon,
    buttonStyle: "default",
    buttonSize: "normal",
    disabled: false,
    iconHeight: 18,
    loading: false,
  }
);

const selectedButtonStyle = computed<Button>(
  () => buttonStyles[props.buttonStyle]
);
</script>
