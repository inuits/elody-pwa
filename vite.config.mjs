import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

import viteCompression from "vite-plugin-compression";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";
import tailwindSvgPlugin from "./plugin/vite-plugin-tailwind-svg.js";

const parsePort = (port) => {
  return parseInt(port) ? parseInt(port) : 8080;
};

const cacheDir =
  process.env.NODE_ENV === "development-docker"
    ? "/app/node_modules/.vite"
    : "../node_modules/.vite";

// https://vitejs.dev/config/
const viteConfig = defineConfig({
  plugins: [
    vue(),
    viteCompression(),
    vueDevTools(),
    tailwindSvgPlugin(),
    tailwindcss(),
  ],
  define: {
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "openseadragon-select-plugin": "openseadragon-select-plugin/dist/index.umd.js"
    },
    dedupe: ["vue"],
    conditions: ["import", "module", "browser", "default"],
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
    commonjsOptions: {
      transformMixedEsModules: true,
      include: /node_modules|openseadragon-select-plugin/,
    },
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
          openseadragon: ["openseadragon", "openseadragon-select-plugin"],
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
            "@tiptap/core",
            "@tiptap/extension-bold",
            "@tiptap/extension-italic",
            "@tiptap/extension-document",
            "@tiptap/extension-paragraph",
            "@tiptap/extension-text",
          ],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ["session-vue-3-oidc-library", "date-fns"],
    include: [
      "openseadragon-select-plugin",
    ],
    esbuildOptions: {
      plugins: [],
    },
  },
});

export default viteConfig;
