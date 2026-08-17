import type { Preview } from "@storybook/vue3-vite";
import { setup } from "@storybook/vue3-vite";
import type { Plugin } from "vue";
import Notifications from "@kyvg/vue3-notification";
import Unicon from "vue-unicons";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { Unicons } from "../src/types";
import { apolloClient, i18n, router } from "./mockMain";
import { useInputValidation } from "../src/composables/useInputValidation";
import "../src/assets/main.css";

// Field rows validate through vee-validate; without the rules registered, any
// story containing one throws "No such validator '…' exists".
useInputValidation().initializeInputValidation({});

Unicon.add(Object.values(Unicons));

setup((app) => {
  app
    .use(i18n)
    .use(Unicon as unknown as Plugin, { fill: "currentColor" })
    .use(Notifications)
    .use(router)
    .provide(DefaultApolloClient, apolloClient)
    .provide("config", {});
});

/** The container-query tiers the list/preview split switches on. */
const previewSplitViewports = {
  tierStacked: {
    name: "Split tier — stacked (<500px)",
    styles: { width: "480px", height: "800px" },
    type: "mobile" as const,
  },
  tier40_60: {
    name: "Split tier — 40/60 (500px)",
    styles: { width: "500px", height: "800px" },
    type: "tablet" as const,
  },
  tier35_65: {
    name: "Split tier — 35/65 (630px)",
    styles: { width: "630px", height: "800px" },
    type: "tablet" as const,
  },
  tier30_70: {
    name: "Split tier — 30/70 (830px)",
    styles: { width: "830px", height: "900px" },
    type: "tablet" as const,
  },
  tier25_75: {
    name: "Split tier — 25/75 (1024px)",
    styles: { width: "1024px", height: "900px" },
    type: "desktop" as const,
  },
};

const preview: Preview = {
  globalTypes: {
    elodyClient: {
      description: "Client theme scope applied to <body>",
      toolbar: {
        title: "Tenant",
        icon: "paintbrush",
        dynamicTitle: true,
        items: [
          { value: "", title: "vlacc (reference)" },
          { value: "pza", title: "pza" },
          { value: "podiumnet", title: "podiumnet" },
          { value: "damsv2", title: "damsv2" },
          { value: "vliz", title: "vliz" },
          { value: "aicap", title: "aicap" },
        ],
      },
    },
    surface: {
      description: "Background the story sits on",
      toolbar: {
        title: "Surface",
        icon: "photo",
        dynamicTitle: true,
        items: [
          { value: "app", title: "App background" },
          { value: "surface", title: "Panel surface" },
        ],
      },
    },
  },
  initialGlobals: { elodyClient: "", surface: "app" },
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    viewport: { options: previewSplitViewports },
    a11y: { test: "error" },
    options: {
      storySort: {
        order: [
          "Design system",
          "Foundations",
          "Base",
          "Components",
          "Metadata",
          "EntityElements",
          "Library",
          "Filters",
          "ContextMenuActions",
          "BulkOperations",
          "RepetitiveForm",
          "Modals",
        ],
      },
    },
  },
  decorators: [
    (story, context) => {
      const client = context.globals.elodyClient ?? "";
      if (client) document.body.dataset.elodyClient = client;
      else delete document.body.dataset.elodyClient;

      const background =
        context.globals.surface === "surface"
          ? "var(--color-surface)"
          : "var(--color-surface-app)";

      return {
        components: { story },
        setup: () => ({ background }),
        template: `<div :style="{
            background,
            color: 'var(--color-text-body)',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-body)',
            padding: '16px',
          }"><story /></div>`,
      };
    },
  ],
};

export default preview;
