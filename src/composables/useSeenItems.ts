import { ref } from "vue";

const STORAGE_KEY = "elody_seen_items";

const seenItems = ref<Record<string, boolean>>(
  JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}"),
);

export const useSeenItems = () => {
  const markAsSeen = (id: string) => {
    if (seenItems.value[id]) return;
    seenItems.value = { ...seenItems.value, [id]: true };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seenItems.value));
  };

  const isItemSeen = (id: string): boolean => {
    return !!seenItems.value[id];
  }

  return { markAsSeen, isItemSeen, seenItems };
};
