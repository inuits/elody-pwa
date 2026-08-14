import { ref } from "vue";

const STORAGE_KEY = "elody_seen_items";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

const pruneExpired = (
  items: Record<string, number>,
): Record<string, number> => {
  const cutoff = Date.now() - TTL_MS;
  return Object.fromEntries(
    Object.entries(items).filter(([, timestamp]) => timestamp > cutoff),
  );
};

const loadFromStorage = (): Record<string, number> => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return pruneExpired(parsed);
  } catch {
    return {};
  }
};

const seenItems = ref<Record<string, number>>(loadFromStorage());

// Write back pruned state on init so expired keys are removed from storage
window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seenItems.value));

const persist = (items: Record<string, number>) => {
  seenItems.value = items;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const useSeenItems = () => {
  const markManyAsSeen = (ids: string[]) => {
    const timestamp = Date.now();
    const itemsToMark = ids.filter((id) => id && !seenItems.value[id]);
    if (itemsToMark.length === 0) return;

    const items = { ...seenItems.value };
    for (const id of itemsToMark) items[id] = timestamp;
    persist(items);
  };

  const unmarkManyAsSeen = (ids: string[]) => {
    const itemsToUnmark = ids.filter((id) => seenItems.value[id]);
    if (itemsToUnmark.length === 0) return;

    const items = { ...seenItems.value };
    for (const id of itemsToUnmark) delete items[id];
    persist(items);
  };

  const markAsSeen = (id: string) => markManyAsSeen([id]);

  const isItemSeen = (id: string): boolean => {
    return !!seenItems.value[id];
  };

  return {
    markAsSeen,
    markManyAsSeen,
    unmarkManyAsSeen,
    isItemSeen,
    seenItems,
  };
};
