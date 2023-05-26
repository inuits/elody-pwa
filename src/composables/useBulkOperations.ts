import type { MetadataAndRelation } from "@/generated-types/queries";
import { bulkSelectAllSizeLimit } from "@/main";
import { ref } from "vue";

export type Context =
  | "Home"
  | "SingleEntity"
  | "Mediafiles"
  | "SingleMediafile"
  | "History"
  | "BulkOperationsCsvExport";
export type InBulkProcessableItem = {
  id: string;
  teaserMetadata?: MetadataAndRelation[];
};
const items = ref<Record<Context, InBulkProcessableItem[]>>({
  Home: [],
  SingleEntity: [],
  Mediafiles: [],
  SingleMediafile: [],
  History: [],
  BulkOperationsCsvExport: [],
});
const contextWhereSelectionEventIsTriggered = ref<"" | Context>("");

export const useBulkOperations = () => {
  const enqueueItemForBulkProcessing = (
    context: Context,
    inBulkProcessableItem: InBulkProcessableItem
  ) => {
    if (
      !isEnqueued(context, inBulkProcessableItem.id) &&
      items.value[context].length < bulkSelectAllSizeLimit
    )
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

  const getEnqueuedItems = (
    context: Context,
    skip: number = 1,
    limit: number = Number.MAX_SAFE_INTEGER
  ) => items.value[context].slice((skip - 1) * limit, skip * limit);

  const getEnqueuedItemCount = (context: Context) =>
    items.value[context]?.length ?? 0;

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
    getEnqueuedItems,
    getEnqueuedItemCount,
    isEnqueued,
    triggerBulkSelectionEvent,
  };
};
