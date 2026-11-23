import { computed, ref, type Ref } from "vue";
import { pageOfIndex } from "@/composables/reorder/reorderHelpers";

export const useReorderPagination = (
  order: Ref<string[]>,
  pageSize: Ref<number>,
) => {
  const page = ref(0);

  const pageCount = computed(() =>
    Math.max(1, Math.ceil(order.value.length / pageSize.value)),
  );
  const pageStart = computed(() => page.value * pageSize.value);
  const pageRows = computed(() =>
    order.value
      .slice(pageStart.value, pageStart.value + pageSize.value)
      .map((id, offset) => ({ id, index: pageStart.value + offset, offset })),
  );

  const goToPage = (pageIndex: number) => {
    page.value = pageIndex;
  };

  const startOfPage = (pageIndex: number) => pageIndex * pageSize.value;

  const isOnCurrentPage = (index: number) =>
    pageOfIndex(index, pageSize.value) === page.value;

  return {
    page,
    pageCount,
    pageStart,
    pageRows,
    goToPage,
    startOfPage,
    isOnCurrentPage,
  };
};
