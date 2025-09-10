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

  it("should validate values against regex pattern through the rule system", async () => {
    const { initializeInputValidation } = useInputValidation();
    initializeInputValidation({
      en: {
        "input-validation": {
          regex: "Value must match pattern {regex}",
        },
      },
    });
  });
});

describe("useInputValidation - _regexValidator", () => {
  const { __test__ } = useInputValidation();

  describe("__test__._regexValidator", () => {
    it("returns true for empty values", () => {
      expect(__test__._regexValidator("", { regex: /foo/ })).toBe(true);
      expect(__test__._regexValidator(null, { regex: /foo/ })).toBe(true);
      expect(__test__._regexValidator(undefined, { regex: /foo/ })).toBe(true);
      expect(__test__._regexValidator([], { regex: /foo/ })).toBe(true);
    });

    it("works with RegExp directly", () => {
      expect(__test__._regexValidator("abc", { regex: /^abc$/ })).toBe(true);
      expect(__test__._regexValidator("abcd", { regex: /^abc$/ })).toBe(false);
    });

    it("works with string regex (no pipes/commas)", () => {
      expect(__test__._regexValidator("hello", { regex: "^hello$" })).toBe(
        true,
      );
      expect(__test__._regexValidator("world", { regex: "^hello$" })).toBe(
        false,
      );
    });

    it("restores escaped pipes (?.)", () => {
      // original regex: ^(foo|bar)$
      const escaped = "^(foo?.bar)$";
      expect(__test__._regexValidator("foo", { regex: escaped })).toBe(true);
      expect(__test__._regexValidator("bar", { regex: escaped })).toBe(true);
      expect(__test__._regexValidator("baz", { regex: escaped })).toBe(false);
    });

    it("restores escaped commas (?.c)", () => {
      // original regex: ^[0-9]{2,3}$
      const escaped = "^[0-9]{2?.c3}$";
      expect(__test__._regexValidator("22", { regex: escaped })).toBe(true);
      expect(__test__._regexValidator("222", { regex: escaped })).toBe(true);
      expect(__test__._regexValidator("2", { regex: escaped })).toBe(false);
      expect(__test__._regexValidator("2222", { regex: escaped })).toBe(false);
    });

    it("restores both pipes and commas together", () => {
      const escaped = "^(foo?.bar){2?.c3}$";
      expect(__test__._regexValidator("foofoo", { regex: escaped })).toBe(true);
      expect(__test__._regexValidator("foobar", { regex: escaped })).toBe(true);
      expect(__test__._regexValidator("barfoo", { regex: escaped })).toBe(true);
      expect(__test__._regexValidator("foo", { regex: escaped })).toBe(false);
      expect(__test__._regexValidator("foofoofoofoo", { regex: escaped })).toBe(
        false,
      );
    });

    it("validates arrays of values", () => {
      const escaped = "^(a?.b)$";
      expect(__test__._regexValidator(["a", "b"], { regex: escaped })).toBe(
        true,
      );
      expect(__test__._regexValidator(["a", "c"], { regex: escaped })).toBe(
        false,
      );
    });

    it("returns false when regex does not match", () => {
      const escaped = "^abc$";
      expect(__test__._regexValidator("def", { regex: escaped })).toBe(false);
    });

    it("handles complex mixed escaping scenarios", () => {
      // original regex: ^(cat|dog|bird){1,2}_(red|blue|green){2,3}$
      const complexEscaped =
        "^(cat?.dog?.bird){1?.c2}_(red?.blue?.green){2?.c3}$";

      expect(
        __test__._regexValidator("cat_redred", { regex: complexEscaped }),
      ).toBe(true);
      expect(
        __test__._regexValidator("dogbird_blueblueblue", {
          regex: complexEscaped,
        }),
      ).toBe(true);
      expect(__test__._regexValidator("cat", { regex: complexEscaped })).toBe(
        false,
      );
      expect(
        __test__._regexValidator("bird_purplepurple", {
          regex: complexEscaped,
        }),
      ).toBe(false);
    });

    it("handles escaped sequences that look like escapes but aren't", () => {
      const literalPattern = "^test\\?\\..*\\.c$";
      expect(
        __test__._regexValidator("test?.anything.c", { regex: literalPattern }),
      ).toBe(true);
      expect(
        __test__._regexValidator("test|anything,", { regex: literalPattern }),
      ).toBe(false);
    });

    it("works with array parameter format", () => {
      const escaped = ["^(foo?.bar)$"];
      expect(__test__._regexValidator("foo", escaped)).toBe(true);
      expect(__test__._regexValidator("baz", escaped)).toBe(false);
    });

    it("handles edge cases with empty regex patterns", () => {
      expect(__test__._regexValidator("any", { regex: "" })).toBe(true);
      expect(__test__._regexValidator("", { regex: "" })).toBe(true);
    });

    it("handles multiple comma escapes in quantifiers", () => {
      // original regex: ^[a-z]{1,3}[0-9]{2,5}[A-Z]{3,7}$
      const multiComma = "^[a-z]{1?.c3}[0-9]{2?.c5}[A-Z]{3?.c7}$";

      expect(__test__._regexValidator("a12ABC", { regex: multiComma })).toBe(
        true,
      );
      expect(
        __test__._regexValidator("abc12345ABCDEFG", { regex: multiComma }),
      ).toBe(true);
      expect(
        __test__._regexValidator("abcd123ABCDEFGH", { regex: multiComma }),
      ).toBe(false);
    });

    it("handles pipe escapes in character classes", () => {
      // original regex: ^[a-z|0-9]+$
      const pipeInClass = "^[a-z?.0-9]+$";
      expect(__test__._regexValidator("a|1|b", { regex: pipeInClass })).toBe(
        true,
      );
      expect(__test__._regexValidator("a-1-b", { regex: pipeInClass })).toBe(
        false,
      );
    });
  });
});
