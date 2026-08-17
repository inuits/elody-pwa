import { describe, it, expect } from "vitest";
import { getPageWindow, PAGE_GAP } from "../pageWindow";

describe("getPageWindow", () => {
  it("shows every page when they all fit", () => {
    expect(getPageWindow(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageWindow(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("keeps the first and last page reachable from anywhere", () => {
    const window = getPageWindow(5, 10);
    expect(window[0]).toBe(1);
    expect(window[window.length - 1]).toBe(10);
  });

  it("gathers the pages around the current one", () => {
    expect(getPageWindow(5, 10)).toEqual([1, PAGE_GAP, 4, 5, 6, PAGE_GAP, 10]);
  });

  it("marks a gap only where pages are actually skipped", () => {
    // 1,2,3,4 run on without a break, so only the tail is elided.
    expect(getPageWindow(3, 10)).toEqual([1, 2, 3, 4, PAGE_GAP, 10]);
    expect(getPageWindow(8, 10)).toEqual([1, PAGE_GAP, 7, 8, 9, 10]);
  });

  it("never runs past either end", () => {
    expect(getPageWindow(1, 10)).toEqual([1, 2, PAGE_GAP, 10]);
    expect(getPageWindow(10, 10)).toEqual([1, PAGE_GAP, 9, 10]);
  });

  it("copes with a single page", () => {
    expect(getPageWindow(1, 1)).toEqual([1]);
  });

  it("never repeats a page", () => {
    const window = getPageWindow(2, 8).filter((page) => page !== PAGE_GAP);
    expect(new Set(window).size).toBe(window.length);
  });
});
