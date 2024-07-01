import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "/app/src/schemas/*.schema.ts",
  documents: "/app/src/schemas/*.queries.ts",
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
  },
};

export default config;
