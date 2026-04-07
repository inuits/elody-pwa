import { computed, ref, type Ref, type ComputedRef } from "vue";
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

export const useMultilingualField = (
  translations: Ref<TranslationEntry[]>,
  fieldKey: string,
): UseMultilingualFieldReturn => {
  const { availableLocales, locale, t } = useI18n();

  const selectedLocale = ref<string>(locale.value);

  const localeOptions = computed(() =>
    availableLocales.map((locale: string) => ({
      icon: undefined,
      label: t("language." + locale),
      value: locale,
    })),
  );

  const hasTranslationForLocale = computed(() =>
    translations.value.some(
      (entry) => entry.lang === selectedLocale.value,
    ),
  );

  const currentValue = computed({
    get: () => {
      const entry = translations.value.find(
        (entry) => entry.lang === selectedLocale.value,
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

  return {
    selectedLocale,
    currentValue,
    hasTranslationForLocale,
    localeOptions,
  };
};
