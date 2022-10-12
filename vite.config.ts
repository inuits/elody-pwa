import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueI18n from '@intlify/vite-plugin-vue-i18n'
import { resolve, dirname } from 'node:path'

const parsePort = (port: string) => {
  return parseInt(port) ? parseInt(port) : 8080;
};

const cacheDir =
  process.env.NODE_ENV === "development-docker"
    ? "/app/node_modules/.vite"
    : "node_modules/.vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueI18n({
      // if you want to use Vue I18n Legacy API, you need to set `compositionOnly: false`
      compositionOnly: true,
      include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**'),
    })
  ],
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
      clientPort: parsePort("8100"),
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
  test: {
    globals: true,
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
