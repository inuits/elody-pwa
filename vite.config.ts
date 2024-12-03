import { fileURLToPath, URL } from "node:url";
import { defineConfig, mergeConfig } from "vite";
import { defineConfig as defineVitestConfig } from "vitest/config";
import compress from "vite-plugin-compress";
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
  plugins: [vue()],
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
    chunkSizeWarningLimit: 1000, // You can increase the limit if necessary, but try to keep it under 500 KB for faster loading.
    minify: "terser",
    rollupOptions: {
      external: ["pdfjs-dist/types/src/display/api"],
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString(); // Split out node_modules into separate chunks
          }
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ["session-vue-3-oidc-library"],
  },
});

const vitestConfig = defineVitestConfig({
  test: {
    setupFiles: "./vitestSetup.ts",
    environment: "jsdom",
  },
});

export default mergeConfig(viteConfig, vitestConfig);
