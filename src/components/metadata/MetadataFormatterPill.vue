<template>
  <div class="flex flex-wrap items-center gap-1">
    <div
      v-for="entry in entries"
      :key="entry.label"
      :class="pillClasses(entry)"
      v-bind="badgeAttrs(entry)"
      :style="{
        background: settingsFor(entry.label, entry.nested)?.background,
        color: settingsFor(entry.label, entry.nested)?.text,
      }"
    >
      <template v-if="isBadge(entry)">{{ badgeLetter(entry.label) }}</template>
      <template v-else>
        <unicon
          v-if="iconFor(entry.label)"
          :name="iconFor(entry.label)?.name"
          :class="{
            'animate-spin [animation-direction:reverse]': settingsFor(
              entry.label,
            )?.spin,
          }"
          height="14"
          width="14"
        />
        <span :class="{ 'font-semibold': entry.nested }">{{
          entry.nested ? entry.label : displayValue(entry.label)
        }}</span>
        <span
          v-for="nestedValue in entry.values"
          :key="nestedValue.value"
          :title="nestedTitle(nestedValue)"
          class="inline-flex items-center rounded-full border border-black/10 bg-white px-1.5 py-px text-xs font-normal text-slate-700 shadow-sm"
          :style="{
            background: nestedSettingsFor(nestedValue.value)?.background,
            color: nestedSettingsFor(nestedValue.value)?.text,
          }"
        >
          {{ displayValue(nestedValue.value) }}
        </span>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { formattersSettings } from "@/main";
import { useI18n } from "vue-i18n";
import { resolveOptionLabel } from "@/components/metadata/useValueTranslationKey";
import { Unicons } from "@/types";

type NestedPillValue = { key: string; value: string };
type NestedPillEntry = {
  label: string;
  values: (NestedPillValue | string)[];
};

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

const toNestedValue = (value: NestedPillValue | string): NestedPillValue =>
  typeof value === "object" ? value : { key: "", value };

// Every value gets its own pill: one pill cannot carry two colours, and a
// joined string has no entry in formattersSettings to look up.
const entries = computed<
  { label: string; values: NestedPillValue[]; nested: boolean }[]
>(() =>
  (Array.isArray(props.label) ? props.label : [props.label])
    .filter(Boolean)
    .map((value) =>
      typeof value === "object"
        ? {
            label: value.label,
            values: (value.values ?? []).map(toNestedValue),
            nested: true,
          }
        : { label: value, values: [], nested: false },
    ),
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

const RELATION_PILL_DEFAULT = {
  background: "var(--color-chip-neutral-bg)",
  text: "var(--color-chip-neutral-text)",
};

// Colours are keyed on the raw value, never on the translated display text —
// "medewerker" has no entry, its raw value "member" does.
const settingsFor = (value: string, isRelationLabel = false): any => {
  const [formatterType, configuredPillType] = props.formatter.split("|");
  if (configuredPillType === "auto")
    return {
      background: "var(--color-chip-relation-bg)",
      text: "var(--color-chip-relation-text)",
    };
  const pillType = configuredPillType || value.toLowerCase();
  const settings = formattersSettings[formatterType]?.[pillType];
  // A tone supplies the colours; icon, shape and letter stay from config.
  if (settings?.tone && toneSettings[settings.tone])
    return { ...settings, ...toneSettings[settings.tone] };
  if (settings || !isRelationLabel) return settings;
  return RELATION_PILL_DEFAULT;
};

const nestedSettingsFor = (value: string): any => {
  const [formatterType] = props.formatter.split("|");
  return formattersSettings[formatterType]?.[value.toLowerCase()];
};

const iconFor = (value: string) => Unicons[settingsFor(value)?.icon];

type PillEntry = { label: string; values: NestedPillValue[]; nested: boolean };

// A config entry with shape "badge" renders as a letter badge
// (e.g. { tone: "tone1", shape: "badge", letter: "W" }).
const isBadge = (entry: PillEntry): boolean =>
  !entry.nested && settingsFor(entry.label)?.shape === "badge";

const badgeLetter = (value: string): string =>
  settingsFor(value)?.letter ?? displayValue(value).charAt(0).toUpperCase();

const badgeAttrs = (entry: PillEntry) =>
  isBadge(entry)
    ? { role: "img", "aria-label": displayValue(entry.label) }
    : {};

// Sizes and padding come from the chip/badge component tokens.
const pillClasses = (entry: PillEntry): string[] => {
  const settings = settingsFor(entry.label, entry.nested);
  const layout = "inline-flex items-center gap-1 flex-wrap gap-y-0.5";
  if (!settings) return [layout, props.size === "lg" ? "text-lg" : "text-sm"];

  const colours = settings.background
    ? []
    : ["bg-chip-neutral-bg", "text-chip-neutral-text"];
  const shape = "rounded-chip border border-transparent";

  if (isBadge(entry))
    return [
      "inline-flex items-center justify-center mt-1",
      "text-badge font-black h-(--badge-size) min-w-(--badge-size) px-(--badge-padding-x)",
      shape,
      ...colours,
    ];
  if (entry.nested)
    return [layout, "text-chip py-0.5 pl-2 pr-1 mt-1", shape, ...colours];
  if (props.size === "lg")
    return [
      layout,
      "text-chip-lg font-bold p-(--chip-padding-lg)",
      shape,
      ...colours,
    ];
  return [
    layout,
    "text-chip font-bold p-(--chip-padding) mt-1",
    shape,
    ...colours,
  ];
};

// Names what the chip is, since a value like "programmer" does not say by
// itself that it is a function rather than a role.
const nestedTitle = ({ key, value }: NestedPillValue): string | undefined => {
  if (!key) return undefined;
  const keyTranslation = t(`metadata.labels.${key}`);
  const name =
    keyTranslation === `metadata.labels.${key}` ? key : keyTranslation;
  return `${name}: ${displayValue(value)}`;
};

const displayValue = (value: string): string => {
  const key = props.translationKey
    ? props.translationKey.replace("$value", value)
    : resolveOptionLabel(value, props.valueOptions);
  if (!key) return value;

  const translated = t(key);
  return translated !== key ? translated : value;
};
</script>
