import { describe, it, expect, beforeEach } from "vitest";
import {
  DEFAULT_LISTING_COUNT_CAP,
  formatResultCount,
  getListingCountCap,
  isCountCapped,
  setListingCountCap,
} from "@/composables/useResultCount";

describe("useResultCount", () => {
  beforeEach(() => {
    // reset to the built-in default before every test
    setListingCountCap(DEFAULT_LISTING_COUNT_CAP);
  });

  describe("getListingCountCap / setListingCountCap", () => {
    it("defaults to DEFAULT_LISTING_COUNT_CAP", () => {
      expect(getListingCountCap()).toBe(DEFAULT_LISTING_COUNT_CAP);
    });

    it("can be overridden with a positive cap (e.g. from backend config)", () => {
      setListingCountCap(500);
      expect(getListingCountCap()).toBe(500);
    });

    it("ignores undefined, null, and negative values", () => {
      setListingCountCap(750);
      setListingCountCap(undefined);
      setListingCountCap(null as unknown as number);
      setListingCountCap(-10);
      expect(getListingCountCap()).toBe(750);
    });

    it("accepts zero for disabling count capping", () => {
      setListingCountCap(750);
      setListingCountCap(undefined);
      setListingCountCap(null as unknown as number);
      setListingCountCap(0);
      setListingCountCap(-10);
      expect(getListingCountCap()).toBe(0);
    });
  });

  describe("isCountCapped", () => {
    it("is false for counts at or below the cap", () => {
      expect(isCountCapped(0)).toBe(false);
      expect(isCountCapped(42)).toBe(false);
      expect(isCountCapped(DEFAULT_LISTING_COUNT_CAP)).toBe(false);
    });

    it("is true once the count exceeds the cap (backend returns cap + 1 as a sentinel)", () => {
      expect(isCountCapped(DEFAULT_LISTING_COUNT_CAP + 1)).toBe(true);
      expect(isCountCapped(99999)).toBe(true);
    });

    it("is false for nullish counts", () => {
      expect(isCountCapped(undefined)).toBe(false);
      expect(isCountCapped(null)).toBe(false);
    });
  });

  describe("formatResultCount", () => {
    it("renders an exact, locale-grouped number when not capped", () => {
      expect(formatResultCount(7, "en")).toBe("7");
      expect(formatResultCount(1000, "en")).toBe("1,000");
    });

    it("renders '<cap>+' when capped instead of the raw sentinel value", () => {
      // backend sends 1001 to mean "more than 1000" -> never show "1001"
      expect(formatResultCount(DEFAULT_LISTING_COUNT_CAP + 1, "en")).toBe(
        "1,000+",
      );
    });

    it("respects a custom cap", () => {
      setListingCountCap(500);
      expect(formatResultCount(501, "en")).toBe("500+");
      expect(formatResultCount(499, "en")).toBe("499");
    });

    it("treats nullish counts as zero", () => {
      expect(formatResultCount(undefined, "en")).toBe("0");
      expect(formatResultCount(null, "en")).toBe("0");
    });
  });
});
