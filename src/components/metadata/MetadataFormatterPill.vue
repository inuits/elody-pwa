<template>
  <div
    :class="[
      size === 'lg' ? 'text-lg' : 'text-xs font-bold',
      {
        'rounded border border-transparent': pillSettings,
        'py-0.25 px-1 mt-1': pillSettings && size !== 'lg',
        'py-1 px-3': pillSettings && size === 'lg',
      },
    ]"
    :style="{
      background: pillSettings?.background,
      color: pillSettings?.text,
    }"
  >
    {{ displayValue }}
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { formattersSettings } from "@/main";
import { useI18n } from "vue-i18n";

const props = withDefaults(
  defineProps<{
    formatter: string;
    label: string;
    translationKey?: string;
    size?: "sm" | "lg";
  }>(),
  {
    translationKey: undefined,
    size: "sm",
  },
);

const { t } = useI18n();

// Design-system badge tones: a client config may reference a tone instead of
// raw hex values ({ tone: "tone1" }); vlacc maps W→tone1, E→tone2, M→tone3.
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

const pillSettings = computed(() => {
  const [formatterType, pillTypeInit] = props.formatter.split("|");
  let pillType = pillTypeInit;
  if (pillType === "auto") {
    return {
      background: "var(--color-chip-relation-bg)",
      text: "var(--color-chip-relation-text)",
    };
  }
  if (!pillType) pillType = props.label.toLowerCase();
  const settings = formattersSettings[formatterType]?.[pillType];
  if (settings?.tone && toneSettings[settings.tone])
    return toneSettings[settings.tone];
  return settings;
});

const displayValue = computed(() => {
  if (props.translationKey) {
    const key = props.translationKey;
    const normalizedTranslationKey = key.replace("$value", String(props.label));
    const translated = t(normalizedTranslationKey);
    if (translated !== normalizedTranslationKey) return translated;
  }

  return props.label;
});
</script>
