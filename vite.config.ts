import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const parsePort = (port: string) => {
  return parseInt(port) ? parseInt(port) : 8080;
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
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
});
