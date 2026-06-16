import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { ref, computed } from "vue";
import TheHeader from "@/components/TheHeader.vue";

const mockRoute = ref({
  name: "SingleEntity",
  params: { type: "assets", id: "entity-1" } as Record<string, unknown>,
});

const mockEntityPageConfig = {
  actions: ref<unknown[]>([]),
  hasEditMetadataButton: ref<boolean | undefined>(undefined),
  deleteButton: ref<unknown>(undefined),
};

const mockIsAuthenticated = ref(true);

vi.mock("vue-router", () => ({
  useRoute: () => mockRoute.value,
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

vi.mock("@/main", () => ({
  auth: { isAuthenticated: computed(() => mockIsAuthenticated.value) },
}));

vi.mock("@/composables/useEntityPageConfig", () => ({
  useEntityPageConfig: () => ({
    actions: mockEntityPageConfig.actions,
    hasEditMetadataButton: mockEntityPageConfig.hasEditMetadataButton,
    deleteButton: mockEntityPageConfig.deleteButton,
  }),
}));

vi.mock("@/composables/usePageStatus", () => ({
  usePageStatus: () => ({ pageStatus: ref(undefined) }),
}));

vi.mock("@/helpers", () => ({
  mapUrlToEntityType: (slug: string) => (slug === "assets" ? "Asset" : slug),
  getRouteMetadataInfoFromEntity: () => undefined,
}));

const refreshAction = {
  type: "elody",
  action: "RefreshMetadata",
  label: "header.refresh",
  icon: "Refresh",
};

const mountHeader = () =>
  shallowMount(TheHeader, {
    global: {
      provide: {
        config: { features: { simpleSearch: false, hasTenantSelect: false } },
      },
    },
  });

describe("TheHeader context menu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.value = {
      name: "SingleEntity",
      params: { type: "assets", id: "entity-1" },
    };
    mockEntityPageConfig.actions.value = [];
    mockEntityPageConfig.hasEditMetadataButton.value = undefined;
    mockEntityPageConfig.deleteButton.value = undefined;
    mockIsAuthenticated.value = true;
  });

  it("renders HeaderContextMenuActions when on a single-entity page with configured actions", () => {
    mockEntityPageConfig.actions.value = [refreshAction];

    const wrapper = mountHeader();
    const menu = wrapper.findComponent({ name: "HeaderContextMenuActions" });

    expect(menu.exists()).toBe(true);
    expect(menu.props("actions")).toEqual([refreshAction]);
    expect(menu.props("entityId")).toBe("entity-1");
    expect(menu.props("entityType")).toBe("Asset");
  });

  it("does not render HeaderContextMenuActions when actions list is empty", () => {
    mockEntityPageConfig.actions.value = [];

    const wrapper = mountHeader();

    expect(
      wrapper.findComponent({ name: "HeaderContextMenuActions" }).exists(),
    ).toBe(false);
  });

  it("does not render HeaderContextMenuActions on non-single-entity routes", () => {
    mockRoute.value = {
      name: "EntityList",
      params: { type: "assets" },
    };
    mockEntityPageConfig.actions.value = [refreshAction];

    const wrapper = mountHeader();

    expect(
      wrapper.findComponent({ name: "HeaderContextMenuActions" }).exists(),
    ).toBe(false);
  });

  it("also renders HeaderContextMenuActions on SingleMediafile routes", () => {
    mockRoute.value = {
      name: "SingleMediafile",
      params: { type: "mediafiles", id: "media-1" },
    };
    mockEntityPageConfig.actions.value = [refreshAction];

    const wrapper = mountHeader();

    expect(
      wrapper.findComponent({ name: "HeaderContextMenuActions" }).exists(),
    ).toBe(true);
  });
});
