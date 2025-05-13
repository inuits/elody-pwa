import { fileURLToPath, URL } from "node:url";
import { defineConfig, splitVendorChunkPlugin } from "vite";

import viteCompression from "vite-plugin-compression";
import vue from "@vitejs/plugin-vue";

const parsePort = (port) => {
  return parseInt(port) ? parseInt(port) : 8080;
};

const cacheDir =
  process.env.NODE_ENV === "development-docker"
    ? "/app/node_modules/.vite"
    : "../node_modules/.vite";

// https://vitejs.dev/config/
const viteConfig = defineConfig({
  plugins: [vue(), viteCompression(), splitVendorChunkPlugin()],
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
    },
  },
  optimizeDeps: {
    exclude: ["session-vue-3-oidc-library", "date-fns"],
  },
});

export default viteConfig;
