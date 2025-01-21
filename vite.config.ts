import { fileURLToPath, URL } from "node:url";
import { defineConfig, mergeConfig } from "vite";
import { defineConfig as defineVitestConfig } from "vitest/config";
import viteCompression from "vite-plugin-compression";
import vue from "@vitejs/plugin-vue";

const parsePort = (port: string) => {
  return parseInt(port) ? parseInt(port) : 8080;
};

const cacheDir =
  process.env.NODE_ENV === "development-docker"
    ? "/app/node_modules/.vite"
    : "../node_modules/.vite";

// https://vitejs.dev/config/
const viteConfig = defineConfig({
  plugins: [vue(), viteCompression()],
  define: {
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    dedupe: ["vue"],
  },
  server: {
    host: "0.0.0.0",
    port: parsePort("8080"),
    hmr: {
      clientPort: parsePort(process.env.PROJECT_PORT || "8000"),
    },
    watch: {
      usePolling: true,
    },
  },
  cacheDir,
  build: {
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      external: ["pdfjs-dist/types/src/display/api"],
      output: {
        manualChunks: {
          vue: ["vue", "vue-router"],
          apollo: ["@apollo/client", "@vue/apollo-composable"],
          leaflet: ["leaflet", "@vue-leaflet/vue-leaflet"],
          sentry: [
            "@sentry/browser",
            "@sentry/integrations",
            "@sentry/tracing",
            "@sentry/vue",
          ],
          openseadragon: ["openseadragon"],
          pdfjs: ["pdfjs-dist"],
          ol: ["ol"],
          chart: [
            "chart.js",
            "chartjs-adapter-date-fns",
            "chartjs-plugin-datasource-prometheus",
          ],
          openlayers: ["vue3-openlayers"],
          dropzone: ["dropzone"],
          unicons: ["vue-unicons"],
          tiptap: [
            "@tiptap/vue-3",
            "@tiptap/extension-color",
            "@tiptap/extension-list-item",
            "@tiptap/extension-text-style",
            "@tiptap/starter-kit",
          ],
        },
      },
    },
    commonjsOptions: {
      include: [
        "@tiptap/vue-3",
        "@tiptap/extension-color",
        "@tiptap/extension-list-item",
        "@tiptap/extension-text-style",
        "@tiptap/starter-kit",
      ],
    },
  },
  optimizeDeps: {
    exclude: ["session-vue-3-oidc-library", "date-fns"],
    include: [
      "vue",
      "@vue/runtime-core",
      "@tiptap/vue-3",
      "@tiptap/extension-color",
      "@tiptap/extension-list-item",
      "@tiptap/extension-text-style",
      "@tiptap/starter-kit",
    ],
  },
});

const vitestConfig = defineVitestConfig({
  test: {
    setupFiles: "./vitestSetup.ts",
    environment: "jsdom",
  },
});

export default mergeConfig(viteConfig, vitestConfig);
