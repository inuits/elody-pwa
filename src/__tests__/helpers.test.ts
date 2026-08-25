import { describe, it, expect, vi } from "vitest";
import {
  getEntityPageRoute,
  getMappedSlug,
  mapUrlToEntityType,
  extractObjectsByTypename,
  determineDefaultIntialValues,
  normalizeEmptyInitialValuesByFieldType,
  getTranslatedMessage,
  extractValueFromObject,
  looksLikeEntityId,
  stripEmbeddedViewerSuffix,
  stripHighlightTags,
  deepToRaw,
  getEnvironmentLabel,
  downloadFile,
} from "@/helpers";
import { reactive } from "vue";
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

describe("downloadFile", () => {
  it("creates an object URL, triggers a download link click, and revokes the URL", () => {
    const blob = new Blob(["binary-content"], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const mockUrl = "blob:mock-url";
    const createObjectURLSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue(mockUrl);
    const revokeObjectURLSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const clickSpy = vi.fn();
    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockReturnValue({
        set href(_value: string) {},
        set download(_value: string) {},
        click: clickSpy,
      } as unknown as HTMLAnchorElement);

    downloadFile("inscription.xlsx", blob);

    expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith(mockUrl);

    createElementSpy.mockRestore();
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });
});

describe("looksLikeEntityId", () => {
  it("recognizes prefixed entity ids", () => {
    for (const id of ["PERS-AbC12", "CORP-XyZ9", "MW-JK174138", "BB-9789012345678", "W-123", "T-abc_def"]) {
      expect(looksLikeEntityId(id)).toBe(true);
    }
  });

  it("recognizes uuids", () => {
    expect(looksLikeEntityId("a1b2c3d4-e5f6-7890-abcd-ef1234567890")).toBe(true);
  });

  it("treats plain names as non-ids", () => {
    for (const name of ["Wolfgang Amadeus Mozart", "Madonna", "Bach", "Jean-Paul Sartre", ""]) {
      expect(looksLikeEntityId(name)).toBe(false);
    }
  });

  it("handles null/undefined", () => {
    expect(looksLikeEntityId(undefined)).toBe(false);
    expect(looksLikeEntityId(null)).toBe(false);
  });
});

describe("stripEmbeddedViewerSuffix", () => {
  it("strips the /embed/viewer suffix from an asset url", () => {
    expect(
      stripEmbeddedViewerSuffix(
        "https://dams.antwerpen.be/assets/813ef4f8/embed/viewer",
      ),
    ).toBe("https://dams.antwerpen.be/assets/813ef4f8");
  });

  it("strips the suffix regardless of the path segment before it", () => {
    expect(
      stripEmbeddedViewerSuffix(
        "https://dams1.antwerpen.be/asset/bGPQS9tp/embed/viewer",
      ),
    ).toBe("https://dams1.antwerpen.be/asset/bGPQS9tp");
  });

  it("handles a trailing slash after the suffix", () => {
    expect(
      stripEmbeddedViewerSuffix(
        "https://dams.antwerpen.be/assets/813ef4f8/embed/viewer/",
      ),
    ).toBe("https://dams.antwerpen.be/assets/813ef4f8");
  });

  it("preserves query string and hash", () => {
    expect(
      stripEmbeddedViewerSuffix(
        "https://dams.antwerpen.be/assets/813ef4f8/embed/viewer?lang=nl#top",
      ),
    ).toBe("https://dams.antwerpen.be/assets/813ef4f8?lang=nl#top");
  });

  it("returns the url unchanged when the suffix is absent", () => {
    expect(
      stripEmbeddedViewerSuffix("https://dams.antwerpen.be/assets/813ef4f8"),
    ).toBe("https://dams.antwerpen.be/assets/813ef4f8");
  });
});

describe("stripHighlightTags", () => {
  it("removes the search highlight markup added by typesense", () => {
    expect(stripHighlightTags("Met <mark>kat</mark> op reis")).toBe(
      "Met kat op reis",
    );
  });

  it("removes every occurrence", () => {
    expect(stripHighlightTags("<mark>Kip</mark> en <mark>kat</mark>")).toBe(
      "Kip en kat",
    );
  });

  it("leaves a value without highlight markup untouched", () => {
    expect(stripHighlightTags("Kip en kat")).toBe("Kip en kat");
  });

  it("keeps other markup so unrelated content is not silently altered", () => {
    expect(stripHighlightTags("<p>Kip <mark>en</mark> kat</p>")).toBe(
      "<p>Kip en kat</p>",
    );
  });

  it("returns non-string values unchanged", () => {
    expect(stripHighlightTags(undefined)).toBe(undefined);
    expect(stripHighlightTags(null)).toBe(null);
    expect(stripHighlightTags(42)).toBe(42);
  });
});

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

  it("should replace empty string with false for checkbox fields", () => {
    const initialData = {
      is_venue: true,
      is_booker: "",
      is_company: true,
    };

    const columns: ColumnList = {
      column: {
        __typename: "PanelMetaData",
        inputField: { type: InputFieldTypes.Checkbox },
        key: "is_venue",
      },
      column2: {
        __typename: "PanelMetaData",
        inputField: { type: InputFieldTypes.Checkbox },
        key: "is_booker",
      },
      column3: {
        __typename: "PanelMetaData",
        inputField: { type: InputFieldTypes.Checkbox },
        key: "is_company",
      },
    };

    const result = determineDefaultIntialValues(initialData, columns);

    expect(result.is_venue).toEqual(true);
    expect(result.is_booker).toEqual(false);
    expect(result.is_company).toEqual(true);
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

describe("normalizeEmptyInitialValuesByFieldType", () => {
  it("normalizes empty checkbox and multiselect fields from a PanelMetaData list", () => {
    const initialData = {
      display_italics: "",
      tags: "",
      title: "keep me",
      is_venue: true,
    };

    const fields = [
      {
        __typename: "PanelMetaData",
        inputField: { type: InputFieldTypes.Checkbox },
        key: "display_italics",
      },
      {
        __typename: "PanelMetaData",
        inputField: { type: InputFieldTypes.DropdownMultiselectMetadata },
        key: "tags",
      },
      {
        __typename: "PanelMetaData",
        inputField: { type: InputFieldTypes.Text },
        key: "title",
      },
      {
        __typename: "PanelMetaData",
        inputField: { type: InputFieldTypes.Checkbox },
        key: "is_venue",
      },
    ] as any;

    const result = normalizeEmptyInitialValuesByFieldType(initialData, fields);

    expect(result.display_italics).toEqual(false);
    expect(result.tags).toEqual([]);
    expect(result.title).toEqual("keep me");
    expect(result.is_venue).toEqual(true);
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

  describe("deepToRaw", () => {
    it("returns a structuredClone-able deep copy of plain nested data", () => {
      const input = { a: 1, b: { c: [1, 2, { d: "x" }] }, e: null };

      const raw = deepToRaw(input);

      expect(raw).toEqual(input);
      expect(() => structuredClone(raw)).not.toThrow();
    });

    it("unwraps Vue reactive proxies into plain, cloneable objects", () => {
      const input = reactive({ a: 1, nested: reactive({ b: 2 }) });

      const raw = deepToRaw(input);

      expect(raw).toEqual({ a: 1, nested: { b: 2 } });
      expect(() => structuredClone(raw)).not.toThrow();
    });

    it("unwraps nested reactive proxy arrays so the search/filter state is structured-cloneable", () => {
      // Mirrors the shape that broke picker/library search: queryVariables held
      // reactive advancedFilterInputs whose `key` was a reactive array, which
      // structuredClone rejects with a DataCloneError.
      const stateObject = {
        queryVariables: {
          advancedFilterInputs: [
            reactive({
              type: "text",
              key: reactive(["vlacc:1|properties.level.value"]),
              value: "Rug",
              match_exact: true,
              operator: "and",
            }),
          ],
        },
      };

      const raw = deepToRaw(stateObject);

      expect(raw).toEqual({
        queryVariables: {
          advancedFilterInputs: [
            {
              type: "text",
              key: ["vlacc:1|properties.level.value"],
              value: "Rug",
              match_exact: true,
              operator: "and",
            },
          ],
        },
      });
      expect(() => structuredClone(raw)).not.toThrow();
    });

    it("drops functions so the result can be structured-cloned", () => {
      const input = { keep: "yes", fn: () => 42, nested: { cb: () => {} } };

      const raw = deepToRaw(input) as any;

      expect(raw.keep).toBe("yes");
      expect(raw.fn).toBeUndefined();
      expect(raw.nested).toEqual({});
      expect(() => structuredClone(raw)).not.toThrow();
    });

    it("drops non-cloneable host objects (Window / DOM nodes) instead of throwing", () => {
      const input = {
        title: "t",
        leaked: window,
        node: document.createElement("div"),
        relation: { value: "keep", el: document.body },
      };

      const raw = deepToRaw(input) as any;

      expect(raw.title).toBe("t");
      expect(raw.leaked).toBeUndefined();
      expect(raw.node).toBeUndefined();
      expect(raw.relation).toEqual({ value: "keep" });
      expect(() => structuredClone(raw)).not.toThrow();
    });

    it("preserves Date values instead of flattening them to an empty object", () => {
      const when = new Date("2026-01-01T00:00:00.000Z");

      const raw = deepToRaw({ when }) as any;

      expect(raw.when instanceof Date).toBe(true);
      expect(raw.when.toISOString()).toBe("2026-01-01T00:00:00.000Z");
      expect(() => structuredClone(raw)).not.toThrow();
    });
  });
});

describe("getEnvironmentLabel", () => {
  it("returns an empty label for production and for an unset environment", () => {
    expect(getEnvironmentLabel("prod")).toBe("");
    expect(getEnvironmentLabel("PRODUCTION")).toBe("");
    expect(getEnvironmentLabel("")).toBe("");
    expect(getEnvironmentLabel(undefined)).toBe("");
  });

  it("returns an uppercased label for non-production environments", () => {
    expect(getEnvironmentLabel("uat")).toBe("UAT");
    expect(getEnvironmentLabel(" dev ")).toBe("DEV");
  });
});
