<template>
  <button
    data-cy="base-button-new"
    type="button"
    :disabled="disabled || loading"
    :aria-label="ariaLabel"
    class="flex justify-center items-center whitespace-nowrap w-full rounded-md font-bold cursor-pointer disabled:cursor-auto focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus-ring"
    :class="[
      label ? `pl-1.5` : ``,
      `${selectedButtonStyle.textColor} ${selectedButtonStyle.bgColor}`,
      `${selectedButtonStyle.hoverStyle.textColor} ${selectedButtonStyle.hoverStyle.bgColor}`,
      `${selectedButtonStyle.activeStyle.textColor} ${selectedButtonStyle.activeStyle.bgColor}`,
      `${selectedButtonStyle.disabledStyle.textColor} ${selectedButtonStyle.disabledStyle.bgColor}`,
      selectedButtonStyle.extra ?? '',
      { 'text-value p-3': buttonSize === 'normal' },
      { 'text-ui p-1.5': buttonSize === 'small' },
      { 'text-hint p-1': buttonSize === 'verySmall' },
    ]"
  >
    <spinner-loader
      v-if="loading"
      theme="accent"
      class="mr-2"
      :dimensions="5"
    />
    <unicon
      v-else-if="props.icon !== DamsIcons.NoIcon"
      :class="[{ '-ml-1 ': label }]"
      :name="Unicons[props.icon].name"
      :height="iconHeight"
    />
    <span
      v-if="label"
      class="leading-4 text-ellipsis"
      :class="[
        {
          '@max-xs/window:hidden @max-xl/wrapper-content:hidden':
            !forceShowLabel,
        },
      ]"
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
          <span class="text-value text-text-placeholder">
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
import SpinnerLoader from "@/components/SpinnerLoader.vue";

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
  extra?: string;
};
const defaultButton: Button = {
  textColor: "text-text-body",
  bgColor: "bg-background-normal",
  hoverStyle: {
    textColor: "hover:text-accent-accent",
    bgColor: "hover:bg-accent-highlight",
  },
  activeStyle: {
    textColor: "active:text-accent-accent",
    bgColor: "active:bg-accent-light",
  },
  disabledStyle: {
    textColor: "disabled:text-text-disabled",
    bgColor: "disabled:bg-background-normal",
  },
};
const accentAccentButton: Button = {
  textColor: "text-neutral-white",
  bgColor: "bg-accent-accent",
  hoverStyle: {
    textColor: "hover:text-neutral-white",
    bgColor: "hover:bg-commit-hover",
  },
  activeStyle: {
    textColor: "active:text-neutral-white",
    bgColor: "active:bg-commit-strong-hover",
  },
  disabledStyle: defaultButton.disabledStyle,
};
// Design-system secondary: white surface, 1px border, body ink.
const secondaryButton: Button = {
  textColor: "text-text-body",
  bgColor: "bg-neutral-white border border-neutral-40",
  hoverStyle: {
    textColor: "hover:text-text-body",
    bgColor: "hover:bg-accent-wash",
  },
  activeStyle: {
    textColor: "active:text-text-body",
    bgColor: "active:bg-accent-light",
  },
  disabledStyle: defaultButton.disabledStyle,
};
// Design-system ghost: borderless, label-blue ink.
const ghostButton: Button = {
  textColor: "text-text-light",
  bgColor: "bg-transparent",
  hoverStyle: {
    textColor: "hover:text-accent-dark",
    bgColor: "hover:bg-accent-wash",
  },
  activeStyle: {
    textColor: "active:text-accent-dark",
    bgColor: "active:bg-accent-light",
  },
  disabledStyle: defaultButton.disabledStyle,
};
const accentNormalButton: Button = {
  textColor: accentAccentButton.textColor,
  bgColor: "bg-accent-normal",
  hoverStyle: {
    textColor: "hover:text-accent-normal",
    bgColor: "hover:bg-background-normal",
  },
  activeStyle: {
    textColor: "active:text-accent-normal",
    bgColor: defaultButton.activeStyle.bgColor,
  },
  disabledStyle: defaultButton.disabledStyle,
};
// Design-system primary: accent fill, white ink, darker accent on hover.
const primaryButton: Button = {
  textColor: "text-neutral-white",
  bgColor: "bg-accent",
  hoverStyle: {
    textColor: "hover:text-neutral-white",
    bgColor: "hover:bg-accent-hover",
  },
  activeStyle: {
    textColor: "active:text-neutral-white",
    bgColor: "active:bg-accent-hover",
  },
  disabledStyle: defaultButton.disabledStyle,
  extra: "hover:shadow-[0_2px_6px_rgba(59,166,203,0.4)]",
};
const redDefaultButton: Button = {
  textColor: accentAccentButton.textColor,
  bgColor: "bg-red-default",
  hoverStyle: {
    textColor: "hover:text-neutral-white",
    bgColor: "hover:bg-red-dark",
  },
  activeStyle: {
    textColor: "active:text-neutral-white",
    bgColor: "active:bg-red-dark",
  },
  disabledStyle: defaultButton.disabledStyle,
};

export type ButtonStyle =
  | "default"
  | "primary"
  | "secondary"
  | "ghost"
  | "accentAccent"
  | "accentNormal"
  | "redDefault";
// Deprecations (design system): the grey `default` variant renders as
// secondary, the mint `accentNormal` as commit. The names remain accepted
// so config-driven call sites keep working.
const buttonStyles: Record<ButtonStyle, Button> = {
  default: secondaryButton,
  primary: primaryButton,
  secondary: secondaryButton,
  ghost: ghostButton,
  accentAccent: accentAccentButton,
  accentNormal: accentAccentButton,
  redDefault: redDefaultButton,
};

export type ButtonSize = "normal" | "small" | "verySmall";

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
    forceShowLabel?: boolean;
    ariaLabel?: string;
  }>(),
  {
    icon: DamsIcons.NoIcon,
    buttonStyle: "default",
    buttonSize: "normal",
    disabled: false,
    iconHeight: 14,
    loading: false,
    forceShowLabel: false,
    ariaLabel: undefined,
  },
);

const { t } = useI18n();

const selectedButtonStyle = computed<Button>(
  () => buttonStyles[props.buttonStyle],
);
</script>
