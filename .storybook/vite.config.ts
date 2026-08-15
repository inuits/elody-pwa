import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import tailwindSvgPlugin from "../plugin/vite-plugin-tailwind-svg.js";

// Storybook runs on its own Vite config rather than the app's: the app config
// carries devtools, compression and the generated-types sourcemap strip, none
// of which apply to the workshop.
export default defineConfig({
  plugins: [vue(), tailwindSvgPlugin(), tailwindcss()],
  define: {
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false,
    "globalThis.__DEV__": JSON.stringify(true),
  },
  resolve: {
    alias: [
      // Stories and decorators are written as string templates, so the
      // workshop needs the build of Vue that ships the compiler.
      { find: /^vue$/, replacement: "vue/dist/vue.esm-bundler.js" },
      // Must precede the "@" alias so it wins for this one specifier.
      {
        find: /^@\/main$/,
        replacement: fileURLToPath(new URL("./mockMain.ts", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("../src", import.meta.url)),
      },
      {
        find: "openseadragon-select-plugin",
        replacement: "openseadragon-select-plugin/dist/index.umd.js",
      },
    ],
    dedupe: ["vue"],
  },
});
