import { describe, it, expect, vi, beforeEach } from "vitest";

const STORAGE_KEY = "elody.colorScheme";

const stubSystemPreference = (prefersDark: boolean) => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: prefersDark, addEventListener: vi.fn() })),
  );
};

const loadComposable = async () => {
  vi.resetModules();
  const { useColorScheme } = await import("@/composables/useColorScheme");
  return useColorScheme();
};

describe("useColorScheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    stubSystemPreference(false);
  });

  it("follows the system preference when nothing is stored", async () => {
    stubSystemPreference(true);
    const { isDark } = await loadComposable();
    expect(isDark.value).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("prefers the stored choice over the system preference", async () => {
    stubSystemPreference(true);
    localStorage.setItem(STORAGE_KEY, "light");
    const { isDark } = await loadComposable();
    expect(isDark.value).toBe(false);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("toggles the dark class and persists the choice", async () => {
    const { isDark, toggleColorScheme } = await loadComposable();
    toggleColorScheme();
    expect(isDark.value).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("dark");

    toggleColorScheme();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("light");
  });
});
