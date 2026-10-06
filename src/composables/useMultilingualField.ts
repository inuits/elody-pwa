import { computed, ref, type Ref, type ComputedRef, watch } from "vue";
import { useI18n } from "vue-i18n";

export type TranslationEntry = {
  key: string;
  value: string;
  lang: string;
};

export type MultilingualFieldProvide = {
  currentValue: ComputedRef<string>;
  selectedLocale: Ref<string>;
  localeOptions: ComputedRef<{ icon: undefined; label: string; value: string }[]>;
  isEnabled: ComputedRef<boolean>;
  showSelector: boolean;
  updateValue: (newValue: string) => void;
};

export const getMultilingualProvideKey = (fieldKey: string): string =>
  `multilingual:${fieldKey}`;

export type UseMultilingualFieldReturn = {
  selectedLocale: Ref<string>;
  currentValue: ComputedRef<string>;
  hasTranslationForLocale: ComputedRef<boolean>;
  localeOptions: ComputedRef<{ icon: undefined; label: string; value: string }[]>;
};

/**
 * Basic filtering (RFC 4647 §3.3.1): a value tagged en-US matches the
 * preferred language en.
 */
export const languageMatches = (tag: string | undefined, preferred: string): boolean => {
  if (!tag) return false;
  const t = tag.toLowerCase();
  const p = preferred.toLowerCase();
  return t === p || t.startsWith(`${p}-`);
};

/**
 * @param languageIn SHACL 1.2 UI sh:languageIn of the field: values are
 * preferred in this order, before the interface language, and the selector
 * offers only these languages.
 */
export const useMultilingualField = (
  translations: Ref<TranslationEntry[]>,
  fieldKey: string,
  languageIn: string[] = [],
): UseMultilingualFieldReturn => {
  const { availableLocales, locale, t } = useI18n();

  const preferredLocale = (appLocale: string): string =>
    [...languageIn, appLocale].find((preferred) =>
      translations.value.some((entry) => languageMatches(entry.lang, preferred)),
    ) ?? appLocale;

  const selectedLocale = ref<string>(preferredLocale(locale.value));

  const localeOptions = computed(() =>
    (languageIn.length ? languageIn : availableLocales).map((locale: string) => ({
      icon: undefined,
      label: t("language." + locale),
      value: locale,
    })),
  );

  const hasTranslationForLocale = computed(() =>
    translations.value.some((entry) =>
      languageMatches(entry.lang, selectedLocale.value),
    ),
  );

  const currentValue = computed({
    get: () => {
      const entry =
        translations.value.find((entry) => entry.lang === selectedLocale.value) ??
        translations.value.find((entry) =>
          languageMatches(entry.lang, selectedLocale.value),
        );
      return entry?.value ?? "";
    },
    set: (newValue: string) => {
      const index = translations.value.findIndex(
        (entry) => entry.lang === selectedLocale.value,
      );
      if (index >= 0) {
        translations.value[index].value = newValue;
      } else {
        translations.value.push({
          key: fieldKey,
          value: newValue,
          lang: selectedLocale.value,
        });
      }
    },
  });

  watch(locale, (newLocale) => {
    selectedLocale.value = preferredLocale(newLocale);
  });

  return {
    selectedLocale,
    currentValue,
    hasTranslationForLocale,
    localeOptions,
  };
};
