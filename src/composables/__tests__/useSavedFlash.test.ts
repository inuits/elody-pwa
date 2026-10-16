import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import {
  SAVED_FLASH_MS,
  provideSavedFlash,
  useParentSavedFlash,
  useSavedFlash,
} from "@/composables/useSavedFlash";

const withSetup = <T>(setup: () => T): T => {
  let result!: T;
  mount(defineComponent({ setup: () => ((result = setup()), () => h("div")) }));
  return result;
};

describe("useSavedFlash", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("shows for 2s after a flash", () => {
    const { visible, flash } = withSetup(useSavedFlash);
    expect(visible.value).toBe(false);
    flash();
    expect(visible.value).toBe(true);
    vi.advanceTimersByTime(SAVED_FLASH_MS - 1);
    expect(visible.value).toBe(true);
    vi.advanceTimersByTime(1);
    expect(visible.value).toBe(false);
  });

  it("restarts the 2s when it flashes again", () => {
    const { visible, flash } = withSetup(useSavedFlash);
    flash();
    vi.advanceTimersByTime(SAVED_FLASH_MS - 500);
    flash();
    vi.advanceTimersByTime(SAVED_FLASH_MS - 1);
    expect(visible.value).toBe(true);
  });
});

describe("useParentSavedFlash", () => {
  it("calls the flash its panel provides", () => {
    const panelFlash = vi.fn();
    let rowFlash!: () => void;
    const Row = defineComponent({
      setup: () => ((rowFlash = useParentSavedFlash()), () => h("span")),
    });
    mount(
      defineComponent({
        setup: () => (provideSavedFlash(panelFlash), () => h(Row)),
      }),
    );
    rowFlash();
    expect(panelFlash).toHaveBeenCalledTimes(1);
  });

  it("does nothing outside a panel", () => {
    expect(() => withSetup(useParentSavedFlash)()).not.toThrow();
  });
});
