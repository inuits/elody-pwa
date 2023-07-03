<template>
  <button
    type="button"
    :disabled="disabled"
    class="flex justify-center items-center w-full text-base rounded-md outline-none transition-colors duration-300 disabled:cursor-auto"
    :class="[
      label ? `pl-1.5` : ``,
      `${selectedButtonStyle.textColor} ${selectedButtonStyle.bgColor}`,
      `${selectedButtonStyle.hoverStyle.textColor} ${selectedButtonStyle.hoverStyle.bgColor}`,
      `${selectedButtonStyle.activeStyle.textColor} ${selectedButtonStyle.activeStyle.bgColor}`,
      `${selectedButtonStyle.disabledStyle.textColor} ${selectedButtonStyle.disabledStyle.bgColor}`,
      { 'p-3': buttonSize === 'normal' },
      { 'p-1.5': buttonSize === 'small' },
    ]"
  >
    <unicon
      v-if="props.icon !== DamsIcons.NoIcon"
      :class="{ '-ml-1': label }"
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
  textColor: string;
  bgColor: string;
};
type Button = {
  textColor: string;
  bgColor: string;
  hoverStyle: PseudoStyle;
  activeStyle: PseudoStyle;
  disabledStyle: PseudoStyle;
};
const defaultButton: Button = {
  textColor: "text-text-body",
  bgColor: "bg-neutral-lightest",
  hoverStyle: {
    textColor: "hover:text-accent-accent",
    bgColor: "hover:bg-neutral-lightest",
  },
  activeStyle: {
    textColor: "active:text-accent-accent",
    bgColor: "active:bg-accent-light",
  },
  disabledStyle: {
    textColor: "disabled:text-text-disabled",
    bgColor: "disabled:bg-neutral-lightest",
  },
};
const accentAccentButton: Button = {
  textColor: "text-neutral-white",
  bgColor: "bg-accent-accent",
  hoverStyle: defaultButton.hoverStyle,
  activeStyle: defaultButton.activeStyle,
  disabledStyle: defaultButton.disabledStyle,
};
const accentNormalButton: Button = {
  textColor: accentAccentButton.textColor,
  bgColor: "bg-accent-normal",
  hoverStyle: {
    textColor: "hover:text-accent-normal",
    bgColor: defaultButton.hoverStyle.bgColor,
  },
  activeStyle: {
    textColor: "active:text-accent-normal",
    bgColor: defaultButton.activeStyle.bgColor,
  },
  disabledStyle: defaultButton.disabledStyle,
};
const redDefaultButton: Button = {
  textColor: accentAccentButton.textColor,
  bgColor: "bg-red-default",
  hoverStyle: {
    textColor: "hover:text-red-default",
    bgColor: "hover:bg-red-lightest",
  },
  activeStyle: {
    textColor: "active:text-red-default",
    bgColor: "active:bg-red-light",
  },
  disabledStyle: defaultButton.disabledStyle,
};

type ButtonStyle = "default" | "accentAccent" | "accentNormal" | "redDefault";
const buttonStyles: Record<ButtonStyle, Button> = {
  default: defaultButton,
  accentAccent: accentAccentButton,
  accentNormal: accentNormalButton,
  redDefault: redDefaultButton,
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
