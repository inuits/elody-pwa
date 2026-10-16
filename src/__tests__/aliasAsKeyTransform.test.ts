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
    const query = `query Q { panel { owner: metaData { label(input: "x") key(input: "person") } } }`;
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
        `query Q { a { file: uploadMetadata { label(input: "metadata.labels.file") key(input: "file") } repeated: panels { inner { name: metaData { label(input: "metadata.labels.name") key(input: "name") } } } } }`,
      ),
    );
  });

  it("adds the key inside fragments", () => {
    expect(
      transform(`fragment F on Panel { title: metaData { label } }`),
    ).toBe(
      normalize(
        `fragment F on Panel { title: metaData { label(input: "metadata.labels.title") key(input: "title") } }`,
      ),
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

  it("defaults the label to metadata.labels.<key>", () => {
    expect(
      transform(`query Q { panel { title: metaData { inputField { type } } } }`),
    ).toBe(
      normalize(
        `query Q { panel { title: metaData { inputField { type } key(input: "title") label(input: "metadata.labels.title") } } }`,
      ),
    );
  });

  it("derives the default label from an explicit key", () => {
    expect(
      transform(`query Q { panel { owner: metaData { key(input: "person") } } }`),
    ).toBe(
      normalize(
        `query Q { panel { owner: metaData { key(input: "person") label(input: "metadata.labels.person") } } }`,
      ),
    );
  });

  it("defaults the label of a non-aliased metaData with an explicit key", () => {
    expect(
      transform(`query Q { panel { metaData { key(input: "title") } } }`),
    ).toBe(
      normalize(
        `query Q { panel { metaData { key(input: "title") label(input: "metadata.labels.title") } } }`,
      ),
    );
  });

  it("keeps an explicit label", () => {
    const query = `query Q { panel { title: metaData { label(input: "custom.title") key(input: "title") } } }`;
    expect(transform(query)).toBe(normalize(query));
  });

  it("ignores aliased label and key siblings", () => {
    expect(
      transform(`query Q { panel { title: metaData { other: label(input: "x") alt: key(input: "y") } } }`),
    ).toBe(
      normalize(
        `query Q { panel { title: metaData { other: label(input: "x") alt: key(input: "y") key(input: "title") label(input: "metadata.labels.title") } } }`,
      ),
    );
  });

  it("fills a bare key with the alias", () => {
    expect(transform(`query Q { panel { status: metaData { key } } }`)).toBe(
      normalize(
        `query Q { panel { status: metaData { key(input: "status") label(input: "metadata.labels.status") } } }`,
      ),
    );
  });
});
