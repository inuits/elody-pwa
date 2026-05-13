import { ref } from "vue";

const STORAGE_KEY = "elody_seen_items";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

const pruneExpired = (items: Record<string, number>): Record<string, number> => {
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

export const useSeenItems = () => {
  const markAsSeen = (id: string) => {
    if (seenItems.value[id]) return;
    seenItems.value = { ...seenItems.value, [id]: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seenItems.value));
  };

  const isItemSeen = (id: string): boolean => {
    return !!seenItems.value[id];
  };

  return { markAsSeen, isItemSeen, seenItems };
};
