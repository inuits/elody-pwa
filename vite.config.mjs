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
      "openseadragon-select-plugin":
        "openseadragon-select-plugin/dist/index.umd.js",
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
    assetsDir: "static-assets-pwa",
    sourcemap: false,
    minify: "esbuild",
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/, /openseadragon-select-plugin/],
    },
    rollupOptions: {
      external: ["pdfjs-dist/types/src/display/api"],
      output: {
        manualChunks(id) {
          // App: generated GraphQL types/queries
          if (id.includes("/src/generated-types/")) return "generated-queries";

          if (!id.includes("node_modules")) return;

          // Vendor chunks
          if (id.includes("/mirador/")) return "mirador";
          if (id.includes("/tify/")) return "tify";
          if (id.match(/\/node_modules\/(vue\/|vue-router\/)/)) return "vue";
          if (
            id.includes("/@apollo/") ||
            id.includes("/@vue/apollo-composable")
          )
            return "apollo";
          if (id.includes("/leaflet/") || id.includes("/@vue-leaflet/"))
            return "leaflet";
          if (id.includes("/@sentry/")) return "sentry";
          if (id.includes("/openseadragon")) return "openseadragon";
          if (id.includes("/pdfjs-dist/")) return "pdfjs";
          if (id.match(/\/node_modules\/ol\//)) return "ol";
          if (id.includes("/chart.js/") || id.includes("/chartjs"))
            return "chart";
          if (id.includes("/vue3-openlayers/")) return "openlayers";
          if (id.includes("/dropzone/")) return "dropzone";
          if (id.includes("/vue-unicons/")) return "unicons";
          if (id.includes("/@tiptap/")) return "tiptap";
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ["session-vue-3-oidc-library", "date-fns"],
    include: ["openseadragon-select-plugin"],
    esbuildOptions: {
      plugins: [],
    },
  },
});

export default viteConfig;
