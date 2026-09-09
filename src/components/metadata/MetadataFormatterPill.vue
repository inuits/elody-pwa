<template>
  <div class="flex flex-wrap items-center gap-1">
    <div
      v-for="value in values"
      :key="value"
      :class="[
        size === 'lg' ? 'text-lg' : 'text-sm',
        'inline-flex items-center gap-1',
        {
          'rounded-md bg-slate-800 border border-transparent':
            settingsFor(value),
          'py-0.25 px-1 mt-1': settingsFor(value) && size !== 'lg',
          'py-1 px-3': settingsFor(value) && size === 'lg',
        },
      ]"
      :style="{
        background: settingsFor(value)?.background,
        color: settingsFor(value)?.text,
      }"
    >
      <unicon
        v-if="iconFor(value)"
        :name="iconFor(value)?.name"
        :class="{
          'animate-spin [animation-direction:reverse]': settingsFor(value)?.spin,
        }"
        height="14"
        width="14"
      />
      <span>{{ displayValue(value) }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { formattersSettings } from "@/main";
import { useI18n } from "vue-i18n";
import { resolveOptionLabel } from "@/components/metadata/useValueTranslationKey";
import { Unicons } from "@/types";

const props = withDefaults(
  defineProps<{
    formatter: string;
    label: string | string[];
    translationKey?: string;
    valueOptions?: any[];
    size?: "sm" | "lg";
  }>(),
  {
    translationKey: undefined,
    size: "sm",
  },
);

const { t } = useI18n();

// Every value gets its own pill: one pill cannot carry two colours, and a
// joined string has no entry in formattersSettings to look up.
const values = computed<string[]>(() =>
  (Array.isArray(props.label) ? props.label : [props.label]).filter(Boolean),
);

// Design-system badge tones: a client config may reference a tone instead of
// raw hex values ({ tone: "tone1" }); vlacc maps W->tone1, E->tone2, M->tone3.
const toneSettings: Record<string, { background: string; text: string }> = {
  tone1: {
    background: "var(--color-badge-tone1-bg)",
    text: "var(--color-badge-tone1-text)",
  },
  tone2: {
    background: "var(--color-badge-tone2-bg)",
    text: "var(--color-badge-tone2-text)",
  },
  tone3: {
    background: "var(--color-badge-tone3-bg)",
    text: "var(--color-badge-tone3-text)",
  },
  subtype: {
    background: "var(--color-badge-subtype-bg)",
    text: "var(--color-badge-subtype-text)",
  },
};

// Colours are keyed on the raw value, never on the translated display text —
// "medewerker" has no entry, its raw value "member" does.
const settingsFor = (value: string): any => {
  const [formatterType, configuredPillType] = props.formatter.split("|");
  if (configuredPillType === "auto")
    return {
      background: "var(--color-chip-relation-bg)",
      text: "var(--color-chip-relation-text)",
    };
  const pillType = configuredPillType || value.toLowerCase();
  const settings = formattersSettings[formatterType]?.[pillType];
  if (settings?.tone && toneSettings[settings.tone])
    return toneSettings[settings.tone];
  return settings;
};

const iconFor = (value: string) => Unicons[settingsFor(value)?.icon];

const displayValue = (value: string): string => {
  const key = props.translationKey
    ? props.translationKey.replace("$value", value)
    : resolveOptionLabel(value, props.valueOptions);
  if (!key) return value;

  const translated = t(key);
  return translated !== key ? translated : value;
};
</script>
