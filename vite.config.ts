import { fileURLToPath, URL } from "node:url";
/// <reference types="vitest" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const parsePort = (port: string) => {
  return parseInt(port) ? parseInt(port) : 8080;
};

const cacheDir =
  process.env.NODE_ENV === "development-docker"
    ? "/app/node_modules/.vite"
    : "../node_modules/.vite";

// https://vitejs.dev/config/
export default defineConfig({
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
    rollupOptions: {
      external: ["pdfjs-dist/types/src/display/api"],
    },
  },
  // test: {
  //   globals: true,
  //   coverage: {
  //     reporter: ["text", "html"],
  //   },
  // },
  // @ts-ignore
  test: {
    setupFiles: "./vitestSetup.ts",
    environment: "jsdom", // Path to your setup file
  },
  optimizeDeps: {
    exclude: ["session-vue-3-oidc-library"],
  },
});
