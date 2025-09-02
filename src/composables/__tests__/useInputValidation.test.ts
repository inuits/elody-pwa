import { describe, it, expect } from "vitest";
import { useInputValidation } from "@/composables/useInputValidation";

describe("useInputValidation", () => {
  const { extractValidationTranslationsFromAllTranslations } =
    useInputValidation();

  const mockTranslations = {
    nl: {
      "entity-translations": {
        singular: {
          BaseEntity: "basis entiteit",
        },
      },
      audio: {
        "no-support": "Uw browser ondersteund het audio element niet",
      },
      "input-validation": {
        messages: {
          _default: "{field} is niet geldig",
          required: "{field} is verplicht",
          between: "{field} moet tussen {min} en {max} zijn",
        },
      },
    },
    en: {
      "entity-translations": {
        singular: {
          BaseEntity: "base entity",
        },
      },
      audio: {
        "no-support": "Your browser does not support the audio element",
      },
      "input-validation": {
        messages: {
          _default: "{field} is not valid",
          required: "{field} is required",
          between: "{field} must be between {min} and {max}",
        },
      },
    },
    ar: {
      "entity-translations": {
        singular: {
          BaseEntity: "base entity",
        },
      },
    },
  };

  it("Should add all translations that include as key 'input-validation' to the vee-validate/i18n localize function", () => {
    const validationTranslations =
      extractValidationTranslationsFromAllTranslations(mockTranslations);

    expect(validationTranslations).toHaveProperty("en");
    expect(validationTranslations["en"]).toBe(
      mockTranslations["en"]["input-validation"],
    );
    expect(validationTranslations).toHaveProperty("nl");
    expect(validationTranslations["nl"]).toBe(
      mockTranslations["nl"]["input-validation"],
    );
    expect(validationTranslations).not.toHaveProperty("ar");
  });
});
