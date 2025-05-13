import { defineConfig } from "vitest/config";

export default defineConfig({
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
