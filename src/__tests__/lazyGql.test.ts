import { describe, expect, it } from "vitest";
import { gql as apolloGql } from "@apollo/client";
import { print } from "graphql";
import { gql } from "@/lazyGql";

const build = (tag: typeof gql) => {
  const author = tag`
    fragment author on Person {
      name
    }
  `;
  const work = tag`
    fragment work on Work {
      title
      author {
        ...author
      }
    }
    ${author}
  `;
  const query = tag`
    query getWork($id: String!) {
      Entity(id: $id) {
        ...work
        creator {
          ...author
        }
      }
    }
    ${work}
    ${author}
  `;
  return query;
};

describe("lazy gql", () => {
  it("prints the same document as the regular gql tag", () => {
    expect(print(build(gql))).toBe(print(build(apolloGql)));
  });

  it("lists each fragment once", () => {
    const names = build(gql).definitions.map(
      (definition) => (definition as { name?: { value: string } }).name?.value,
    );
    expect(names).toEqual(["getWork", "work", "author"]);
  });

  it("parses a document only when it is used", () => {
    const broken = gql`query {`;
    expect(broken.kind).toBe("Document");
    expect(() => broken.definitions).toThrow();
  });

  it("keeps no source locations on its nodes", () => {
    const definitions = build(gql).definitions;
    expect(JSON.stringify(definitions)).not.toContain('"loc"');
  });

  it("parses a document once", () => {
    const document = build(gql);
    expect(document.definitions).toBe(document.definitions);
  });
});
