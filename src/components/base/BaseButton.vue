<template>
  <button
    data-cy="base-button"
    type="button"
    :disabled="disabled || loading"
    class="ds-button"
    :class="[`ds-button--${buttonStyle}`, `ds-button--${buttonSize}`]"
    :aria-busy="loading || undefined"
  >
    <spinner-loader v-if="loading" theme="inherit" :dimensions="4" />
    <unicon
      v-else-if="props.icon !== DamsIcons.NoIcon"
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

    <base-tooltip
      v-if="disabled && tooltipLabel"
      position="top-right"
      :tooltip-offset="8"
    >
      <template #activator="{ on }">
        <span v-on="on" class="flex items-center">
          <unicon :name="Unicons.QuestionCircle.name" height="16" />
        </span>
      </template>
      <template #default>
        <span class="text-[length:var(--text-table)]">{{ t(tooltipLabel) }}</span>
      </template>
    </base-tooltip>
  </button>
</template>

<script lang="ts" setup>
import { DamsIcons } from "@/generated-types/queries";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import BaseTooltip from "./BaseTooltip.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";

/**
 * primary   — accent fill; the one action a screen leads with
 * commit    — commit teal; writes the change (Bewaar)
 * secondary — surface + border; everything alongside
 * ghost     — borderless, label ink; dense toolbars
 * danger    — destructive, and only ever with a confirmation path
 */
export type ButtonStyle =
  | "primary"
  | "commit"
  | "secondary"
  | "ghost"
  | "danger";

export type ButtonSize = "md" | "sm";

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
  }>(),
  {
    icon: DamsIcons.NoIcon,
    buttonStyle: "secondary",
    buttonSize: "md",
    disabled: false,
    iconHeight: 16,
    loading: false,
    forceShowLabel: false,
  },
);

const { t } = useI18n();
</script>

<style scoped>
.ds-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-ds-5);
  width: 100%;
  font: inherit;
  font-weight: 700;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: var(--radius-button);
  cursor: pointer;
  transition:
    background-color var(--transition-duration-ui) var(--ease-ui),
    box-shadow var(--transition-duration-ui) var(--ease-ui),
    transform var(--transition-duration-ui) var(--ease-ui);
}

.ds-button:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}

.ds-button:not(:disabled):active {
  transform: scale(var(--scale-press));
}

/* Sizes */
.ds-button--md {
  font-size: var(--text-ui);
  padding: var(--spacing-ds-5) var(--spacing-ds-10);
}

.ds-button--sm {
  font-size: var(--text-label);
  padding: var(--spacing-ds-2) var(--spacing-ds-8);
}

/* Variants */
.ds-button--primary {
  background-color: var(--color-accent);
  color: var(--color-text-on-accent);
}

.ds-button--primary:not(:disabled):hover {
  background-color: var(--color-accent-hover);
  box-shadow: 0 2px 6px color-mix(in srgb, var(--color-accent) 40%, transparent);
}

.ds-button--commit {
  background-color: var(--color-commit);
  color: var(--color-text-on-accent);
}

.ds-button--commit:not(:disabled):hover {
  background-color: var(--color-commit-strong-hover);
  box-shadow: 0 2px 6px color-mix(in srgb, var(--color-commit) 40%, transparent);
}

.ds-button--secondary {
  background-color: var(--color-surface);
  border-color: var(--color-border-default);
  border-radius: var(--radius-input);
  color: var(--color-text-body);
}

.ds-button--secondary:not(:disabled):hover {
  background-color: var(--color-surface-muted);
}

.ds-button--ghost {
  background-color: transparent;
  color: var(--color-text-field-label);
}

.ds-button--ghost:not(:disabled):hover {
  background-color: var(--color-surface-editable-hover);
}

.ds-button--danger {
  background-color: var(--color-danger);
  color: var(--color-text-on-accent);
}

.ds-button--danger:not(:disabled):hover {
  background-color: var(--color-danger);
  box-shadow: 0 2px 6px color-mix(in srgb, var(--color-danger) 40%, transparent);
}

/* One disabled treatment for every variant. A loading button is disabled for
   input but keeps its variant — it is working, not unavailable. */
.ds-button:disabled:not([aria-busy]) {
  background-color: var(--color-surface-muted);
  border-color: transparent;
  color: var(--color-text-disabled);
  cursor: auto;
  box-shadow: none;
}
</style>
