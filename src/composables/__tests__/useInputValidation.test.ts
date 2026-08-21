import { describe, it, expect } from "vitest";
import { useInputValidation } from "@/composables/useInputValidation";
import { EditStatus, ValidationRules } from "@/generated-types/queries";
import { validate } from "vee-validate";

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

describe("useInputValidation - _getHasMinMaxAmountOfRelationsRule", () => {
  const { __test__ } = useInputValidation();
  // vee-validate splits the rule params on commas, so the real call receives
  // three params; the colon form stays supported for hand written rule strings.
  const rule = (value: any, parameter: string) =>
    __test__._getHasMinMaxAmountOfRelationsRule(value, parameter.split(","));

  const relation = (
    type: string,
    editStatus: EditStatus = EditStatus.Unchanged,
  ) => ({ key: `${type}-key`, type, editStatus });

  it("treats an untouched field (no relations on the form) as zero relations", () => {
    expect(rule(undefined, "refLabelGenres,0,1")).toBe(true);
    expect(rule(null, "refLabelGenres,0,1")).toBe(true);
    expect(rule([], "refLabelGenres,0,1")).toBe(true);
  });

  it("fails when a minimum is required and no relations are present", () => {
    expect(rule(undefined, "refLabelGenres,1,2")).toBe(false);
    expect(rule([], "refLabelGenres,1,2")).toBe(false);
  });

  it("accepts an amount of relations within the min/max range", () => {
    expect(rule([relation("refLabelGenres")], "refLabelGenres,0,1")).toBe(true);
    expect(
      rule(
        [relation("refLabelGenres"), relation("refLabelGenres")],
        "refLabelGenres,1,2",
      ),
    ).toBe(true);
  });

  it("rejects more relations than the maximum", () => {
    expect(
      rule(
        [relation("refLabelGenres"), relation("refLabelGenres")],
        "refLabelGenres,0,1",
      ),
    ).toBe(false);
  });

  it("does not count deleted relations", () => {
    expect(
      rule(
        [
          relation("refLabelGenres"),
          relation("refLabelGenres", EditStatus.Deleted),
        ],
        "refLabelGenres,0,1",
      ),
    ).toBe(true);
    expect(
      rule(
        [relation("refLabelGenres", EditStatus.Deleted)],
        "refLabelGenres,1,1",
      ),
    ).toBe(false);
  });

  it("only counts relations of the configured type", () => {
    expect(
      rule(
        [relation("refOtherGenres"), relation("refOtherGenres")],
        "refLabelGenres,0,1",
      ),
    ).toBe(true);
    expect(rule([relation("refOtherGenres")], "refLabelGenres,1,1")).toBe(
      false,
    );
  });

  it("falls back to sane bounds when min or max is not a number", () => {
    expect(rule([relation("refLabelGenres")], "refLabelGenres,,")).toBe(true);
    expect(rule([], "refLabelGenres,,")).toBe(true);
    expect(
      rule([relation("refLabelGenres")], "refLabelGenres,0,notANumber"),
    ).toBe(true);
  });

  it("reports the configured bounds in the failure message", async () => {
    const { initializeInputValidation } = useInputValidation();
    initializeInputValidation({
      en: {
        "input-validation": {
          messages: {
            _default: "{field} is niet geldig",
            has_min_max_amount_of_relations:
              "{field} moet tussen 1:{min} en 2:{max} relaties bevatten",
          },
        },
      },
    });

    const result = await validate(
      [relation("refLabelGenres"), relation("refLabelGenres")],
      `no_xss|${ValidationRules.HasMinMaxAmountOfRelations}:refLabelGenres,0,1`,
      { name: "Genre op etiket" },
    );

    expect(result.valid).toBe(false);
    expect(result.errors[0]).toBe(
      "Genre op etiket moet tussen 0 en 1 relaties bevatten",
    );
  });

  it("also accepts a single colon separated param", () => {
    const colonRule = (value: any, parameter: string) =>
      __test__._getHasMinMaxAmountOfRelationsRule(value, [parameter]);

    expect(colonRule(undefined, "refLabelGenres:0:1")).toBe(true);
    expect(colonRule([relation("refLabelGenres")], "refLabelGenres:0:1")).toBe(
      true,
    );
    expect(
      colonRule(
        [relation("refLabelGenres"), relation("refLabelGenres")],
        "refLabelGenres:0:1",
      ),
    ).toBe(false);
  });
});
