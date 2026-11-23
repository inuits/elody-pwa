import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useReorderPagination } from "@/composables/reorder/useReorderPagination";

const order = ref(["a", "b", "c", "d", "e", "f", "g"]);
const pageSize = ref(3);

describe("useReorderPagination", () => {
  it("slices the order into pages", () => {
    const pagination = useReorderPagination(order, pageSize);
    expect(pagination.pageCount.value).toBe(3);
    expect(pagination.pageRows.value).toEqual([
      { id: "a", index: 0, offset: 0 },
      { id: "b", index: 1, offset: 1 },
      { id: "c", index: 2, offset: 2 },
    ]);

    pagination.goToPage(2);
    expect(pagination.pageRows.value).toEqual([
      { id: "g", index: 6, offset: 0 },
    ]);
  });

  it("knows where each page starts and whether an index is on it", () => {
    const pagination = useReorderPagination(order, pageSize);
    pagination.goToPage(1);
    expect(pagination.startOfPage(2)).toBe(6);
    expect(pagination.isOnCurrentPage(4)).toBe(true);
    expect(pagination.isOnCurrentPage(6)).toBe(false);
  });
});
