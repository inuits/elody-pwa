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

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;