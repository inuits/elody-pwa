import { describe, expect, it } from "vitest";
import { gql } from "@apollo/client/core";
import { print } from "graphql";
import { aliasAsKeyTransform } from "@/aliasAsKeyTransform";

const transform = (query: string) =>
  print(aliasAsKeyTransform.transformDocument(gql(query)));

const normalize = (query: string) => print(gql(query));

describe("aliasAsKeyTransform", () => {
  it("adds the alias as key when an aliased metaData has none", () => {
    expect(
      transform(`query Q { panel { premiere_date: metaData { label(input: "x") } } }`),
    ).toBe(
      normalize(
        `query Q { panel { premiere_date: metaData { label(input: "x") key(input: "premiere_date") } } }`,
      ),
    );
  });

  it("keeps an explicit key that differs from the alias", () => {
    const query = `query Q { panel { owner: metaData { key(input: "person") } } }`;
    expect(transform(query)).toBe(normalize(query));
  });

  it("leaves non-aliased metaData and other fields untouched", () => {
    const query = `query Q { panel { metaData { label(input: "x") } title: label(input: "y") } }`;
    expect(transform(query)).toBe(normalize(query));
  });

  it("handles uploadMetadata and nested repetition panels", () => {
    expect(
      transform(
        `query Q { a { file: uploadMetadata { label } repeated: panels { inner { name: metaData { label } } } } }`,
      ),
    ).toBe(
      normalize(
        `query Q { a { file: uploadMetadata { label key(input: "file") } repeated: panels { inner { name: metaData { label key(input: "name") } } } } }`,
      ),
    );
  });

  it("adds the key inside fragments", () => {
    expect(
      transform(`fragment F on Panel { title: metaData { label } }`),
    ).toBe(
      normalize(`fragment F on Panel { title: metaData { label key(input: "title") } }`),
    );
  });

  it("adds the alias as key argument when an aliased keyValue has none", () => {
    expect(
      transform(`query Q { intialValues { premiere_date: keyValue(source: metadata) } }`),
    ).toBe(
      normalize(
        `query Q { intialValues { premiere_date: keyValue(source: metadata, key: "premiere_date") } }`,
      ),
    );
  });

  it("keeps an explicit keyValue key that differs from the alias", () => {
    const query = `query Q { intialValues { slug: keyValue(key: "id", source: root) } }`;
    expect(transform(query)).toBe(normalize(query));
  });

  it("leaves a keyValue without alias untouched", () => {
    const query = `query Q { intialValues { keyValue(key: "title", source: metadata) } }`;
    expect(transform(query)).toBe(normalize(query));
  });
});
