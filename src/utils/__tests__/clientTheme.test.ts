import { describe, it, expect, afterEach, vi } from "vitest";
import { applyClientTheme } from "@/utils/clientTheme";

const bodyValue = (name: string) =>
  document.body.style.getPropertyValue(name);

describe("applyClientTheme", () => {
  afterEach(() => {
    document.body.removeAttribute("style");
    vi.restoreAllMocks();
  });

  it("sets each colour token on the body", () => {
    applyClientTheme({ "--color-accent": "#9F8332" });
    expect(bodyValue("--color-accent")).toBe("#9F8332");
  });

  it("accepts rgb, hsl and var() colour values", () => {
    applyClientTheme({
      "--color-accent-wash": "rgba(159, 131, 50, 0.1)",
      "--color-accent-tint": "hsl(40 30% 95%)",
      "--color-commit": "var(--color-accent)",
    });
    expect(bodyValue("--color-accent-wash")).toBe("rgba(159, 131, 50, 0.1)");
    expect(bodyValue("--color-accent-tint")).toBe("hsl(40 30% 95%)");
    expect(bodyValue("--color-commit")).toBe("var(--color-accent)");
  });

  it("ignores tokens outside the colour namespace", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    applyClientTheme({ "--radius-card": "0" });
    expect(bodyValue("--radius-card")).toBe("");
  });

  it("ignores values that are not colours", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    applyClientTheme({
      "--color-accent": "red; background: url(https://evil.example/x)",
    });
    expect(bodyValue("--color-accent")).toBe("");
  });

  it("warns about every rejected entry", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    applyClientTheme({ "--radius-card": "0", "--color-accent": "nope" });
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("does nothing without a theme", () => {
    applyClientTheme(undefined);
    expect(document.body.getAttribute("style")).toBeNull();
  });
});
