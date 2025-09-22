import { describe, it, expect, vi } from "vitest";
import {
  getEntityPageRoute,
  getMappedSlug,
  mapUrlToEntityType,
  extractObjectsByTypename,
  determineDefaultIntialValues,
  getTranslatedMessage,
  extractValueFromObject,
} from "@/helpers";
import {
  type Entity,
  type ColumnList,
  InputFieldTypes,
} from "@/generated-types/queries";
import type { DropzoneFile } from "dropzone";

const mockTranslations = {
  notification: {
    success: {
      "test-run": { title: "The test ran successfully" },
      "variables-run": { title: "Successfully Added some variables: {{name}}" },
    },
  },
};

const getNestedValue = (obj: any, path: string): string => {
  return (
    path.split(".").reduce((acc, key) => acc?.[key], obj) ||
    `missing.translation.${path}`
  );
};

export const createMockDropzoneFile = (
  name = "test.csv",
  type = "text/csv",
  contents = "id,name\n1,test",
): DropzoneFile => {
  const file = new File([contents], name, { type });

  const dropzoneFile = file as unknown as DropzoneFile;
  (dropzoneFile as any).upload = { progress: 0, bytesSent: 0 };
  (dropzoneFile as any).status = "added";

  return dropzoneFile;
};

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
  i18n: {
    global: {
      t: (key: string, variables?: Record<string, string>) => {
        let translation = getNestedValue(mockTranslations, key);
        if (variables) {
          for (const [varKey, varValue] of Object.entries(variables)) {
            translation = translation.replace(`{{${varKey}}}`, varValue);
          }
        }
        return translation;
      },
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
        teaserMetadata: { id: { key: "id", value: "order-789" } },
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

  describe("Get translation outside of setup scope", () => {
    it("should return a translation string from a translations json", () => {
      const result = getTranslatedMessage(
        "notification.success.test-run.title",
      );

      expect(result).toEqual(
        mockTranslations.notification.success["test-run"].title,
      );
    });

    it("should return a translation string from a translations json with included variables", () => {
      const nameVariableString = "variables-have-been-added";
      const result = getTranslatedMessage(
        "notification.success.variables-run.title",
        { name: nameVariableString },
      );

      expect(result).toContain(
        mockTranslations.notification.success["variables-run"].title.replace(
          "{{name}}",
          "",
        ),
      );
      expect(result).toContain(nameVariableString);
    });
  });
});

describe("extractValueFromObject", () => {
  const testObject = {
    user: {
      id: 1,
      name: "John Doe",
      address: {
        street: "123 Main St",
        city: "Anytown",
      },
      posts: [
        { id: 101, title: "First Post", comments: [{ text: "Great!" }] },
        { id: 102, title: "Second Post", comments: [{ text: "Awesome!" }] },
      ],
      tags: ["dev", "js", "vue"],
    },
    status: "active",
    metadata: null,
  };

  describe("extractValueFromObject - basic path", () => {
    it("should extract a value from a top-level key", () => {
      expect(extractValueFromObject(testObject, "status")).toBe("active");
    });

    it("should extract a value from a nested path", () => {
      expect(extractValueFromObject(testObject, "user.name")).toBe("John Doe");
    });

    it("should extract a deeply nested value", () => {
      expect(extractValueFromObject(testObject, "user.address.city")).toBe(
        "Anytown",
      );
    });
  });

  describe("extractValueFromObject - array handling", () => {
    it("should extract a simple array", () => {
      expect(extractValueFromObject(testObject, "user.tags")).toEqual([
        "dev",
        "js",
        "vue",
      ]);
    });

    it("should map over an array of objects and extract a property from each", () => {
      expect(extractValueFromObject(testObject, "user.posts.title")).toEqual([
        "First Post",
        "Second Post",
      ]);
    });

    it("should handle nested arrays and return a nested array result", () => {
      expect(
        extractValueFromObject(testObject, "user.posts.comments.text"),
      ).toEqual([["Great!"], ["Awesome!"]]);
    });

    it("should return undefined if no values are found in the array mapping", () => {
      expect(
        extractValueFromObject(testObject, "user.posts.nonExistentKey"),
      ).toBeUndefined();
    });
  });

  describe("Edge Cases", () => {
    it("should return null if the path is an empty string", () => {
      expect(extractValueFromObject(testObject, "")).toBeNull();
    });

    it("should return undefined if a key in the path does not exist", () => {
      expect(
        extractValueFromObject(testObject, "user.profile.age"),
      ).toBeUndefined();
    });

    it("should return undefined if part of the path is null or undefined", () => {
      expect(
        extractValueFromObject(testObject, "metadata.key"),
      ).toBeUndefined();
    });

    it("should return the value when it is explicitly null", () => {
      expect(extractValueFromObject(testObject, "metadata")).toBeNull();
    });
  });
});
