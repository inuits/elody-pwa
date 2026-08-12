import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "/app/schemas/*.schema.ts",
  documents: "/app/schemas/*.queries.ts",
  generates: {
    "src/generated-types/queries.ts": {
      plugins: [
        {
          add: {
            content:
              "/* eslint-disable */\n// THIS FILE IS GENERATED, DO NOT EDIT!",
          },
        },
        { typescript: {} },
        { "typescript-operations": {} },
        { "typed-document-node": {} },
      ],
    },
  },
  config: {
    preResolveTypes: true,
    scalars: { Void: "void" },
    useTypeImports: true,
    dedupeFragments: true,
    // Emit operations as gql templates that interpolate shared fragments
    // instead of inlining every fragment AST into each operation document;
    // shrinks the runtime part of the generated file ~15x (19.4 MB -> 1.3 MB).
    documentMode: "graphQLTag",
    gqlImport: "@apollo/client#gql",
    // Reference fragment types from operation result types instead of
    // re-expanding them inline in every operation; together with graphQLTag
    // this shrinks the generated file from ~81 MB to ~7 MB.
    inlineFragmentTypes: "combine",
  },
};

export default config;
