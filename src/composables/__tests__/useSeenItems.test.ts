import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const STORAGE_KEY = "elody_seen_items";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

const loadSeenItems = async () => {
  vi.resetModules();
  const module = await import("../useSeenItems");
  return module.useSeenItems();
};

const storedItems = (): Record<string, number> =>
  JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");

describe("useSeenItems", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-13T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("markManyAsSeen", () => {
    it("marks every given id as seen", async () => {
      const { markManyAsSeen, isItemSeen } = await loadSeenItems();

      markManyAsSeen(["a", "b", "c"]);

      expect(isItemSeen("a")).toBe(true);
      expect(isItemSeen("b")).toBe(true);
      expect(isItemSeen("c")).toBe(true);
      expect(isItemSeen("d")).toBe(false);
    });

    it("persists all ids with a single storage write", async () => {
      const { markManyAsSeen } = await loadSeenItems();
      const setItem = vi.spyOn(Storage.prototype, "setItem");

      markManyAsSeen(["a", "b", "c"]);

      expect(setItem).toHaveBeenCalledTimes(1);
      expect(Object.keys(storedItems())).toEqual(["a", "b", "c"]);
    });

    it("does not touch storage when no ids are given", async () => {
      const { markManyAsSeen } = await loadSeenItems();
      const setItem = vi.spyOn(Storage.prototype, "setItem");

      markManyAsSeen([]);

      expect(setItem).not.toHaveBeenCalled();
    });

    it("keeps the original timestamp of ids that were already seen", async () => {
      const { markManyAsSeen } = await loadSeenItems();

      markManyAsSeen(["a"]);
      const firstTimestamp = storedItems()["a"];

      vi.setSystemTime(new Date("2026-08-13T12:00:00.000Z"));
      markManyAsSeen(["a", "b"]);

      expect(storedItems()["a"]).toBe(firstTimestamp);
      expect(storedItems()["b"]).toBeGreaterThan(firstTimestamp);
    });
  });

  describe("unmarkManyAsSeen", () => {
    it("removes only the given ids", async () => {
      const { markManyAsSeen, unmarkManyAsSeen, isItemSeen } =
        await loadSeenItems();

      markManyAsSeen(["a", "b", "c"]);
      unmarkManyAsSeen(["a", "c"]);

      expect(isItemSeen("a")).toBe(false);
      expect(isItemSeen("b")).toBe(true);
      expect(isItemSeen("c")).toBe(false);
      expect(Object.keys(storedItems())).toEqual(["b"]);
    });

    it("persists the removal with a single storage write", async () => {
      const { markManyAsSeen, unmarkManyAsSeen } = await loadSeenItems();
      markManyAsSeen(["a", "b"]);
      const setItem = vi.spyOn(Storage.prototype, "setItem");

      unmarkManyAsSeen(["a", "b"]);

      expect(setItem).toHaveBeenCalledTimes(1);
      expect(storedItems()).toEqual({});
    });

    it("does not touch storage when none of the given ids were seen", async () => {
      const { markManyAsSeen, unmarkManyAsSeen } = await loadSeenItems();
      markManyAsSeen(["a"]);
      const setItem = vi.spyOn(Storage.prototype, "setItem");

      unmarkManyAsSeen(["b", "c"]);

      expect(setItem).not.toHaveBeenCalled();
    });
  });

  describe("markAsSeen", () => {
    it("still marks a single item as seen", async () => {
      const { markAsSeen, isItemSeen } = await loadSeenItems();

      markAsSeen("a");

      expect(isItemSeen("a")).toBe(true);
      expect(storedItems()["a"]).toBe(Date.now());
    });
  });

  describe("expiration", () => {
    it("prunes entries older than the ttl when loading from storage", async () => {
      const now = Date.now();
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          expired: now - TTL_MS - 1,
          fresh: now - 1000,
        }),
      );

      const { isItemSeen } = await loadSeenItems();

      expect(isItemSeen("expired")).toBe(false);
      expect(isItemSeen("fresh")).toBe(true);
      expect(Object.keys(storedItems())).toEqual(["fresh"]);
    });
  });
});
