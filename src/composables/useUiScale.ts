import { readonly, ref } from "vue";

export const UI_SCALES = [0.9, 1, 1.15, 1.3, 1.5] as const;
const STORAGE_KEY = "elody.uiScale";

export const autoUiScale = (width: number, height: number): number => {
  const shortSide = Math.min(width, height);
  if (shortSide >= 2000) return 1.5;
  if (shortSide >= 1400) return 1.15;
  return 1;
};

const choice = ref<number | null>(null);

const readStoredChoice = (): number | null => {
  try {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    return (UI_SCALES as readonly number[]).includes(stored) ? stored : null;
  } catch {
    return null;
  }
};

const currentAutoScale = () => autoUiScale(screen.width, screen.height);

const applyUiScale = () =>
  document.documentElement.style.setProperty(
    "--ui-scale",
    String(choice.value ?? currentAutoScale()),
  );

const onResize = () => {
  if (choice.value === null) applyUiScale();
};

export const initUiScale = () => {
  choice.value = readStoredChoice();
  applyUiScale();
  window.removeEventListener("resize", onResize);
  window.addEventListener("resize", onResize);
};

const storeChoice = (scale: number | null) => {
  try {
    if (scale === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, String(scale));
  } catch {
    return;
  }
};

const setUiScale = (scale: number | null) => {
  choice.value = scale;
  storeChoice(scale);
  applyUiScale();
};

export const useUiScale = () => ({
  choice: readonly(choice),
  autoScale: currentAutoScale,
  setUiScale,
});
