import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@/generated-types/queries": fileURLToPath(
        new URL("./src/__mocks__/queries.ts", import.meta.url),
      ),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    dedupe: ["vue"],
  },
  test: {
    setupFiles: "./vitestSetup.ts",
    silent: "passed-only",
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
