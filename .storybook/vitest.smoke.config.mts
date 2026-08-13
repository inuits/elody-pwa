import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";

// Headless smoke test over every story via Storybook portable stories.
// Separate from the root vitest.config.mts on purpose: unit tests mock
// "@/generated-types/queries", while stories are written against the real
// generated module.
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: /^@\/main(\.ts)?$/,
        replacement: fileURLToPath(new URL("./mockMain.ts", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("../src", import.meta.url)),
      },
      {
        // Bare "vue-unicons" only (dist/icons keeps resolving to the real
        // package): its UMD build breaks under vitest interop and the icon
        // lib is only filled during app bootstrap, which portable stories
        // skip — BaseIcon.vue would crash on `Unicon.lib.find(...).path`.
        find: /^vue-unicons$/,
        replacement: fileURLToPath(
          new URL("./stubs/vue-unicons.ts", import.meta.url),
        ),
      },
      {
        find: /^openseadragon-select-plugin$/,
        replacement: fileURLToPath(
          new URL("./stubs/openseadragon-select-plugin.ts", import.meta.url),
        ),
      },
    ],
    dedupe: ["vue"],
    conditions: ["import", "module", "browser", "default"],
  },
  test: {
    include: [fileURLToPath(new URL("./smoke.test.ts", import.meta.url))],
    setupFiles: [fileURLToPath(new URL("./smokeSetup.ts", import.meta.url))],
    environment: "jsdom",
    testTimeout: 30000,
    // Packages with extensionless ESM imports need vite's resolution instead
    // of raw Node ESM.
    server: {
      deps: {
        inline: [
          "vue3-openlayers",
          "ol-contextmenu",
          "ol-ext",
          "openseadragon-select-plugin",
          /node_modules\/ol-/,
        ],
      },
    },
  },
});
