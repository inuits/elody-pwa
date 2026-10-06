import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises, shallowMount } from "@vue/test-utils";
import MultiEntityView from "../MultiEntityView.vue";

const mocks = vi.hoisted(() => ({
  route: {
    params: { id: "M-123" } as Record<string, string>,
    meta: { queries: { getMultiEntity: "GetWemOverview" } } as any,
  },
  queryResult: { data: { WemOverview: [] as any[] } },
  loadDocument: vi.fn(),
  query: vi.fn(),
  determineBreadcrumbsFromRouteConfig: vi.fn(),
}));

vi.mock("vue-router", () => ({
  useRoute: () => mocks.route,
  useRouter: () => ({ push: vi.fn(), resolve: vi.fn() }),
}));

vi.mock("@/components/MultiEntityColumn.vue", () => ({
  default: { name: "MultiEntityColumn", template: "<div />" },
}));

vi.mock("@/components/SpinnerLoader.vue", () => ({
  default: { name: "SpinnerLoader", template: "<div />" },
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/main", () => ({
  apolloClient: { query: mocks.query },
}));

vi.mock("@/helpers", () => ({
  asString: (v: unknown) => String(v),
  getMappedSlug: (e: any) => e?.type,
  getTitleOrNameFromEntity: (e: any) => e?.id ?? "",
}));

vi.mock("@/composables/useBreadcrumbs", () => ({
  useBreadcrumbs: () => ({
    determineBreadcrumbsFromRouteConfig:
      mocks.determineBreadcrumbsFromRouteConfig,
  }),
  breadcrumbRoutes: { value: [] },
}));

vi.mock("@/composables/useImport", () => ({
  useImport: () => ({ loadDocument: mocks.loadDocument }),
}));

const getWrapper = () =>
  shallowMount(MultiEntityView, {
    global: {
      mocks: { $t: (key: string) => key },
    },
  });

describe("MultiEntityView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.route.params = { id: "M-123" };
    mocks.route.meta = { queries: { getMultiEntity: "GetWemOverview" } };
    mocks.loadDocument.mockResolvedValue({ kind: "Document" });
    mocks.query.mockResolvedValue(mocks.queryResult);
  });

  it("resolves the query name from route meta and runs it with the route id", async () => {
    mocks.queryResult.data.WemOverview = [{ id: "W-1", type: "work_word" }];
    const wrapper = getWrapper();
    await flushPromises();

    expect(mocks.loadDocument).toHaveBeenCalledWith("GetWemOverview");
    expect(mocks.query).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { id: "M-123" } }),
    );
    wrapper.unmount();
  });

  it("renders one column per returned entity", async () => {
    mocks.queryResult.data.WemOverview = [
      { id: "W-1", type: "work_word" },
      { id: "E-1", type: "reading" },
      { id: "M-1", type: "manifestation_word" },
    ];
    const wrapper = getWrapper();
    await flushPromises();

    const columns = wrapper.findAllComponents({ name: "MultiEntityColumn" });
    expect(columns).toHaveLength(3);
    wrapper.unmount();
  });

  it("shows the empty state when the query returns no entities", async () => {
    mocks.queryResult.data.WemOverview = [];
    const wrapper = getWrapper();
    await flushPromises();

    expect(
      wrapper.findAllComponents({ name: "MultiEntityColumn" }),
    ).toHaveLength(0);
    expect(wrapper.text()).toContain("multi-entity.no-results");
    wrapper.unmount();
  });

  it("builds the breadcrumbs from the route's configuration, for the requested entity among all loaded ones", async () => {
    const breadcrumbs = [
      {
        current: true,
        pillLabel: "navigation.wem",
        title: { type: "manifestation", key: "title" },
      },
      { overviewPage: "HomePage", title: "navigation.home" },
    ];
    mocks.route.meta = {
      queries: { getMultiEntity: "GetWemOverview" },
      breadcrumbs,
    };
    const loaded = [
      { id: "W-1", type: "work_word", intialValues: { title: "Work title" } },
      {
        id: "M-123",
        type: "manifestation_word",
        intialValues: { title: "Manifestation title" },
      },
    ];
    mocks.queryResult.data.WemOverview = loaded;
    const wrapper = getWrapper();
    await flushPromises();

    expect(mocks.determineBreadcrumbsFromRouteConfig).toHaveBeenCalledWith(
      breadcrumbs,
      loaded[1],
      loaded,
    );
    wrapper.unmount();
  });

  it("remounts only the edited column after a save so the refreshed entity is shown", async () => {
    mocks.queryResult.data.WemOverview = [
      { id: "W-1", type: "work_word" },
      { id: "E-1", type: "reading" },
    ];
    const wrapper = getWrapper();
    await flushPromises();

    const editedColumnBefore = wrapper.findAllComponents({
      name: "MultiEntityColumn",
    })[0];
    const otherColumnBefore = wrapper.findAllComponents({
      name: "MultiEntityColumn",
    })[1];
    const editedKeyBefore = editedColumnBefore.vm.$.vnode.key;
    const otherKeyBefore = otherColumnBefore.vm.$.vnode.key;

    // The refetch triggered by the save returns updated data for W-1.
    mocks.query.mockClear();
    mocks.queryResult.data.WemOverview = [
      { id: "W-1", type: "work_word", intialValues: { title: "updated" } },
      { id: "E-1", type: "reading" },
    ];

    editedColumnBefore.vm.$emit("mutatedEntityUpdated", { id: "W-1" });
    await flushPromises();

    // The view refetched the WEM overview.
    expect(mocks.query).toHaveBeenCalledTimes(1);

    const editedKeyAfter = wrapper.findAllComponents({
      name: "MultiEntityColumn",
    })[0].vm.$.vnode.key;
    const otherKeyAfter = wrapper.findAllComponents({
      name: "MultiEntityColumn",
    })[1].vm.$.vnode.key;

    // Only the edited column remounts; the untouched column keeps its key.
    expect(editedKeyAfter).not.toBe(editedKeyBefore);
    expect(otherKeyAfter).toBe(otherKeyBefore);
    wrapper.unmount();
  });

  it("renders nothing and does not query when no query name is configured", async () => {
    mocks.route.meta = { queries: {} };
    const wrapper = getWrapper();
    await flushPromises();

    expect(mocks.query).not.toHaveBeenCalled();
    expect(
      wrapper.findAllComponents({ name: "MultiEntityColumn" }),
    ).toHaveLength(0);
    wrapper.unmount();
  });
});
