// eslint.config.js
import pluginVue from "eslint-plugin-vue";
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from "@vue/eslint-config-typescript";
import { includeIgnoreFile } from "@eslint/compat";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import { fileURLToPath } from "node:url";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default [
  ...defineConfigWithVueTs(
    pluginVue.configs["flat/essential"],
    vueTsConfigs.recommended,
    skipFormatting,
    includeIgnoreFile(gitignorePath, "Imported .gitignore patterns"),
  ),
  {
    files: ["src/**/*.vue", "src/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "error",
    },
  },
  {
    files: [
      "src/components/SanitizedHtml.vue",
      "src/components/CustomIcon.vue",
    ],
    rules: {
      "vue/no-v-html": "off",
    },
  },
];
