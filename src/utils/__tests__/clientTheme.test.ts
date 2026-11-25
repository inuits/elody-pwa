import { describe, it, expect, afterEach, vi } from "vitest";
import { applyClientTheme } from "@/utils/clientTheme";

const themeStyles = () =>
  [...document.head.querySelectorAll("style[data-client-theme]")].map(
    (style) => style.textContent ?? "",
  );

describe("applyClientTheme", () => {
  afterEach(() => {
    document.head
      .querySelectorAll("style[data-client-theme]")
      .forEach((style) => style.remove());
    vi.restoreAllMocks();
  });

  // A stylesheet rule, not inline style: html.dark body outranks a plain
  // body rule, so dark mode wins over a client's light colours.
  it("sets each colour token in a body rule, not inline", () => {
    applyClientTheme({ "--color-accent": "#9F8332" });
    expect(themeStyles()).toEqual(["body { --color-accent: #9F8332; }"]);
    expect(document.body.getAttribute("style")).toBeNull();
  });

  it("accepts rgb, hsl and var() colour values", () => {
    applyClientTheme({
      "--color-accent-wash": "rgba(159, 131, 50, 0.1)",
      "--color-accent-tint": "hsl(40 30% 95%)",
      "--color-commit": "var(--color-accent)",
    });
    expect(themeStyles()).toEqual([
      "body { --color-accent-wash: rgba(159, 131, 50, 0.1); --color-accent-tint: hsl(40 30% 95%); --color-commit: var(--color-accent); }",
    ]);
  });

  it("ignores tokens outside the colour namespace", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    applyClientTheme({ "--radius-card": "0", "--color-accent": "#9F8332" });
    expect(themeStyles()).toEqual(["body { --color-accent: #9F8332; }"]);
  });

  it("ignores values that are not colours", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    applyClientTheme({
      "--color-accent": "red; } body { background: url(https://evil.example/x)",
    });
    expect(themeStyles()).toEqual([]);
  });

  it("warns about every rejected entry", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    applyClientTheme({ "--radius-card": "0", "--color-accent": "nope" });
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("does nothing without a theme", () => {
    applyClientTheme(undefined);
    expect(themeStyles()).toEqual([]);
  });
});
