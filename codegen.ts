import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://dashboard.dams.localhost:8100/api/graphql",
  generates: {
    "generated-types/queries.ts": {
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
