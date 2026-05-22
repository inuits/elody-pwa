import { describe, expect, it } from "vitest";
import { buildItemsWithRelationMetadata } from "@/composables/entityPickerRelationMetadata";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";

const makeItem = (id: string, metadata?: { key: string; value: any }[]): InBulkProcessableItem =>
  ({ id, teaserMetadata: [], metadata }) as unknown as InBulkProcessableItem;

describe("buildItemsWithRelationMetadata", () => {
  it("returns items unchanged when no metadata fields configured", () => {
    const items = [makeItem("user-1")];
    const result = buildItemsWithRelationMetadata(items, [], {});
    expect(result).toBe(items);
  });

  it("injects relation metadata from form values into each item", () => {
    const items = [makeItem("user-1"), makeItem("user-2")];
    const metadataFields = [{ formMetadataKey: "role", relationMetadataKey: "roles" }];
    const formValues = { role: "company_admin" };

    const result = buildItemsWithRelationMetadata(items, metadataFields, formValues);

    expect(result).toHaveLength(2);
    expect(result[0].metadata).toEqual([{ key: "roles", value: "company_admin" }]);
    expect(result[1].metadata).toEqual([{ key: "roles", value: "company_admin" }]);
  });

  it("appends to existing item metadata", () => {
    const items = [makeItem("user-1", [{ key: "existing", value: "data" }])];
    const metadataFields = [{ formMetadataKey: "role", relationMetadataKey: "roles" }];
    const formValues = { role: "company_member" };

    const result = buildItemsWithRelationMetadata(items, metadataFields, formValues);

    expect(result[0].metadata).toEqual([
      { key: "existing", value: "data" },
      { key: "roles", value: "company_member" },
    ]);
  });

  it("skips fields with undefined form value", () => {
    const items = [makeItem("user-1")];
    const metadataFields = [{ formMetadataKey: "role", relationMetadataKey: "roles" }];
    const formValues = {};

    const result = buildItemsWithRelationMetadata(items, metadataFields, formValues);

    expect(result).toBe(items);
  });

  it("skips fields with null form value", () => {
    const items = [makeItem("user-1")];
    const metadataFields = [{ formMetadataKey: "role", relationMetadataKey: "roles" }];
    const formValues = { role: null };

    const result = buildItemsWithRelationMetadata(items, metadataFields, formValues);

    expect(result).toBe(items);
  });

  it("skips fields with empty string form value", () => {
    const items = [makeItem("user-1")];
    const metadataFields = [{ formMetadataKey: "role", relationMetadataKey: "roles" }];
    const formValues = { role: "" };

    const result = buildItemsWithRelationMetadata(items, metadataFields, formValues);

    expect(result).toBe(items);
  });

  it("handles multiple configured metadata fields", () => {
    const items = [makeItem("user-1")];
    const metadataFields = [
      { formMetadataKey: "role", relationMetadataKey: "roles" },
      { formMetadataKey: "since", relationMetadataKey: "active_since" },
    ];
    const formValues = { role: "company_admin", since: "2025-01-01" };

    const result = buildItemsWithRelationMetadata(items, metadataFields, formValues);

    expect(result[0].metadata).toEqual([
      { key: "roles", value: "company_admin" },
      { key: "active_since", value: "2025-01-01" },
    ]);
  });

  it("injects only fields that have a value when some are missing", () => {
    const items = [makeItem("user-1")];
    const metadataFields = [
      { formMetadataKey: "role", relationMetadataKey: "roles" },
      { formMetadataKey: "since", relationMetadataKey: "active_since" },
    ];
    const formValues = { role: "company_admin" };

    const result = buildItemsWithRelationMetadata(items, metadataFields, formValues);

    expect(result[0].metadata).toEqual([{ key: "roles", value: "company_admin" }]);
  });

  it("wraps value in array when asArray is true", () => {
    const items = [makeItem("user-1")];
    const metadataFields = [{ formMetadataKey: "role", relationMetadataKey: "roles", asArray: true }];
    const formValues = { role: "company_admin" };

    const result = buildItemsWithRelationMetadata(items, metadataFields, formValues);

    expect(result[0].metadata).toEqual([{ key: "roles", value: ["company_admin"] }]);
  });

  it("does not wrap value when asArray is false", () => {
    const items = [makeItem("user-1")];
    const metadataFields = [{ formMetadataKey: "role", relationMetadataKey: "roles", asArray: false }];
    const formValues = { role: "company_admin" };

    const result = buildItemsWithRelationMetadata(items, metadataFields, formValues);

    expect(result[0].metadata).toEqual([{ key: "roles", value: "company_admin" }]);
  });
});
