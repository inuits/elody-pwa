import { ref, type Ref } from "vue";
import type { SeenTracking } from "@/types/contextMenuRouteConfig";

const STORAGE_KEY = "elody_seen_items";
const DAY_MS = 24 * 60 * 60 * 1000;
export const DEFAULT_SEEN_TTL_DAYS = 7;

type SeenEntry = { at: number; expiresAt: number };

export type MarkAsSeenOptions = {
  at?: string | number;
  ttlDays?: number;
};

const ttlMsOf = (ttlDays?: number): number =>
  (ttlDays ?? DEFAULT_SEEN_TTL_DAYS) * DAY_MS;

const toTimestamp = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const timestamp =
    typeof value === "number" ? value : Date.parse(String(value));
  return Number.isFinite(timestamp) ? timestamp : undefined;
};

export const isNewSince = (
  activityAt: string | number | undefined,
  seenAt: number | undefined,
  ttlDays?: number,
): boolean => {
  const activity = toTimestamp(activityAt);
  if (activity === undefined) return false;
  const floor = Date.now() - ttlMsOf(ttlDays);
  return activity > Math.max(seenAt ?? 0, floor);
};

const toEntry = (value: unknown): SeenEntry | undefined => {
  if (typeof value === "number" && Number.isFinite(value))
    return { at: value, expiresAt: value + ttlMsOf() };
  if (!value || typeof value !== "object") return undefined;
  const { at, expiresAt } = value as Partial<SeenEntry>;
  if (!Number.isFinite(at) || !Number.isFinite(expiresAt)) return undefined;
  return { at: at!, expiresAt: expiresAt! };
};

const loadFromStorage = (): Record<string, SeenEntry> => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const now = Date.now();
    return Object.fromEntries(
      Object.entries(JSON.parse(raw))
        .map(([id, value]) => [id, toEntry(value)] as const)
        .filter(
          (item): item is readonly [string, SeenEntry] =>
            !!item[1] && item[1].expiresAt > now,
        ),
    );
  } catch {
    return {};
  }
};

const seenItems = ref<Record<string, SeenEntry>>(loadFromStorage());

// Write back pruned state on init so expired keys are removed from storage
window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seenItems.value));

const persist = (items: Record<string, SeenEntry>) => {
  seenItems.value = items;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const useSeenItems = () => {
  const markManyAsSeen = (ids: string[], options: MarkAsSeenOptions = {}) => {
    const activityAt = toTimestamp(options.at);
    const at = activityAt ?? Date.now();
    const itemsToMark = ids.filter((id) => {
      if (!id) return false;
      const existing = seenItems.value[id];
      return !existing || (activityAt !== undefined && at > existing.at);
    });
    if (itemsToMark.length === 0) return;

    const entry = { at, expiresAt: at + ttlMsOf(options.ttlDays) };
    const items = { ...seenItems.value };
    for (const id of itemsToMark) items[id] = entry;
    persist(items);
  };

  const unmarkManyAsSeen = (ids: string[]) => {
    const itemsToUnmark = ids.filter((id) => seenItems.value[id]);
    if (itemsToUnmark.length === 0) return;

    const items = { ...seenItems.value };
    for (const id of itemsToUnmark) delete items[id];
    persist(items);
  };

  const markAsSeen = (id: string, options?: MarkAsSeenOptions) =>
    markManyAsSeen([id], options);

  const isItemSeen = (id: string): boolean => {
    return !!seenItems.value[id];
  };

  const seenAtOf = (id: string): number | undefined => seenItems.value[id]?.at;

  const isNew = (
    id: string,
    activityAt: string | number | undefined,
    ttlDays?: number,
  ): boolean => isNewSince(activityAt, seenAtOf(id), ttlDays);

  return {
    markAsSeen,
    markManyAsSeen,
    unmarkManyAsSeen,
    isItemSeen,
    isNew,
    seenAtOf,
    seenItems,
  };
};

export const useSeenState = (tracking: Ref<SeenTracking | undefined>) => {
  const { isItemSeen, isNew: isNewItem, markAsSeen } = useSeenItems();

  const activityOf = (values?: Record<string, unknown>) => {
    const activityKey = tracking.value?.activityKey;
    return activityKey
      ? (values?.[activityKey] as string | number | undefined)
      : undefined;
  };

  const isSeen = (id: string): boolean =>
    tracking.value?.display === "dimSeen" && isItemSeen(id);

  const isNew = (id: string, values?: Record<string, unknown>): boolean =>
    tracking.value?.display === "highlightNew" &&
    !!tracking.value.activityKey &&
    isNewItem(id, activityOf(values), tracking.value.ttlDays);

  const markSeen = (id: string, values?: Record<string, unknown>) => {
    if (!tracking.value) return;
    markAsSeen(id, { at: activityOf(values), ttlDays: tracking.value.ttlDays });
  };

  return { isSeen, isNew, markSeen };
};
