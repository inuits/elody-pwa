import { beforeEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { createPaginationStore } from "../usePaginationStore";

describe("createPaginationStore", () => {
  let store: ReturnType<typeof createPaginationStore>;

  beforeEach(() => {
    store = createPaginationStore();
  });

  describe("Initial State", () => {
    it("should initialize with correct default values", () => {
      expect(store.skip.value).toBe(1);
      expect(store.currentPage.value).toBe(1);
      expect(store.limit.value).toBe(20);
      expect(store.totalPages.value).toBe(0);
      expect(store.hasNextPage.value).toBe(false);
      expect(store.getLastPage()).toBe(1);
    });
  });

  describe("State Updates", () => {
    it("should update total amount correctly", () => {
      store.updateTotalAmount(100);
      expect(store.getLastPage()).toBe(5);
      expect(store.totalPages.value).toBe(5);
    });

    it("should update limit and reset page to 1", () => {
      store.updateTotalAmount(100);
      store.setPage(3);

      store.setLimit(50);

      expect(store.limit.value).toBe(50);
      expect(store.currentPage.value).toBe(1);
      expect(store.skip.value).toBe(1);
      expect(store.getLastPage()).toBe(2);
    });

    it("should not reset page if limit is set to the same value", () => {
      store.setPage(3);
      store.setLimit(20);
      expect(store.currentPage.value).toBe(3);
    });
  });

  describe("Navigation (next, previous, goToPage)", () => {
    beforeEach(() => {
      store.updateTotalAmount(60);
    });

    it("should navigate to next page", () => {
      store.next();
      expect(store.currentPage.value).toBe(2);
      expect(store.skip.value).toBe(2);
    });

    it("should not navigate past the last page", () => {
      store.setPage(3);
      store.next();
      expect(store.currentPage.value).toBe(3);
    });

    it("should navigate to previous page", () => {
      store.setPage(3);
      store.previous();
      expect(store.currentPage.value).toBe(2);
    });

    it("should not navigate before page 1", () => {
      store.previous();
      expect(store.currentPage.value).toBe(1);
    });

    it("should go to a specific valid page", () => {
      store.goToPage(2);
      expect(store.currentPage.value).toBe(2);
    });

    it("should ignore goToPage if page is out of bounds", () => {
      store.setPage(2);

      store.goToPage(0);
      expect(store.currentPage.value).toBe(2);

      store.goToPage(10);
      expect(store.currentPage.value).toBe(2);
    });
  });

  describe("Computed Properties", () => {
    it("should correctly calculate hasNextPage", () => {
      store.updateTotalAmount(40);

      expect(store.hasNextPage.value).toBe(true);

      store.setPage(2);
      expect(store.hasNextPage.value).toBe(false);
    });

    it("should correctly calculate totalPages", () => {
      store.updateTotalAmount(45);
      expect(store.totalPages.value).toBe(3);
    });
  });

  describe("Reactivity & Watchers", () => {
    it("should reset to page 1 if totalAmount changes making current page invalid", async () => {
      store.updateTotalAmount(100);
      store.setPage(4);

      store.updateTotalAmount(10);

      await nextTick();

      expect(store.currentPage.value).toBe(1);
    });

    it("should NOT reset page if totalAmount changes but current page is still valid", async () => {
      store.updateTotalAmount(100);
      store.setPage(2);

      store.updateTotalAmount(60);

      await nextTick();

      expect(store.currentPage.value).toBe(2);
    });
  });

  describe("Miscellaneous Methods", () => {
    it("should expose canUpdateSkipAgain without errors", () => {
      expect(() => store.canUpdateSkipAgain()).not.toThrow();
    });
  });
});
