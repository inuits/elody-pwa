import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useMultilingualField } from "@/composables/useMultilingualField";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    availableLocales: ["en", "fr", "ar"],
    locale: { value: "en" },
    t: (key: string) => key,
  }),
}));

const makeTranslations = (
  entries: { key: string; value: string; lang: string }[],
) => ref(entries);

describe("useMultilingualField", () => {
  describe("initialization", () => {
    it("defaults selectedLocale to the global app locale", () => {
      const translations = makeTranslations([
        { key: "title", value: "Bonjour", lang: "fr" },
      ]);
      const { selectedLocale } = useMultilingualField(translations, "title");
      expect(selectedLocale.value).toBe("en");
    });

    it("defaults to global locale even when no translations exist", () => {
      const translations = makeTranslations([]);
      const { selectedLocale } = useMultilingualField(translations, "title");
      expect(selectedLocale.value).toBe("en");
    });
  });

  describe("currentValue", () => {
    it("returns the value for the selected locale", () => {
      const translations = makeTranslations([
        { key: "title", value: "Hello", lang: "en" },
        { key: "title", value: "Bonjour", lang: "fr" },
      ]);
      const { currentValue } = useMultilingualField(translations, "title");
      expect(currentValue.value).toBe("Hello");
    });

    it("returns empty string when no translation exists for selected locale", () => {
      const translations = makeTranslations([
        { key: "title", value: "Bonjour", lang: "fr" },
      ]);
      const { selectedLocale, currentValue } = useMultilingualField(
        translations,
        "title",
      );
      selectedLocale.value = "en";
      expect(currentValue.value).toBe("");
    });

    it("updates the correct entry when setting a value", () => {
      const translations = makeTranslations([
        { key: "title", value: "Hello", lang: "en" },
        { key: "title", value: "Bonjour", lang: "fr" },
      ]);
      const { currentValue } = useMultilingualField(translations, "title");
      currentValue.value = "Hi there";
      expect(translations.value[0].value).toBe("Hi there");
    });

    it("creates a new entry when setting value for a locale with no translation", () => {
      const translations = makeTranslations([
        { key: "title", value: "Hello", lang: "en" },
      ]);
      const { selectedLocale, currentValue } = useMultilingualField(
        translations,
        "title",
      );
      selectedLocale.value = "fr";
      currentValue.value = "Bonjour";
      expect(translations.value).toHaveLength(2);
      expect(translations.value[1]).toEqual({
        key: "title",
        value: "Bonjour",
        lang: "fr",
      });
    });
  });

  describe("hasTranslationForLocale", () => {
    it("returns true when translation exists", () => {
      const translations = makeTranslations([
        { key: "title", value: "Hello", lang: "en" },
      ]);
      const { hasTranslationForLocale } = useMultilingualField(
        translations,
        "title",
      );
      expect(hasTranslationForLocale.value).toBe(true);
    });

    it("returns false when no translation exists for selected locale", () => {
      const translations = makeTranslations([
        { key: "title", value: "Bonjour", lang: "fr" },
      ]);
      const { selectedLocale, hasTranslationForLocale } =
        useMultilingualField(translations, "title");
      selectedLocale.value = "en";
      expect(hasTranslationForLocale.value).toBe(false);
    });
  });

  describe("localeOptions", () => {
    it("builds dropdown options from available locales", () => {
      const translations = makeTranslations([]);
      const { localeOptions } = useMultilingualField(translations, "title");
      expect(localeOptions.value).toEqual([
        { icon: undefined, label: "language.en", value: "en" },
        { icon: undefined, label: "language.fr", value: "fr" },
        { icon: undefined, label: "language.ar", value: "ar" },
      ]);
    });
  });

  describe("locale switching", () => {
    it("switching locale changes currentValue", () => {
      const translations = makeTranslations([
        { key: "title", value: "Hello", lang: "en" },
        { key: "title", value: "Bonjour", lang: "fr" },
      ]);
      const { selectedLocale, currentValue } = useMultilingualField(
        translations,
        "title",
      );
      expect(currentValue.value).toBe("Hello");
      selectedLocale.value = "fr";
      expect(currentValue.value).toBe("Bonjour");
    });

    it("preserves edits when switching locales back and forth", () => {
      const translations = makeTranslations([
        { key: "title", value: "Hello", lang: "en" },
        { key: "title", value: "Bonjour", lang: "fr" },
      ]);
      const { selectedLocale, currentValue } = useMultilingualField(
        translations,
        "title",
      );
      currentValue.value = "Hi";
      selectedLocale.value = "fr";
      currentValue.value = "Salut";
      selectedLocale.value = "en";
      expect(currentValue.value).toBe("Hi");
      selectedLocale.value = "fr";
      expect(currentValue.value).toBe("Salut");
    });
  });

  // SHACL 1.2 UI: implementations MUST prefer language-tagged values in the
  // order of sh:languageIn, before the application's language.
  describe("sh:languageIn", () => {
    it("selects the first declared language that has a value, before the app locale", () => {
      const translations = makeTranslations([
        { key: "name", value: "Alice", lang: "en" },
        { key: "name", value: "Alice (fr)", lang: "fr" },
      ]);
      const { selectedLocale, currentValue } = useMultilingualField(translations, "name", ["fr", "en"]);
      expect(selectedLocale.value).toBe("fr");
      expect(currentValue.value).toBe("Alice (fr)");
    });

    it("skips a declared language without a value", () => {
      const translations = makeTranslations([{ key: "name", value: "Alice", lang: "en" }]);
      const { selectedLocale } = useMultilingualField(translations, "name", ["fr", "en"]);
      expect(selectedLocale.value).toBe("en");
    });

    it("falls back to the app locale when no declared language has a value", () => {
      const translations = makeTranslations([{ key: "name", value: "Alice", lang: "en" }]);
      const { selectedLocale } = useMultilingualField(translations, "name", ["de"]);
      expect(selectedLocale.value).toBe("en");
    });

    it("matches language tags by basic filtering (en-US for en)", () => {
      const translations = makeTranslations([{ key: "name", value: "Alice", lang: "en-US" }]);
      const { selectedLocale, currentValue } = useMultilingualField(translations, "name", ["fr", "en"]);
      expect(selectedLocale.value).toBe("en");
      expect(currentValue.value).toBe("Alice");
    });

    it("offers only the declared languages in the selector", () => {
      const translations = makeTranslations([]);
      const { localeOptions } = useMultilingualField(translations, "name", ["fr", "en"]);
      expect(localeOptions.value.map((option) => option.value)).toEqual(["fr", "en"]);
    });

    it("keeps today's behaviour without sh:languageIn", () => {
      const translations = makeTranslations([{ key: "name", value: "Bonjour", lang: "fr" }]);
      const { selectedLocale, localeOptions } = useMultilingualField(translations, "name");
      expect(selectedLocale.value).toBe("en");
      expect(localeOptions.value.map((option) => option.value)).toEqual(["en", "fr", "ar"]);
    });
  });
});
