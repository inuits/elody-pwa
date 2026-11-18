import { computed, ref } from "vue";

export enum ColorScheme {
  Light = "light",
  Dark = "dark",
}

const STORAGE_KEY = "elody.colorScheme";

const readStoredScheme = (): ColorScheme | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as ColorScheme | null;
    return stored && Object.values(ColorScheme).includes(stored)
      ? stored
      : null;
  } catch {
    return null;
  }
};

const colorScheme = ref<ColorScheme>(ColorScheme.Light);
const applyColorScheme = (scheme: ColorScheme) => {
  colorScheme.value = scheme;
  document.documentElement.classList.toggle("dark", scheme === ColorScheme.Dark);
};

// Without an explicit choice the app follows the OS setting, live.
const prefersDarkQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
const systemScheme = (prefersDark = prefersDarkQuery?.matches) =>
  prefersDark ? ColorScheme.Dark : ColorScheme.Light;
applyColorScheme(readStoredScheme() ?? systemScheme());
prefersDarkQuery?.addEventListener("change", (event) => {
  if (!readStoredScheme()) applyColorScheme(systemScheme(event.matches));
});

export const useColorScheme = () => {
  const isDark = computed(() => colorScheme.value === ColorScheme.Dark);
  const toggleColorScheme = () => {
    applyColorScheme(isDark.value ? ColorScheme.Light : ColorScheme.Dark);
    try {
      localStorage.setItem(STORAGE_KEY, colorScheme.value);
    } catch {
      // storage blocked: the choice lasts for this page load only
    }
  };
  return { isDark, toggleColorScheme };
};
