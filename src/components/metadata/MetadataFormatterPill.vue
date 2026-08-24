<template>
  <div class="flex flex-wrap items-center gap-1">
    <div
      v-for="value in values"
      :key="value"
      :class="[
        size === 'lg' ? 'text-lg' : 'text-sm',
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
      {{ displayValue(value) }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { formattersSettings } from "@/main";
import { useI18n } from "vue-i18n";

const props = withDefaults(
  defineProps<{
    formatter: string;
    label: string | string[];
    translationKey?: string;
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

// Colours are keyed on the raw value, never on the translated display text —
// "medewerker" has no entry, its raw value "member" does.
const settingsFor = (value: string) => {
  const [formatterType, configuredPillType] = props.formatter.split("|");
  if (configuredPillType === "auto")
    return { background: "#6DBBDE", text: "#FFFFFF" };
  const pillType = configuredPillType || value.toLowerCase();
  return formattersSettings[formatterType]?.[pillType];
};

const displayValue = (value: string): string => {
  if (!props.translationKey) return value;
  const key = props.translationKey.replace("$value", value);
  const translated = t(key);
  return translated !== key ? translated : value;
};
</script>
