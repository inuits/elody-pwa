import { describe, it, expect, vi } from "vitest";
import {
  getEntityPageRoute,
  getMappedSlug,
  mapUrlToEntityType,
  extractObjectsByTypename,
  determineDefaultIntialValues,
} from "@/helpers";
import {
  type Entity,
  type ColumnList,
  InputFieldTypes,
} from "@/generated-types/queries";

vi.mock("@/main", () => ({
  typeUrlMapping: {
    mapping: {
      Product: "our-products",
      Category: "our-categories",
      Order: "our-orders",
      Customer: "our-customers",
      Invoice: "our-invoices",
    },
    reverseMapping: {
      "our-products": "Product",
      "our-categories": "Category",
      "our-orders": "Order",
      "our-customers": "Customer",
      "our-invoices": "Invoice",
    },
  },
}));

describe("Entity Mapping Functions", () => {
  describe("getMappedSlug", () => {
    it("should return the mapped type for a known entity type", () => {
      const entity: Entity = { __typename: "Product" };
      const result = getMappedSlug(entity);
      expect(result).toBe("our-products");
    });

    it("should return the entity type when no mapping exists", () => {
      const entity: Entity = { __typename: "Unknown", type: "UnknownType" };
      const result = getMappedSlug(entity);
      expect(result).toBe("UnknownType");
    });
  });

  describe("mapUrlToEntityType", () => {
    it("should return the correct mapped type value for a known type", () => {
      const result = mapUrlToEntityType("our-products");
      expect(result).toBe("Product");
    });

    it("should return undefined for an unknown type", () => {
      const result = mapUrlToEntityType("unknown-type");
      expect(result).toBeUndefined();
    });
  });

  describe("getEntityPageRoute", () => {
    it("should return the correct route object when the entity has a uuid", () => {
      const entity: Entity = {
        __typename: "Category",
        uuid: "category-456",
      };
      const result = getEntityPageRoute(entity, "category-list");
      expect(result).toEqual({
        name: "category-list",
        params: {
          id: "category-456",
          type: "our-categories",
        },
      });
    });

    it("should return the correct route object when the entity has teaserMetadata", () => {
      const entity: Entity = {
        __typename: "Order",
        teaserMetadata: [{ key: "id", value: "order-789" }],
      };
      const result = getEntityPageRoute(entity, "order-list");
      expect(result).toEqual({
        name: "order-list",
        params: {
          id: "order-789",
          type: "our-orders",
        },
      });
    });

    it("should return the route with undefined id if no slug, uuid, or teaserMetadata are available", () => {
      const entity: Entity = {
        __typename: "Invoice",
        type: "our-invoices",
      };
      const result = getEntityPageRoute(entity, "invoice-list");
      expect(result).toEqual({
        name: "invoice-list",
        params: {
          id: undefined,
          type: "our-invoices",
        },
      });
    });
  });
});

describe("determineDefaultIntialValues", () => {
  it("should replace empty string with an array for fields of specified type", () => {
    const initialData = {
      field1: "",
      field2: "value",
      field3: "",
    };

    const columns: ColumnList = {
      column: {
        __typename: "PanelMetaData",
        inputField: { type: InputFieldTypes.DropdownMultiselectMetadata },
        key: "field1",
      },
      column2: {
        __typename: "PanelMetaData",
        inputField: { type: InputFieldTypes.DropdownMultiselectMetadata },
        key: "field3",
      },
    };

    const result = determineDefaultIntialValues(initialData, columns);

    expect(result.field1).toEqual([]);
    expect(result.field2).toEqual("value");
    expect(result.field3).toEqual([]);
  });

  it("should not replace non-empty strings", () => {
    const initialData = {
      field1: "notEmpty",
    };

    const columns: ColumnList = {
      column: {
        __typename: "PanelMetaData",
        inputField: { type: InputFieldTypes.DropdownMultiselectMetadata },
        key: "field1",
      },
    };

    const result = determineDefaultIntialValues(initialData, columns);

    expect(result.field1).toEqual("notEmpty");
  });

  it("should not modify fields not of specified type", () => {
    const initialData = {
      field1: "",
    };

    const columns: ColumnList = {
      column: {
        __typename: "PanelMetaData",
        inputField: { type: "someOtherType" },
        key: "field1",
      },
    };

    const result = determineDefaultIntialValues(initialData, columns);

    expect(result.field1).toEqual("");
  });
});

describe("extractObjectsByTypename", () => {
  it("should extract objects matching the specified typename", () => {
    const input = {
      key1: { __typename: "PanelMetaData", data: "value1" },
      key2: { __typename: "SomeOtherType", data: "value2" },
      key3: {
        nested: {
          __typename: "PanelMetaData",
          data: "value3",
        },
      },
    };

    const result = extractObjectsByTypename(input, "PanelMetaData");

    expect(result).toEqual([
      { __typename: "PanelMetaData", data: "value1" },
      { __typename: "PanelMetaData", data: "value3" },
    ]);
  });

  it("should return an empty array if no objects match the typename", () => {
    const input = {
      key1: { __typename: "SomeOtherType", data: "value1" },
      key2: { __typename: "AnotherType", data: "value2" },
    };

    const result = extractObjectsByTypename(input, "PanelMetaData");

    expect(result).toEqual([]);
  });
});
