import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: process.env.url + "/api/graphql",
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
  },
};

export default config;
