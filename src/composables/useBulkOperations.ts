import { ref } from "vue";

export type Context = "entitiesPage" | "mediafilesPage" | "savedSearches";
export type InBulkProcessableItem = { id: string };
const items = ref<Record<Context, InBulkProcessableItem[]>>({
  entitiesPage: [],
  mediafilesPage: [],
  savedSearches: [],
});
const contextWhereUndoSelectionEventIsTriggered = ref<"" | Context>("");

export const useBulkOperations = () => {
  const enqueueItemForBulkProcessing = (
    context: Context,
    inBulkProcessableItem: InBulkProcessableItem
  ) => items.value[context].push(inBulkProcessableItem);

  const dequeueItemForBulkProcessing = (context: Context, itemId: string) => {
    items.value[context] = items.value[context].filter(
      (item) => item.id != itemId
    );
  };

  const dequeueAllItemsForBulkProcessing = (context: Context) => {
    items.value[context] = [];
    contextWhereUndoSelectionEventIsTriggered.value = context;
    setTimeout(
      () => (contextWhereUndoSelectionEventIsTriggered.value = ""),
      1000
    );
  };

  const getEnqueuedItemCount = (context: Context) =>
    items.value[context].length;

  const isEnqueued = (context: Context, itemId: string) =>
    items.value[context].find((item) => item.id == itemId) !== undefined;

  return {
    contextWhereUndoSelectionEventIsTriggered,
    enqueueItemForBulkProcessing,
    dequeueItemForBulkProcessing,
    dequeueAllItemsForBulkProcessing,
    getEnqueuedItemCount,
    isEnqueued,
  };
};
