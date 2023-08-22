import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import { ref } from "vue";

const itemPreviews = ref<InBulkProcessableItem[]>([]);

const useViewModes = () => {
  const setItemPreviews = (items: InBulkProcessableItem[]) => {
    itemPreviews.value = items.reverse();
  };

  const getItemPreviews = () => itemPreviews.value;

  const clearItemPreviews = () => {
    itemPreviews.value = [];
  };

  return { setItemPreviews, getItemPreviews, clearItemPreviews };
};

export default useViewModes;
