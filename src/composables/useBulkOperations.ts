import { ref } from "vue";

export type Context = "entitiesPage" | "mediafilesPage" | "savedSearches";
export type InBulkProcessableItem = { id: string };
const items = ref<Record<Context, InBulkProcessableItem[]>>({
  entitiesPage: [],
  mediafilesPage: [],
  savedSearches: [],
});
const contextWhereSelectionEventIsTriggered = ref<"" | Context>("");

export const useBulkOperations = () => {
  const enqueueItemForBulkProcessing = (
    context: Context,
    inBulkProcessableItem: InBulkProcessableItem
  ) => {
    if (!isEnqueued(context, inBulkProcessableItem.id))
      items.value[context].push(inBulkProcessableItem);
  };

  const dequeueItemForBulkProcessing = (context: Context, itemId: string) => {
    items.value[context] = items.value[context].filter(
      (item) => item.id != itemId
    );
  };

  const dequeueAllItemsForBulkProcessing = (context: Context) => {
    items.value[context] = [];
    triggerBulkSelectionEvent(context);
  };

  const getEnqueuedItemCount = (context: Context) =>
    items.value[context].length;

  const isEnqueued = (context: Context, itemId: string) =>
    items.value[context].find((item) => item.id == itemId) !== undefined;

  const triggerBulkSelectionEvent = (context: Context) => {
    contextWhereSelectionEventIsTriggered.value = context;
    setTimeout(() => (contextWhereSelectionEventIsTriggered.value = ""), 50);
  };

  return {
    contextWhereSelectionEventIsTriggered,
    enqueueItemForBulkProcessing,
    dequeueItemForBulkProcessing,
    dequeueAllItemsForBulkProcessing,
    getEnqueuedItemCount,
    isEnqueued,
    triggerBulkSelectionEvent,
  };
};
