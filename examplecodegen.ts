import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "./**/*.schema.ts",
  documents: import.meta.env.BASE_URL + "/api/codegen/queries",
  generates: {
    "src/generated-types/queries.ts": [
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
  config: { preResolveTypes: true, scalars: { Void: "void" } },
};

export default config;
