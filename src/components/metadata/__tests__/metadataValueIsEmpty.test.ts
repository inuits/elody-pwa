import { describe, expect, it } from "vitest";
import { metadataValueIsEmpty } from "@/components/metadata/useMetadataWrapper";

describe("metadataValueIsEmpty", () => {
  it("treats undefined and null as empty", () => {
    expect(metadataValueIsEmpty(undefined)).toBe(true);
    expect(metadataValueIsEmpty(null)).toBe(true);
  });

  it("treats empty and whitespace-only strings as empty", () => {
    expect(metadataValueIsEmpty("")).toBe(true);
    expect(metadataValueIsEmpty("   ")).toBe(true);
  });

  it("treats empty arrays as empty", () => {
    expect(metadataValueIsEmpty([])).toBe(true);
  });

  it("treats non-empty strings and arrays as filled", () => {
    expect(metadataValueIsEmpty("De helaasheid der dingen")).toBe(false);
    expect(metadataValueIsEmpty(["9789023456789"])).toBe(false);
  });

  it("treats booleans and numbers as filled (a false checkbox is a value)", () => {
    expect(metadataValueIsEmpty(false)).toBe(false);
    expect(metadataValueIsEmpty(0)).toBe(false);
  });

  it("treats objects as filled", () => {
    expect(metadataValueIsEmpty({ label: "x" })).toBe(false);
  });
});
