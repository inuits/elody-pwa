import { describe, it, expect } from "vitest";
import { wrappedChipsWidth } from "@/components/metadata/wrappedChipsWidth";

const chip = (top: number, right: number) => ({ top, right });

describe("wrappedChipsWidth", () => {
  it("leaves chips on one line alone", () => {
    expect(wrappedChipsWidth(100, [chip(10, 160), chip(10, 230)])).toBeUndefined();
  });

  it("leaves a single chip alone", () => {
    expect(wrappedChipsWidth(100, [chip(10, 160)])).toBeUndefined();
  });

  it("hugs wrapped chips: the width ends at the widest line", () => {
    expect(
      wrappedChipsWidth(100, [chip(10, 227), chip(34, 230.4), chip(58, 228)]),
    ).toBe(131);
  });

  it("leaves no chips alone", () => {
    expect(wrappedChipsWidth(100, [])).toBeUndefined();
  });
});
