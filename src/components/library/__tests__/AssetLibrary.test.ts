import { shallowMount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AssetLibrary from "@/components/library/AssetLibrary.vue";

const clearBreadcrumbPathAndAddOverviewPage = vi.hoisted(() => vi.fn());
const getRouteBreadcrumbsOfEntity = vi.hoisted(() =>
  vi.fn(() => [
    { overviewPage: "MyComments", title: "navigation.my-comments" },
  ]),
);
const mockRoute = vi.hoisted(() => ({
  name: "TaggedComments",
  meta: {} as Record<string, unknown>,
}));

vi.mock("vue-router", () => ({ useRoute: () => mockRoute }));
vi.mock("@/composables/useBreadcrumbs", () => ({
  useBreadcrumbs: () => ({
    getRouteBreadcrumbsOfEntity,
    clearBreadcrumbPathAndAddOverviewPage,
  }),
}));
vi.mock("@/composables/useEntityMediafileSelector", () => ({
  useEntityMediafileSelector: () => ({
    addMediafileSelectionStateContext: vi.fn(),
  }),
}));
vi.mock("@/components/library/BaseLibrary.vue", () => ({
  default: { name: "BaseLibrary", template: "<div />" },
}));

const mountLibrary = () =>
  shallowMount(AssetLibrary, {
    global: {
      provide: { config: { features: { hasBulkOperations: true } } },
    },
  });

describe("AssetLibrary page title", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the breadcrumbs of the current route", () => {
    mockRoute.meta = {
      entityType: "comment",
      breadcrumbs: [
        { overviewPage: "TaggedComments", title: "navigation.tagged-comments" },
      ],
    };

    mountLibrary();

    expect(clearBreadcrumbPathAndAddOverviewPage).toHaveBeenCalledWith(
      "navigation.tagged-comments",
    );
  });

  it("falls back to the overview of the entity type without route breadcrumbs", () => {
    mockRoute.meta = { entityType: "comment" };

    mountLibrary();

    expect(getRouteBreadcrumbsOfEntity).toHaveBeenCalledWith("comment");
    expect(clearBreadcrumbPathAndAddOverviewPage).toHaveBeenCalledWith(
      "navigation.my-comments",
    );
  });
});
