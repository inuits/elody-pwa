<template>
  <button
    data-cy="base-button-new"
    type="button"
    :disabled="disabled"
    class="flex justify-center items-center whitespace-nowrap w-full rounded-md outline-none transition-colors duration-300 cursor-pointer disabled:cursor-auto"
    :class="[
      label ? `pl-1.5` : ``,
      `${selectedButtonStyle.textColor} ${selectedButtonStyle.bgColor}`,
      `${selectedButtonStyle.hoverStyle.textColor} ${selectedButtonStyle.hoverStyle.bgColor}`,
      `${selectedButtonStyle.activeStyle.textColor} ${selectedButtonStyle.activeStyle.bgColor}`,
      `${selectedButtonStyle.disabledStyle.textColor} ${selectedButtonStyle.disabledStyle.bgColor}`,
      { 'text-base p-3': buttonSize === 'normal' },
      { 'text-[0.925rem] p-1.5': buttonSize === 'small' },
    ]"
  >
    <unicon
      v-if="props.icon !== DamsIcons.NoIcon"
      :class="[{ '-ml-1 ': label }]"
      :name="Unicons[props.icon].name"
      :height="iconHeight"
    />
    <span
      v-if="label"
      class="leading-4 text-ellipsis @max-xs/window:hidden @max-xl/wrapper-content:hidden"
      >{{ label }}</span
    >

    <div v-if="disabled && tooltipLabel" class="ml-2 -mb-2 text-black">
      <base-tooltip position="top-right" :tooltip-offset="8">
        <template #activator="{ on }">
          <div v-on="on">
            <unicon :name="Unicons.QuestionCircle.name" height="20" />
          </div>
        </template>
        <template #default>
          <span class="text-sm text-text-placeholder">
            <div>
              {{ t(tooltipLabel) }}
            </div>
          </span>
        </template>
      </base-tooltip>
    </div>
  </button>
</template>

<script lang="ts" setup>
import { DamsIcons } from "@/generated-types/queries";
import { Unicons } from "@/types";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import BaseTooltip from "./BaseTooltip.vue";

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

export type ButtonStyle =
  | "default"
  | "accentAccent"
  | "accentNormal"
  | "redDefault";
const buttonStyles: Record<ButtonStyle, Button> = {
  default: defaultButton,
  accentAccent: accentAccentButton,
  accentNormal: accentNormalButton,
  redDefault: redDefaultButton,
};

export type ButtonSize = "normal" | "small";

const props = withDefaults(
  defineProps<{
    label?: string;
    icon?: DamsIcons;
    buttonStyle?: ButtonStyle;
    buttonSize?: ButtonSize;
    disabled?: boolean;
    iconHeight?: number;
    loading?: boolean;
    tooltipLabel?: string;
  }>(),
  {
    icon: DamsIcons.NoIcon,
    buttonStyle: "default",
    buttonSize: "normal",
    disabled: false,
    iconHeight: 18,
    loading: false,
  },
);

const { t } = useI18n();

const selectedButtonStyle = computed<Button>(
  () => buttonStyles[props.buttonStyle],
);
</script>
