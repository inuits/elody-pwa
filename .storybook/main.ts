import type { StorybookConfig } from "@storybook/vue3-vite";
import { fileURLToPath, URL } from "node:url";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)",
    "../stories/**/*.mdx",
  ],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/vue3-vite",
    options: {
      builder: {
        viteConfigPath: fileURLToPath(
          new URL("./vite.config.ts", import.meta.url),
        ),
      },
    },
  },
  core: { disableTelemetry: true },
  docs: { defaultName: "Docs" },
  // The map stories reference /marker.png the way the app does.
  staticDirs: ["../public"],
};

export default config;
