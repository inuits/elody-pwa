/* eslint-disable @typescript-eslint/no-explicit-any -- test/storybook harness: jsdom polyfills and untyped third-party surfaces */
import { fileURLToPath, URL } from "node:url";
import type { StorybookConfig } from "@storybook/vue3-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|mdx)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/vue3-vite",
    options: {},
  },
  viteFinal: async (viteConfig) => {
    // The app's vite.config.mjs is merged in automatically; strip the parts
    // that only make sense for the Traefik/docker dev setup of the PWA itself.
    viteConfig.plugins = (viteConfig.plugins ?? [])
      .flat(Infinity)
      .filter(
        (plugin: any) =>
          !plugin?.name ||
          !/compression|devtools|inspect/.test(plugin.name),
      );

    // src/main.ts bootstraps the whole app at import time and is imported
    // (for its singletons) by helpers.ts and many composables — alias it to
    // an inert stand-in so stories never trigger the real bootstrap.
    const alias = viteConfig.resolve?.alias ?? {};
    const aliasList = Array.isArray(alias)
      ? [...alias]
      : Object.entries(alias).map(([find, replacement]) => ({
          find,
          replacement,
        }));
    // Note: helpers.ts imports "@/main.ts" (with extension), so match both.
    aliasList.unshift({
      find: /^@\/main(\.ts)?$/,
      replacement: fileURLToPath(new URL("./mockMain.ts", import.meta.url)),
    });
    viteConfig.resolve = { ...viteConfig.resolve, alias: aliasList };

    // The PWA pins HMR to the Traefik port (8000); Storybook serves on its
    // own port, so let vite default to same-origin HMR.
    viteConfig.server = {
      ...viteConfig.server,
      host: "localhost",
      port: undefined,
      hmr: undefined,
      warmup: undefined,
    };

    return viteConfig;
  },
};

export default config;