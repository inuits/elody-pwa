import { describe, it, expect, afterEach } from "vitest";
import { readCssToken, withAlpha } from "@/utils/cssToken";

describe("readCssToken", () => {
  afterEach(() => {
    document.body.removeAttribute("style");
  });

  it("reads a design token from the body so client scopes apply", () => {
    document.body.style.setProperty("--color-accent", " #2A97E2 ");
    expect(readCssToken("--color-accent", "#000000")).toBe("#2A97E2");
  });

  it("returns the fallback when the token is not defined", () => {
    expect(readCssToken("--color-missing", "#3BA6CB")).toBe("#3BA6CB");
  });
});

describe("withAlpha", () => {
  it("turns a six-digit hex into rgba", () => {
    expect(withAlpha("#0CB2BC", 0.25)).toBe("rgba(12, 178, 188, 0.25)");
  });

  it("expands a three-digit hex", () => {
    expect(withAlpha("#fff", 0.5)).toBe("rgba(255, 255, 255, 0.5)");
  });

  it("returns a non-hex colour unchanged", () => {
    expect(withAlpha("rgb(1, 2, 3)", 0.5)).toBe("rgb(1, 2, 3)");
  });
});
