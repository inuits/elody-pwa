import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  autoUiScale,
  initUiScale,
  useUiScale,
  UI_SCALES,
} from "@/composables/useUiScale";

const setScreen = (width: number, height: number) => {
  Object.defineProperty(window.screen, "width", {
    value: width,
    configurable: true,
  });
  Object.defineProperty(window.screen, "height", {
    value: height,
    configurable: true,
  });
};
const appliedScale = () =>
  document.documentElement.style.getPropertyValue("--ui-scale");

describe("autoUiScale", () => {
  it.each([
    [1512, 982, 1],
    [1920, 1080, 1],
    [2560, 1080, 1],
    [2560, 1440, 1.15],
    [3440, 1440, 1.15],
    [1440, 2560, 1.15],
    [3840, 2160, 1.5],
  ])("gives a %ix%i screen a scale of %d", (width, height, scale) => {
    expect(autoUiScale(width, height)).toBe(scale);
  });
});

describe("useUiScale", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("style");
    setScreen(2560, 1440);
  });
  afterEach(() => {
    localStorage.clear();
  });

  it("applies the automatic scale when nothing is stored", () => {
    initUiScale();
    expect(appliedScale()).toBe("1.15");
  });

  it("applies the stored choice over the automatic scale", () => {
    localStorage.setItem("elody.uiScale", "1.3");
    initUiScale();
    expect(appliedScale()).toBe("1.3");
  });

  it("ignores a stored value that is not one of the options", () => {
    localStorage.setItem("elody.uiScale", "7");
    initUiScale();
    expect(appliedScale()).toBe("1.15");
  });

  it("stores and applies a chosen scale", () => {
    initUiScale();
    useUiScale().setUiScale(0.9);
    expect([localStorage.getItem("elody.uiScale"), appliedScale()]).toEqual([
      "0.9",
      "0.9",
    ]);
  });

  it("goes back to automatic and forgets the choice", () => {
    localStorage.setItem("elody.uiScale", "1.3");
    initUiScale();
    useUiScale().setUiScale(null);
    expect([localStorage.getItem("elody.uiScale"), appliedScale()]).toEqual([
      null,
      "1.15",
    ]);
  });

  it("follows the screen on resize while automatic", () => {
    initUiScale();
    setScreen(3840, 2160);
    window.dispatchEvent(new Event("resize"));
    expect(appliedScale()).toBe("1.5");
  });

  it("offers the scales from 90% to 150%", () => {
    expect(UI_SCALES).toEqual([0.9, 1, 1.15, 1.3, 1.5]);
  });
});
