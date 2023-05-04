import { ref } from "vue";

type Context = "entitiesPage";
type InBulkProcessableItem = { id: string };
const items = ref<Record<Context, InBulkProcessableItem[]>>({
  entitiesPage: [],
});

export const useBulkOperations = () => {
  const enqueueItemForBulkProcessing = (
    context: Context,
    inBulkProcessableItem: InBulkProcessableItem
  ) => items.value[context].push(inBulkProcessableItem);

  const dequeueItemForBulkProcessing = (context: Context, itemId: string) =>
    (items.value[context] = items.value[context].filter(
      (item) => item.id != itemId
    ));

  return {
    enqueueItemForBulkProcessing,
    dequeueItemForBulkProcessing,
  };
};
