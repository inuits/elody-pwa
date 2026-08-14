/* eslint-disable @typescript-eslint/no-explicit-any -- test/storybook harness: jsdom polyfills and untyped third-party surfaces */
import type { Preview } from "@storybook/vue3-vite";
import { setup } from "@storybook/vue3-vite";
import { DefaultApolloClient } from "@vue/apollo-composable";
import Unicon from "vue-unicons";
import Notifications from "@kyvg/vue3-notification";
import { apolloClient, i18n, router } from "./mockMain";
import { Unicons } from "@/types";
import { useInputValidation } from "@/composables/useInputValidation";
import "@/assets/main.css";

setup((app) => {
  Unicon.add(Object.values(Unicons));
  // The app registers its vee-validate rules (no_xss, has_required_relation, …)
  // during bootstrap; register them here too so form components don't throw
  // "No such validator" when their fields resolve validation rules.
  useInputValidation().initializeInputValidation({});
  app
    .use(i18n)
    .use(Unicon as any, { fill: "currentColor" })
    .use(Notifications)
    .use(router)
    // `features` is read by config-gated composables (useBaseLibrary,
    // useFormHelper, …); keep it present-but-empty so they see "disabled"
    // instead of crashing on undefined.
    .provide("config", { customization: {}, features: {} })
    .provide(DefaultApolloClient, apolloClient);
});

/* Design-system client theming (WP1/WP2): every story must render correctly
   under all six `data-elody-client` scopes. vlacc is the :root default and
   sets no attribute — mirroring src/main.ts. */
const ELODY_CLIENTS = [
  "vlacc",
  "pza",
  "podiumnet",
  "damsv2",
  "vliz",
  "aicap",
] as const;

const preview: Preview = {
  globalTypes: {
    elodyClient: {
      description: "Client theme scope (data-elody-client)",
      toolbar: {
        title: "Tenant",
        icon: "paintbrush",
        items: ELODY_CLIENTS.map((client) => ({
          value: client,
          title: client,
        })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    elodyClient: "vlacc",
  },
  decorators: [
    (story, context) => {
      const client = context.globals.elodyClient;
      if (!client || client === "vlacc") {
        delete document.body.dataset.elodyClient;
      } else {
        document.body.dataset.elodyClient = client;
      }
      // Light "surface" wrapper matching the app background so panel/card
      // borders and washes read like they do in the real app.
      return {
        components: { story },
        template:
          '<div style="background: var(--color-surface-app); padding: 16px; min-height: 100%;"><story /></div>',
      };
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Preview-split container tiers (entity-list-element.md): stacked <500,
    // then 40/60 → 35/65 → 30/70 → 25/75 at 500/630/830/1024px.
    viewport: {
      options: {
        stacked: {
          name: "Stacked (<500px)",
          styles: { width: "420px", height: "900px" },
          type: "mobile",
        },
        tier500: {
          name: "Tier 500 (40/60)",
          styles: { width: "500px", height: "900px" },
          type: "tablet",
        },
        tier630: {
          name: "Tier 630 (35/65)",
          styles: { width: "630px", height: "900px" },
          type: "tablet",
        },
        tier830: {
          name: "Tier 830 (30/70)",
          styles: { width: "830px", height: "900px" },
          type: "desktop",
        },
        tier1024: {
          name: "Tier 1024 (25/75)",
          styles: { width: "1024px", height: "900px" },
          type: "desktop",
        },
      },
    },
    // Design-system a11y rules are contractual: components touched by the
    // migration opt into `test: "error"` in their own story files; the global
    // default stays "todo" so legacy stories report without failing builds.
    a11y: {
      test: "todo",
    },
  },
};

export default preview;