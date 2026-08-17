<template>
  <div
    :class="[
      size === 'lg' ? 'text-lg' : 'pill-label',
      {
        pill: pillSettings,
        'pill--lg': pillSettings && size === 'lg',
        'pill--relation': isRelationChip,
      },
    ]"
    :style="configuredColours"
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

const pillType = computed(() => {
  const [, pillTypeInit] = props.formatter.split("|");
  return pillTypeInit || props.label.toLowerCase();
});

/** "auto" is the relation chip: a value whose click navigates. */
const isRelationChip = computed(() => props.formatter.split("|")[1] === "auto");

const pillSettings = computed(() => {
  if (isRelationChip.value) return true;
  const [formatterType] = props.formatter.split("|");
  // A client whose config declares no group for this formatter renders the
  // plain value rather than crashing the row it sits in.
  return formattersSettings[formatterType]?.[pillType.value];
});

/**
 * Only client-configured pills carry inline colours — those come from tenant
 * config, not from the design system. The relation chip is a design decision
 * and takes its fill from the tokens.
 */
const configuredColours = computed(() => {
  if (isRelationChip.value || !pillSettings.value) return undefined;
  return {
    background: pillSettings.value.background,
    color: pillSettings.value.text,
  };
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

<style scoped>
.pill-label {
  font-size: var(--text-label);
}

.pill {
  border-radius: var(--radius-chip);
  padding: var(--spacing-ds-1) var(--spacing-ds-3);
  margin-top: var(--spacing-ds-3);
  /* A chip is the size of its label; it does not depend on the call site
     adding w-fit to stop the fill spanning the whole row. */
  width: fit-content;
}

.pill--lg {
  padding: var(--spacing-ds-3) var(--spacing-ds-9);
  margin-top: 0;
}

.pill--relation {
  background: var(--color-chip-relation-bg);
  color: var(--color-chip-relation-text);
}
</style>
