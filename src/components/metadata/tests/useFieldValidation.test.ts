import { describe, expect, it } from "vitest";
import { ValidationRules, type Validation } from "@/generated-types/queries";
import { useFieldValidation } from "@/components/metadata/useFieldValidation";

const rulesFor = (
  validation: Validation | undefined,
  isFieldRequired = false,
): string =>
  useFieldValidation(() => validation).getValidationRules(
    true,
    isFieldRequired,
  );

describe("useFieldValidation", () => {
  it("applies no_xss by default", () => {
    expect(rulesFor(undefined)).toBe("no_xss");
    expect(rulesFor({ value: [ValidationRules.Email] } as Validation)).toBe(
      "no_xss|email",
    );
  });

  it("drops the default no_xss when the validation is no_defaults", () => {
    expect(
      rulesFor({ value: [ValidationRules.NoDefaults] } as Validation),
    ).toBe("");
  });

  it("keeps other rules next to no_defaults", () => {
    expect(
      rulesFor({
        value: [ValidationRules.NoDefaults, ValidationRules.Email],
      } as Validation),
    ).toBe("email");
  });

  it("adds required without a leading separator when the validation is no_defaults", () => {
    expect(
      rulesFor({ value: [ValidationRules.NoDefaults] } as Validation, true),
    ).toBe("required");
  });
});
