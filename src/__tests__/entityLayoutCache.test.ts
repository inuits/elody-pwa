import { beforeEach, describe, expect, it } from "vitest";
import { gql } from "@apollo/client/core";
import { Kind, print, type DocumentNode } from "graphql";
import {
  cachedEntityLayout,
  clearEntityLayouts,
  layoutIsCacheable,
  leanEntityDocument,
  mergeEntityLayout,
  storeEntityLayout,
} from "@/entityLayoutCache";

const entityQuery = (productionView: string, userView = "label") => gql`
  query getEntityById($id: String!, $type: String!) {
    Entity(id: $id, type: $type) {
      ...fullEntity
      intialValues {
        canUpdate
      }
    }
  }
  fragment fullEntity on Entity {
    id
    type
    ... on Production {
      ...fullProduction
    }
    ... on User {
      intialValues {
        email
      }
      entityView {
        ${userView}
      }
    }
  }
  fragment fullProduction on Production {
    intialValues {
      title
    }
    relationValues
    entityView {
      ${productionView}
    }
  }
  fragment inputfield on InputField {
    type
  }
`;

const fragmentNames = (document: DocumentNode) =>
  document.definitions
    .filter((definition) => definition.kind === Kind.FRAGMENT_DEFINITION)
    .map(
      (definition) => (definition as { name: { value: string } }).name.value,
    );

describe("leanEntityDocument", () => {
  const lean = () =>
    print(
      leanEntityDocument(
        entityQuery("column { inputField { ...inputfield } }"),
      ),
    );

  it("leaves the page layout out", () => {
    expect(lean()).not.toContain("entityView");
  });

  it("keeps the entity's values", () => {
    expect(lean()).toContain("intialValues");
    expect(lean()).toContain("relationValues");
    expect(lean()).toContain("canUpdate");
  });

  it("drops the fragments only the layout used", () => {
    const document = leanEntityDocument(
      entityQuery("column { inputField { ...inputfield } }"),
    );
    expect(fragmentNames(document)).toEqual(["fullEntity", "fullProduction"]);
  });

  it("returns the same document object for the same input", () => {
    const document = entityQuery("label");
    expect(leanEntityDocument(document)).toBe(leanEntityDocument(document));
  });
});

describe("layoutIsCacheable", () => {
  it("caches a layout that reads nothing from the entity", () => {
    expect(
      layoutIsCacheable(entityQuery("label column { label }"), "Production"),
    ).toBe(true);
  });

  it("never caches a layout with a permission check", () => {
    expect(
      layoutIsCacheable(
        entityQuery('panels { can(input: ["update:production"]) }'),
        "Production",
      ),
    ).toBe(false);
  });

  it("never caches a layout with a field permission list", () => {
    expect(
      layoutIsCacheable(
        entityQuery('metaData { permitted(input: ["read:x"]) }'),
        "Production",
      ),
    ).toBe(false);
  });

  it("never caches a layout that shows the entity's own data", () => {
    expect(
      layoutIsCacheable(entityQuery("panels { bulkData }"), "Production"),
    ).toBe(false);
  });

  it("never caches a layout with comments, whose posting right depends on the entity", () => {
    expect(
      layoutIsCacheable(
        entityQuery("comments: commentsElement { label readOnly }"),
        "Production",
      ),
    ).toBe(false);
  });

  it("judges each entity type by its own layout", () => {
    const document = entityQuery("label", 'panels { can(input: ["x"]) }');
    expect(layoutIsCacheable(document, "Production")).toBe(true);
    expect(layoutIsCacheable(document, "User")).toBe(false);
  });

  it("checks fragments used inside the layout too", () => {
    const document = gql`
      query getEntityById {
        Entity(id: "1", type: "production") {
          ... on Production {
            entityView {
              ...guarded
            }
          }
        }
      }
      fragment guarded on WindowElement {
        panels {
          can(input: ["x"])
        }
      }
    `;
    expect(layoutIsCacheable(document, "Production")).toBe(false);
  });
});

describe("entity layout cache", () => {
  const key = { tenant: "t1", user: "u1", entityType: "production" };

  beforeEach(() => clearEntityLayouts());

  it("returns a stored layout", () => {
    storeEntityLayout(key, { column: 1 });
    expect(cachedEntityLayout(key)).toEqual({ column: 1 });
  });

  it("keeps tenants, users and entity types apart", () => {
    storeEntityLayout(key, { column: 1 });
    expect(cachedEntityLayout({ ...key, tenant: "t2" })).toBeUndefined();
    expect(cachedEntityLayout({ ...key, user: "u2" })).toBeUndefined();
    expect(cachedEntityLayout({ ...key, entityType: "tag" })).toBeUndefined();
  });
});

describe("entity-specific values inside the layout", () => {
  const withSelectedOptions = gql`
    query getEntityById($id: String!, $type: String!) {
      Entity(id: $id, type: $type) {
        ... on Production {
          intialValues {
            title
          }
          entityView {
            label
            genres: metaData {
              label
              inputField(type: genreTypeField) {
                ...inputfield
              }
            }
          }
        }
      }
    }
    fragment inputfield on InputField {
      type
      selectedOptions
    }
  `;

  it("asks the lean query only for the paths to them", () => {
    const lean = print(leanEntityDocument(withSelectedOptions));
    expect(lean).toContain("genres: metaData");
    expect(lean).toContain("inputField(type: genreTypeField)");
    expect(lean).toContain("selectedOptions");
    expect(lean).not.toMatch(/\blabel\b/);
    expect(lean).not.toMatch(/\btype\n/);
  });

  it("stores the layout without them", () => {
    clearEntityLayouts();
    const key = { tenant: "", user: "u", entityType: "production" };
    storeEntityLayout(key, {
      genres: { inputField: { type: "x", selectedOptions: [{ id: "GN-1" }] } },
    });
    expect(cachedEntityLayout(key)).toEqual({
      genres: { inputField: { type: "x" } },
    });
  });

  it("puts this entity's values back into the cached layout", () => {
    expect(
      mergeEntityLayout(
        {
          label: "Info",
          genres: { label: "Genres", inputField: { type: "x" } },
        },
        { genres: { inputField: { selectedOptions: [{ id: "GN-2" }] } } },
      ),
    ).toEqual({
      label: "Info",
      genres: {
        label: "Genres",
        inputField: { type: "x", selectedOptions: [{ id: "GN-2" }] },
      },
    });
  });
});
