import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import {
  createMemoryHistory,
  createRouter,
  onBeforeRouteUpdate,
  RouterView,
} from "vue-router";

const mocks = vi.hoisted(() => ({
  variables: undefined as any,
  loaded: undefined as any,
  allowLeave: true,
  determineBreadcrumbsForEntity: vi.fn(),
}));

vi.mock("@vue/apollo-composable", async () => {
  const { computed, ref } = await import("vue");
  mocks.loaded = ref(false);
  return {
    useQuery: (_doc: unknown, variables: any) => {
      mocks.variables = variables;
      return {
        result: computed(() => mocks.loaded.value && ({
          Entity: {
            id: variables.id,
            type: "work",
            intialValues: { canUpdate: true },
            entityView: {},
          },
        })),
        refetch: vi.fn(),
      };
    },
  };
});
vi.mock("@/main", async () => {
  const { ref } = await import("vue");
  return {
    auth: { isAuthenticated: ref(true) },
    typeUrlMapping: { mapping: {}, reverseMapping: {} },
  };
});
vi.mock("vue-i18n", async () => {
  const { ref } = await import("vue");
  return { useI18n: () => ({ t: (key: string) => key, locale: ref("en") }) };
});
vi.mock("@/composables/useBreadcrumbs", () => ({
  useBreadcrumbs: () => ({
    determineBreadcrumbsForEntity: mocks.determineBreadcrumbsForEntity,
  }),
}));
vi.mock("@/composables/useEntityMediafileSelector", () => ({
  useEntityMediafileSelector: () => ({
    mediafileSelectionState: ref({}),
    addMediafileSelectionStateContext: vi.fn(),
    setEntityMediafiles: vi.fn(),
  }),
}));
vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({ getEditableMetadataKeys: vi.fn() }),
}));
vi.mock("@/composables/useEntityPageConfig", () => ({
  useEntityPageConfig: () => ({
    trackSeen: ref(false),
    jobStatusPolling: ref(false),
    showNavigationArrows: ref(false),
  }),
}));
vi.mock("@/composables/useJobStatusPolling", () => ({
  useJobStatusPolling: vi.fn(),
}));
vi.mock("@/composables/useSeenItems", () => ({
  useSeenItems: () => ({ markAsSeen: vi.fn() }),
}));
vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({
    getModalInfo: () => ({ open: false }),
    changeCloseConfirmation: vi.fn(),
  }),
}));

import EntitySingle from "@/views/EntitySingle.vue";

// Stands in for the entity form, whose update guard asks about unsaved
// changes and can cancel the navigation.
const FormWithLeavePrompt = defineComponent({
  name: "EntityColumn",
  setup() {
    onBeforeRouteUpdate(() => mocks.allowLeave);
    return () => h("div");
  },
});

const mountPage = async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/:type/:id", name: "SingleEntity", component: EntitySingle },
    ],
  });
  router.push("/works/W-1");
  await router.isReady();
  mount(defineComponent({ render: () => h(RouterView) }), {
    global: {
      plugins: [router],
      provide: { config: { features: {} } },
      stubs: {
        EntityColumn: FormWithLeavePrompt,
        SpinnerLoader: true,
        EditModal: true,
        DeleteModal: true,
      },
    },
  });
  mocks.loaded.value = true;
  await flushPromises();
  return router;
};

describe("EntitySingle — moving to another record", () => {
  beforeEach(() => {
    mocks.allowLeave = true;
    mocks.loaded.value = false;
    mocks.determineBreadcrumbsForEntity.mockClear();
  });

  // The page loads the other record only once the navigation is confirmed:
  // cancelling the leave prompt keeps this record and its breadcrumbs.
  it("keeps the record when the leave prompt cancels the navigation", async () => {
    const router = await mountPage();
    mocks.determineBreadcrumbsForEntity.mockClear();
    mocks.allowLeave = false;
    await router.push("/works/W-2");
    await flushPromises();
    expect(router.currentRoute.value.params.id).toBe("W-1");
    expect(mocks.variables.id).toBe("W-1");
    expect(mocks.determineBreadcrumbsForEntity).not.toHaveBeenCalled();
  });

  it("loads the other record once the navigation goes through", async () => {
    const router = await mountPage();
    await router.push("/works/W-2");
    await flushPromises();
    expect(mocks.variables.id).toBe("W-2");
  });
});
