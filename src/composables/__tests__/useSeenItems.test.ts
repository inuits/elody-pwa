import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ref } from "vue";
import type { SeenTracking } from "@/types/contextMenuRouteConfig";

const STORAGE_KEY = "elody_seen_items";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

const loadSeenItems = async () => {
  vi.resetModules();
  const module = await import("../useSeenItems");
  return module.useSeenItems();
};

const loadSeenState = async (tracking: SeenTracking | undefined) => {
  vi.resetModules();
  const module = await import("../useSeenItems");
  return {
    seenItems: module.useSeenItems(),
    seenState: module.useSeenState(ref(tracking)),
  };
};

const DAY_MS = 24 * 60 * 60 * 1000;

const storedItems = (): Record<string, { at: number; expiresAt: number }> =>
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
      const firstTimestamp = storedItems()["a"].at;

      vi.setSystemTime(new Date("2026-08-13T12:00:00.000Z"));
      markManyAsSeen(["a", "b"]);

      expect(storedItems()["a"].at).toBe(firstTimestamp);
      expect(storedItems()["b"].at).toBeGreaterThan(firstTimestamp);
    });

    it("stores the given activity timestamp with an expiry based on the given ttl", async () => {
      const { markManyAsSeen } = await loadSeenItems();
      const at = Date.parse("2026-08-12T08:00:00.000Z");

      markManyAsSeen(["a"], { at: "2026-08-12T08:00:00.000Z", ttlDays: 30 });

      expect(storedItems()["a"]).toEqual({ at, expiresAt: at + 30 * DAY_MS });
    });

    it("moves an entry forward when a newer activity timestamp is given", async () => {
      const { markManyAsSeen, seenAtOf } = await loadSeenItems();

      markManyAsSeen(["a"], { at: "2026-08-12T08:00:00.000Z" });
      markManyAsSeen(["a"], { at: "2026-08-13T08:00:00.000Z" });

      expect(seenAtOf("a")).toBe(Date.parse("2026-08-13T08:00:00.000Z"));
    });

    it("never moves an entry back to an older activity timestamp", async () => {
      const { markManyAsSeen, seenAtOf } = await loadSeenItems();

      markManyAsSeen(["a"], { at: "2026-08-13T08:00:00.000Z" });
      const setItem = vi.spyOn(Storage.prototype, "setItem");
      markManyAsSeen(["a"], { at: "2026-08-12T08:00:00.000Z" });

      expect(seenAtOf("a")).toBe(Date.parse("2026-08-13T08:00:00.000Z"));
      expect(setItem).not.toHaveBeenCalled();
    });

    it("falls back to now when the activity timestamp is not a date", async () => {
      const { markManyAsSeen, seenAtOf } = await loadSeenItems();

      markManyAsSeen(["a"], { at: "not a date" });

      expect(seenAtOf("a")).toBe(Date.now());
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
      expect(storedItems()["a"]).toEqual({
        at: Date.now(),
        expiresAt: Date.now() + TTL_MS,
      });
    });

    it("passes the activity timestamp and ttl on", async () => {
      const { markAsSeen, seenAtOf } = await loadSeenItems();

      markAsSeen("a", { at: "2026-08-12T08:00:00.000Z", ttlDays: 30 });

      expect(seenAtOf("a")).toBe(Date.parse("2026-08-12T08:00:00.000Z"));
    });
  });

  describe("isNewSince", () => {
    it("compares the activity with the given seen timestamp", async () => {
      vi.resetModules();
      const { isNewSince } = await import("../useSeenItems");
      const seenAt = Date.parse("2026-08-13T08:00:00.000Z");

      expect(isNewSince("2026-08-13T09:00:00.000Z", seenAt)).toBe(true);
      expect(isNewSince("2026-08-13T07:00:00.000Z", seenAt)).toBe(false);
      expect(isNewSince("2026-08-13T07:00:00.000Z", undefined)).toBe(true);
      expect(isNewSince(Date.now() - 8 * DAY_MS, undefined)).toBe(false);
      expect(isNewSince(Date.now() - 8 * DAY_MS, undefined, 30)).toBe(true);
      expect(isNewSince(undefined, undefined)).toBe(false);
    });
  });

  describe("isNew", () => {
    it("treats activity on an item that was never seen as new", async () => {
      const { isNew } = await loadSeenItems();

      expect(isNew("a", "2026-08-13T09:00:00.000Z")).toBe(true);
    });

    it("treats an item as new again when there was activity after it was seen", async () => {
      const { markAsSeen, isNew } = await loadSeenItems();

      markAsSeen("a", { at: "2026-08-13T08:00:00.000Z" });

      expect(isNew("a", "2026-08-13T08:00:00.000Z")).toBe(false);
      expect(isNew("a", "2026-08-13T09:00:00.000Z")).toBe(true);
    });

    it("treats activity older than the ttl as not new", async () => {
      const { isNew } = await loadSeenItems();

      expect(isNew("a", Date.now() - 8 * DAY_MS)).toBe(false);
      expect(isNew("a", Date.now() - 8 * DAY_MS, 30)).toBe(true);
      expect(isNew("a", Date.now() - 31 * DAY_MS, 30)).toBe(false);
    });

    it("treats missing or invalid activity as not new", async () => {
      const { isNew } = await loadSeenItems();

      expect(isNew("a", undefined)).toBe(false);
      expect(isNew("a", "")).toBe(false);
      expect(isNew("a", "not a date")).toBe(false);
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

      const { isItemSeen, seenAtOf } = await loadSeenItems();

      expect(isItemSeen("expired")).toBe(false);
      expect(isItemSeen("fresh")).toBe(true);
      expect(seenAtOf("fresh")).toBe(now - 1000);
      expect(Object.keys(storedItems())).toEqual(["fresh"]);
      expect(storedItems()["fresh"]).toEqual({
        at: now - 1000,
        expiresAt: now - 1000 + TTL_MS,
      });
    });

    it("prunes every entry on its own expiry", async () => {
      const now = Date.now();
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          expired: { at: now - 31 * DAY_MS, expiresAt: now - DAY_MS },
          fresh: { at: now - 20 * DAY_MS, expiresAt: now + 10 * DAY_MS },
        }),
      );

      const { isItemSeen } = await loadSeenItems();

      expect(isItemSeen("expired")).toBe(false);
      expect(isItemSeen("fresh")).toBe(true);
    });

    it("drops entries it cannot read", async () => {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ broken: "x", alsoBroken: { at: "x" } }),
      );

      const { isItemSeen } = await loadSeenItems();

      expect(isItemSeen("broken")).toBe(false);
      expect(isItemSeen("alsoBroken")).toBe(false);
    });
  });

  describe("useSeenState", () => {
    const highlightNew: SeenTracking = {
      display: "highlightNew",
      activityKey: "last_activity_at",
      ttlDays: 30,
    };

    describe("isSeen", () => {
      it("is false when seen tracking is off", async () => {
        const { seenItems, seenState } = await loadSeenState(undefined);
        seenItems.markAsSeen("a");

        expect(seenState.isSeen("a")).toBe(false);
      });

      it("follows the seen items when seen items are dimmed", async () => {
        const { seenItems, seenState } = await loadSeenState({
          display: "dimSeen",
        });
        seenItems.markAsSeen("a");

        expect(seenState.isSeen("a")).toBe(true);
        expect(seenState.isSeen("b")).toBe(false);
      });

      it("is false when new items are highlighted instead", async () => {
        const { seenItems, seenState } = await loadSeenState(highlightNew);
        seenItems.markAsSeen("a");

        expect(seenState.isSeen("a")).toBe(false);
      });
    });

    describe("isNew", () => {
      const values = { last_activity_at: "2026-08-13T09:00:00.000Z" };

      it("is false when seen tracking is off", async () => {
        const { seenState } = await loadSeenState(undefined);

        expect(seenState.isNew("a", values)).toBe(false);
      });

      it("is false when seen items are dimmed", async () => {
        const { seenState } = await loadSeenState({
          display: "dimSeen",
          activityKey: "last_activity_at",
        });

        expect(seenState.isNew("a", values)).toBe(false);
      });

      it("is false without an activity key", async () => {
        const { seenState } = await loadSeenState({ display: "highlightNew" });

        expect(seenState.isNew("a", values)).toBe(false);
      });

      it("compares the configured activity value with the seen timestamp", async () => {
        const { seenItems, seenState } = await loadSeenState(highlightNew);

        expect(seenState.isNew("a", values)).toBe(true);

        seenItems.markAsSeen("a", { at: "2026-08-13T09:00:00.000Z" });
        expect(seenState.isNew("a", values)).toBe(false);
        expect(
          seenState.isNew("a", { last_activity_at: "2026-08-13T09:30:00Z" }),
        ).toBe(true);
      });

      it("uses the configured ttl", async () => {
        const twentyDaysOld = {
          last_activity_at: new Date(Date.now() - 20 * DAY_MS).toISOString(),
        };

        expect(
          (await loadSeenState(highlightNew)).seenState.isNew(
            "a",
            twentyDaysOld,
          ),
        ).toBe(true);
        expect(
          (
            await loadSeenState({ ...highlightNew, ttlDays: undefined })
          ).seenState.isNew("a", twentyDaysOld),
        ).toBe(false);
      });
    });

    describe("markSeen", () => {
      it("does nothing when seen tracking is off", async () => {
        const { seenItems, seenState } = await loadSeenState(undefined);

        seenState.markSeen("a", { last_activity_at: "2026-08-12T08:00:00Z" });

        expect(seenItems.isItemSeen("a")).toBe(false);
      });

      it("stores the configured activity value with the configured ttl", async () => {
        const { seenState } = await loadSeenState(highlightNew);
        const at = Date.parse("2026-08-12T08:00:00Z");

        seenState.markSeen("a", { last_activity_at: "2026-08-12T08:00:00Z" });

        expect(storedItems()["a"]).toEqual({
          at,
          expiresAt: at + 30 * DAY_MS,
        });
      });

      it("falls back to now without an activity value", async () => {
        const { seenItems, seenState } = await loadSeenState({
          display: "dimSeen",
        });

        seenState.markSeen("a");

        expect(seenItems.seenAtOf("a")).toBe(Date.now());
      });
    });
  });
});
