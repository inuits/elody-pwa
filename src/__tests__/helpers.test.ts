import { describe, it, expect, vi } from "vitest";
import {
  getEntityPageRoute,
  getMappedTypeForRoute,
  mapUrlToEntityType,
} from "@/helpers";
import { Entity } from "@/generated-types/queries";

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
  describe("getMappedTypeForRoute", () => {
    it("should return the mapped type for a known entity type", () => {
      const entity: Entity = { __typename: "Product" };
      const result = getMappedTypeForRoute(entity);
      expect(result).toBe("our-products");
    });

    it("should return the entity type when no mapping exists", () => {
      const entity: Entity = { __typename: "Unknown", type: "UnknownType" };
      const result = getMappedTypeForRoute(entity);
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
