<template>
  <div class="flex flex-wrap items-center gap-1">
    <div
      v-for="entry in entries"
      :key="entry.label"
      :class="[
        size === 'lg' ? 'text-lg' : 'text-sm',
        'inline-flex items-center gap-1 flex-wrap gap-y-0.5',
        {
          'rounded-md bg-slate-800 border border-transparent': settingsFor(
            entry.label,
            entry.nested,
          ),
          'py-0.25 px-1 mt-1':
            settingsFor(entry.label) && size !== 'lg' && !entry.nested,
          'py-1 px-3': settingsFor(entry.label, entry.nested) && size === 'lg',
          'py-0.5 pl-2 pr-1 mt-1': size !== 'lg' && entry.nested,
        },
      ]"
      :style="{
        background: settingsFor(entry.label, entry.nested)?.background,
        color: settingsFor(entry.label, entry.nested)?.text,
      }"
    >
      <unicon
        v-if="iconFor(entry.label)"
        :name="iconFor(entry.label)?.name"
        :class="{
          'animate-spin [animation-direction:reverse]': settingsFor(entry.label)
            ?.spin,
        }"
        height="14"
        width="14"
      />
      <span :class="{ 'font-semibold': entry.nested }">{{
        entry.nested ? entry.label : displayValue(entry.label)
      }}</span>
      <span
        v-for="nestedValue in entry.values"
        :key="nestedValue"
        class="inline-flex items-center rounded-full border border-black/10 bg-white px-1.5 py-px text-xs font-normal text-slate-700 shadow-sm"
        :style="{
          background: nestedSettingsFor(nestedValue)?.background,
          color: nestedSettingsFor(nestedValue)?.text,
        }"
      >
        {{ displayValue(nestedValue) }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { formattersSettings } from "@/main";
import { useI18n } from "vue-i18n";
import { resolveOptionLabel } from "@/components/metadata/useValueTranslationKey";
import { Unicons } from "@/types";

type NestedPillEntry = { label: string; values: string[] };

const props = withDefaults(
  defineProps<{
    formatter: string;
    label: string | string[] | NestedPillEntry[];
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
const entries = computed<(NestedPillEntry & { nested: boolean })[]>(() =>
  (Array.isArray(props.label) ? props.label : [props.label])
    .filter(Boolean)
    .map((value) =>
      typeof value === "object"
        ? { ...value, values: value.values ?? [], nested: true }
        : { label: value, values: [], nested: false },
    ),
);

const RELATION_PILL_DEFAULT = { background: "#d6e2f0", text: "#1f3a5f" };

// Colours are keyed on the raw value, never on the translated display text —
// "medewerker" has no entry, its raw value "member" does.
const settingsFor = (value: string, isRelationLabel = false): any => {
  const [formatterType, configuredPillType] = props.formatter.split("|");
  if (configuredPillType === "auto")
    return { background: "#6DBBDE", text: "#FFFFFF" };
  const pillType = configuredPillType || value.toLowerCase();
  const settings = formattersSettings[formatterType]?.[pillType];
  if (settings || !isRelationLabel) return settings;
  return RELATION_PILL_DEFAULT;
};

const nestedSettingsFor = (value: string): any => {
  const [formatterType] = props.formatter.split("|");
  return formattersSettings[formatterType]?.[value.toLowerCase()];
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
