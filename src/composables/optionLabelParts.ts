import type { TranslationEntry } from "@/composables/useMultilingualField";

export type OptionLabelParts = {
  label?: string;
  secondaryLabel?: string;
};

export const resolveTranslationLabel = (
  value: string | TranslationEntry[],
  locale: string,
): string => {
  if (Array.isArray(value)) {
    return (
      value.find((entry) => entry.lang === locale)?.value ??
      value[0]?.value ??
      ""
    );
  }
  return value;
};

const resolveOptionLabelValue = (value: unknown, locale: string): string => {
  if (!Array.isArray(value)) return value ? String(value) : "";
  if (value.some((entry) => typeof entry === "object" && entry?.lang))
    return resolveTranslationLabel(value as TranslationEntry[], locale);
  return value.filter(Boolean).join(", ");
};

export const getOptionLabelParts = (
  intialValues: Record<string, unknown> | undefined,
  optionLabelKeys: string[] | undefined,
  locale: string,
): OptionLabelParts => {
  const labelParts = (optionLabelKeys ?? [])
    .map((key) => resolveOptionLabelValue(intialValues?.[key], locale))
    .filter(Boolean);
  const [label, ...secondaryLabelParts] = labelParts;
  return {
    label,
    secondaryLabel: secondaryLabelParts.join(" · ") || undefined,
  };
};
