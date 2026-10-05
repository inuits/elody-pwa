<template>
  <button
    data-cy="base-button-new"
    type="button"
    :disabled="disabled || loading"
    :aria-label="ariaLabel"
    class="flex justify-center items-center whitespace-nowrap w-full rounded-button font-bold cursor-pointer transition-transform active:scale-[.97] disabled:cursor-auto disabled:active:scale-100"
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
        <template #activator="{ on, describedBy }">
          <div v-on="on" :aria-describedby="describedBy">
            <unicon :name="Unicons.QuestionCircle.name" height="20" />
          </div>
        </template>
        <template #default>
          <span>
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
const disabledStyle: PseudoStyle = {
  textColor: "disabled:text-text-disabled",
  bgColor: "disabled:bg-background-normal",
};
// Primary: client accent fill, white ink, darker accent + accent shadow on hover.
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
  disabledStyle,
  extra: "hover:shadow-[var(--shadow-accent-hover)]",
};
// Secondary: white surface, 1px border, body ink.
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
  disabledStyle,
};
// Ghost: borderless, label-blue ink.
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
  disabledStyle,
};
// Commit: platform-fixed teal (Bewaar, confirm); never client-themed.
const commitButton: Button = {
  textColor: "text-neutral-white",
  bgColor: "bg-commit",
  hoverStyle: {
    textColor: "hover:text-neutral-white",
    bgColor: "hover:bg-commit-hover",
  },
  activeStyle: {
    textColor: "active:text-neutral-white",
    bgColor: "active:bg-commit-hover",
  },
  disabledStyle,
};
// Danger: destructive actions.
const dangerButton: Button = {
  textColor: "text-neutral-white",
  bgColor: "bg-danger",
  hoverStyle: {
    textColor: "hover:text-neutral-white",
    bgColor: "hover:bg-red-dark",
  },
  activeStyle: {
    textColor: "active:text-neutral-white",
    bgColor: "active:bg-red-dark",
  },
  disabledStyle,
};

export type ButtonStyle =
  | "primary"
  | "secondary"
  | "ghost"
  | "commit"
  | "danger";
const buttonStyles: Record<ButtonStyle, Button> = {
  primary: primaryButton,
  secondary: secondaryButton,
  ghost: ghostButton,
  commit: commitButton,
  danger: dangerButton,
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
    buttonStyle: "secondary",
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
