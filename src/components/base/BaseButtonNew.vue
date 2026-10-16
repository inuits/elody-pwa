<template>
  <button
    data-cy="base-button-new"
    type="button"
    :disabled="(disabled && !disabledWithReason) || loading"
    :aria-disabled="disabledWithReason ? 'true' : undefined"
    :aria-label="ariaLabel"
    :aria-busy="loading ? 'true' : undefined"
    class="relative flex justify-center items-center gap-(--button-gap) whitespace-nowrap w-full font-bold transition-transform disabled:cursor-auto disabled:active:scale-100"
    :class="[
      disabledWithReason
        ? `cursor-auto ${unprefixed(selectedButtonStyle)}`
        : [
            `${selectedButtonStyle.textColor} ${selectedButtonStyle.bgColor}`,
            'cursor-pointer active:scale-[.97]',
            `${selectedButtonStyle.hoverStyle.textColor} ${selectedButtonStyle.hoverStyle.bgColor}`,
            `${selectedButtonStyle.activeStyle.textColor} ${selectedButtonStyle.activeStyle.bgColor}`,
            `${selectedButtonStyle.disabledStyle.textColor} ${selectedButtonStyle.disabledStyle.bgColor}`,
          ],
      selectedButtonStyle.radius,
      disabledWithReason ? '' : (selectedButtonStyle.extra ?? ''),
      sizeClasses,
    ]"
    @click.capture="blockClickWhenDisabled"
  >
    <!-- Loading keeps the width: the spinner takes the icon's place, or
         overlays an invisible label when there is no icon. -->
    <spinner-loader
      v-if="loading"
      :class="{ absolute: !hasIcon }"
      :dimensions="iconHeight / 4"
    />
    <unicon
      v-if="hasIcon && !loading"
      :name="Unicons[props.icon].name"
      :height="iconHeight"
    />
    <span
      v-if="label"
      class="leading-4 text-ellipsis"
      :class="[
        { invisible: loading && !hasIcon },
        {
          '@max-xs/window:sr-only @max-xl/wrapper-content:sr-only':
            !forceShowLabel,
        },
      ]"
      >{{ label }}</span
    >
    <slot />

    <div v-if="disabled && tooltipLabel" class="-mb-2 text-text-secondary">
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
  // Secondary is input-shaped (5px); everything else is a 6px rectangle.
  radius: string;
  extra?: string;
};
const disabledStyle: PseudoStyle = {
  textColor: "disabled:text-text-disabled",
  bgColor: "disabled:bg-background-normal",
};
// Primary: client accent fill, white ink, darker accent + accent shadow on hover.
const primaryButton: Button = {
  textColor: "text-neutral-white",
  bgColor: "bg-accent border border-transparent",
  hoverStyle: {
    textColor: "hover:text-neutral-white",
    bgColor: "hover:bg-accent-hover",
  },
  activeStyle: {
    textColor: "active:text-neutral-white",
    bgColor: "active:bg-accent-hover",
  },
  disabledStyle,
  radius: "rounded-button",
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
  radius: "rounded-input",
};
// Ghost: no visible border, label-blue ink.
const ghostButton: Button = {
  textColor: "text-text-light",
  bgColor: "bg-transparent border border-transparent",
  hoverStyle: {
    textColor: "hover:text-accent-dark",
    bgColor: "hover:bg-accent-wash",
  },
  activeStyle: {
    textColor: "active:text-accent-dark",
    bgColor: "active:bg-accent-light",
  },
  disabledStyle,
  radius: "rounded-button",
};
// Commit: platform-fixed teal (Bewaar, confirm); never client-themed.
const commitButton: Button = {
  textColor: "text-neutral-white",
  bgColor: "bg-commit border border-transparent",
  hoverStyle: {
    textColor: "hover:text-neutral-white",
    bgColor: "hover:bg-commit-hover",
  },
  activeStyle: {
    textColor: "active:text-neutral-white",
    bgColor: "active:bg-commit-hover",
  },
  disabledStyle,
  radius: "rounded-button",
};
// Danger: destructive actions.
const dangerButton: Button = {
  textColor: "text-neutral-white",
  bgColor: "bg-danger border border-transparent",
  hoverStyle: {
    textColor: "hover:text-neutral-white",
    bgColor: "hover:bg-red-dark",
  },
  activeStyle: {
    textColor: "active:text-neutral-white",
    bgColor: "active:bg-red-dark",
  },
  disabledStyle,
  radius: "rounded-button",
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

export type ButtonSize = "sm" | "md";

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
    buttonSize: "md",
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

// Disabled with a reason stays focusable (aria-disabled), so keyboard users
// can reach the reason; clicks are stopped here instead of by the browser.
const disabledWithReason = computed<boolean>(
  () => props.disabled && !!props.tooltipLabel,
);

const blockClickWhenDisabled = (event: MouseEvent) => {
  if (disabledWithReason.value) event.stopImmediatePropagation();
};

// The disabled look without the :disabled variant, keeping the border width.
const unprefixed = ({ bgColor, disabledStyle }: Button): string =>
  [
    disabledStyle.textColor,
    disabledStyle.bgColor,
    ...bgColor.split(" ").filter((name) => name.startsWith("border")),
  ]
    .join(" ")
    .replaceAll("disabled:", "");

const hasIcon = computed<boolean>(() => props.icon !== DamsIcons.NoIcon);

const sizeClasses = computed<string>(() => {
  const iconOnly = !props.label;
  if (props.buttonSize === "sm")
    return iconOnly
      ? "text-button-sm p-(--button-sm-padding-icon)"
      : "text-button-sm p-(--button-sm-padding)";
  return iconOnly
    ? "text-button-md p-(--button-md-padding-icon)"
    : "text-button-md p-(--button-md-padding)";
});
</script>
