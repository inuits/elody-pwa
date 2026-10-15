import { inject, onBeforeUnmount, provide, ref, type InjectionKey } from "vue";

// field-row.md: the saved check shows for 2s, on the row and in its panel header
export const SAVED_FLASH_MS = 2000;

export const panelSavedFlashKey: InjectionKey<() => void> = Symbol("panelSavedFlash");

/** `visible` is true for SAVED_FLASH_MS after `flash()`; a new flash restarts it. */
export const useSavedFlash = () => {
  const visible = ref<boolean>(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const flash = () => {
    visible.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => (visible.value = false), SAVED_FLASH_MS);
  };
  onBeforeUnmount(() => clearTimeout(timer));
  return { visible, flash };
};

/** A panel flashes its header check when any row inside it saves. */
export const provideSavedFlash = (flash: () => void) =>
  provide(panelSavedFlashKey, flash);

export const useParentSavedFlash = (): (() => void) =>
  inject(panelSavedFlashKey, () => {});
