import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    dedupe: ["vue"],
  },
  test: {
    setupFiles: "./vitestSetup.ts",
    environment: "jsdom",
    deps: {
      optimizer: {
        web: {
          include: ["@/generated-types/queries"],
        },
      },
    },
  },
});
