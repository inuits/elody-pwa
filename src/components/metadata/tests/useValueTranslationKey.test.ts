import { describe, expect, it } from "vitest";
import { resolveValueTranslationKey } from "../useValueTranslationKey";

const rolesField = {
  inputField: {
    options: [
      {
        label: "dropdown-labels.token-role-partner-read",
        value: "partner_read",
      },
      { label: "dropdown-labels.token-role-admin", value: "admin" },
    ],
  },
};

describe("resolveValueTranslationKey", () => {
  it("translates a plain value through the field's own options", () => {
    expect(
      resolveValueTranslationKey({ ...rolesField, value: "partner_read" }),
    ).toBe("dropdown-labels.token-role-partner-read");
  });

  it("translates a formatter value through its label", () => {
    expect(
      resolveValueTranslationKey({ ...rolesField, value: { label: "admin" } }),
    ).toBe("dropdown-labels.token-role-admin");
  });

  it("prefers an explicitly configured key", () => {
    expect(
      resolveValueTranslationKey({
        ...rolesField,
        value: "partner_read",
        valueTranslationKey: "explicit.key",
      }),
    ).toBe("explicit.key");
  });

  it("returns undefined for a value that matches no option", () => {
    expect(
      resolveValueTranslationKey({ ...rolesField, value: "nonsense" }),
    ).toBeUndefined();
  });

  it("returns undefined when the field has no options", () => {
    expect(
      resolveValueTranslationKey({ value: "partner_read" }),
    ).toBeUndefined();
    expect(
      resolveValueTranslationKey({ value: "x", inputField: { options: [] } }),
    ).toBeUndefined();
  });

  it("returns undefined for an empty or missing value", () => {
    expect(
      resolveValueTranslationKey({ ...rolesField, value: "" }),
    ).toBeUndefined();
    expect(resolveValueTranslationKey(undefined)).toBeUndefined();
  });
});
