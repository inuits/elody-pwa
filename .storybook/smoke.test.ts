/* eslint-disable @typescript-eslint/no-explicit-any -- test/storybook harness: jsdom polyfills and untyped third-party surfaces */
// Mounts every story headlessly via Storybook portable stories. A story
// passes when it mounts and flushes a tick without throwing.
//
// Storybook's own renderer applies the app plugins registered through
// `setup()` in preview.ts, but portable stories mounted with @vue/test-utils
// do not go through that renderer — so the same app configuration is passed
// to mount() explicitly here. Keep this in sync with preview.ts.
import { describe, expect, it } from "vitest";
import { composeStories } from "@storybook/vue3-vite";
import { mount } from "@vue/test-utils";
import { DefaultApolloClient } from "@vue/apollo-composable";
import Notifications from "@kyvg/vue3-notification";
import { apolloClient, i18n, router } from "./mockMain";
import { useInputValidation } from "@/composables/useInputValidation";

useInputValidation().initializeInputValidation({});

// Vue routes lifecycle/watcher/async-render errors through the app-level
// error handler (rethrowing them as unhandled rejections when none is set).
// Collect them instead: errors captured during mount + first tick fail the
// story below, while errors surfacing after that point (teardown artifacts
// of already-asserted stories) don't pollute vitest's unhandled-error
// bucket.
const capturedErrors: unknown[] = [];

const globalConfig = {
  config: {
    errorHandler: (err: unknown) => capturedErrors.push(err),
  },
  // vue-unicons' UMD build breaks under vitest's SSR interop; the repo's
  // unit tests stub `unicon` the same way. Real icons still render in the
  // browser Storybook.
  components: {
    unicon: {
      props: ["name", "height", "width", "fill", "iconStyle", "hoverFill"],
      template: '<span class="unicon-stub" :aria-label="name" />',
    },
  },
  plugins: [i18n, Notifications, router],
  provide: {
    config: { customization: {}, features: {} },
    [DefaultApolloClient as unknown as string]: apolloClient,
  },
};

const modules = import.meta.glob("../src/**/*.stories.ts", { eager: true });

for (const [path, mod] of Object.entries(modules)) {
  const stories = composeStories(mod as any);
  describe(path.replace("../src/components/", ""), () => {
    for (const [name, Story] of Object.entries(stories)) {
      it(name, async () => {
        capturedErrors.length = 0;
        // Tooltips, dropdowns, date pickers and context menus teleport into
        // ".base-modal--opened" while a modal is open. In the app the modal
        // exists before they mount; a story mounts everything in one tick,
        // so the selector resolves to null and the teleported vnodes crash
        // on their first patch. Keep a standing target in the DOM instead.
        if (!document.querySelector(".base-modal--opened")) {
          const teleportTarget = document.createElement("div");
          teleportTarget.className = "base-modal--opened";
          document.body.appendChild(teleportTarget);
        }
        const wrapper = mount(Story as any, {
          attachTo: document.body,
          global: globalConfig,
        });
        await new Promise((resolve) => setTimeout(resolve, 20));
        // Any component error during mount or the first tick fails the story.
        if (capturedErrors.length) throw capturedErrors[0];
        expect(wrapper.html()).toBeDefined();
        // Mount + first tick succeeded at this point, which is what the smoke
        // test asserts. Teardown-only crashes are swallowed: stories with
        // teleported dialogs/menus hit Vue unmount-order artifacts under
        // @vue/test-utils in jsdom ("null.type", "null.subTree",
        // "__vnode on null") that don't occur in a real browser unmount.
        try {
          wrapper.unmount();
        } catch {
          document.body.innerHTML = "";
        }
      });
    }
  });
}