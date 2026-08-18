import { describe, it, expect } from "vitest";
import { withAlpha } from "../accentMapStyle";

describe("withAlpha", () => {
  it("turns a six-digit hex into rgba at the given alpha", () => {
    expect(withAlpha("#3BA6CB", 0.25)).toBe("rgba(59, 166, 203, 0.25)");
  });

  it("copes with the shorthand hex form", () => {
    expect(withAlpha("#f97", 0.25)).toBe("rgba(255, 153, 119, 0.25)");
  });

  it("passes non-hex colours through with the alpha applied via color-mix", () => {
    expect(withAlpha("rgb(59, 166, 203)", 0.25)).toBe(
      "color-mix(in srgb, rgb(59, 166, 203) 25%, transparent)",
    );
  });

  it("trims whitespace from computed-style values", () => {
    expect(withAlpha(" #3BA6CB ", 0.5)).toBe("rgba(59, 166, 203, 0.5)");
  });
});
