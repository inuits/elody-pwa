import { describe, it, expect, vi } from "vitest";
import { useBulkOperations, type Context } from "../useBulkOperations";

vi.mock("@/main", () => ({
  bulkSelectAllSizeLimit: 999999,
}));

describe("useBulkOperations - contexts not pre-registered in RouteNames/BulkOperationsContextEnum", () => {
  it("enqueues an item under a context whose route name was never seeded (e.g. a client-specific route name)", () => {
    const context = "navigation.custom-entity-route" as unknown as Context;
    const { enqueueItemForBulkProcessing, getEnqueuedItems } =
      useBulkOperations();

    expect(() =>
      enqueueItemForBulkProcessing(context, { id: "item-1" }),
    ).not.toThrow();

    expect(getEnqueuedItems(context)).toEqual([{ id: "item-1" }]);
  });

  it("reports a positive enqueued count for a freshly-used custom context", () => {
    const context = "navigation.another-custom-route" as unknown as Context;
    const { enqueueItemForBulkProcessing, getEnqueuedItemCount } =
      useBulkOperations();

    enqueueItemForBulkProcessing(context, { id: "item-a" });

    expect(getEnqueuedItemCount(context)).toBe(1);
  });
});
