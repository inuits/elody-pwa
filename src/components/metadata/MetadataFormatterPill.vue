<template>
  <div
    class="text-sm"
    :class="{
      'rounded-md bg-slate-800 py-0.25 px-1 mt-1 border border-transparent':
        pillSettings,
    }"
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

const props = defineProps<{
  formatter: string;
  label: string;
  translationKey?: string;
}>();

const { t } = useI18n();

const pillSettings = computed(() => {
  let [formatterType, pillType] = props.formatter.split("|");
  if (pillType === "auto") {
    return {background: props.label, text: "#FFFFFF"}
  } else {
    if (!pillType) pillType = props.label.toLowerCase();
    return formattersSettings[formatterType][pillType];
  }
});

const displayValue = computed(() => {
  if (props.translationKey) {
    const key = props.translationKey;
    const normalizedTranslationKey = key.replace(
      "$value",
      String(props.label),
    );
    const translated = t(normalizedTranslationKey);
    if (translated !== normalizedTranslationKey) return translated;
  }

  return props.label;
});
</script>
