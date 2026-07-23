import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LibraryBar from "../LibraryBar.vue";
import { apolloClient } from "@/main";
import { useStateManagement } from "@/composables/useStateManagement";
import { useRoute } from "vue-router";

vi.mock("@/main", () => ({
  apolloClient: {
    query: vi.fn(),
  },
}));

vi.mock("vue-router", () => ({
  useRoute: vi.fn(() => ({
    name: "TestRoute",
    fullPath: "/test/path",
    meta: { queries: { getSortOptions: "MockQuery" } },
  })),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/composables/useStateManagement", () => ({
  useStateManagement: vi.fn(),
}));

vi.mock("@/composables/useImport", () => ({
  useImport: () => ({ loadDocument: vi.fn((q) => q) }),
}));

vi.mock("lodash.debounce", () => ({
  default: (fn: any) => fn,
}));

describe("LibraryBar.vue Sort Logic", () => {
  let wrapper: any;
  const setSortOrderMock = vi.fn();
  const setSortKeyMock = vi.fn();
  const setLimitMock = vi.fn();

  const getStateForRouteMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useStateManagement as any).mockReturnValue({
      getStateForRoute: getStateForRouteMock,
    });
  });

  const createWrapper = () => {
    return mount(LibraryBar, {
      props: {
        setSortOrder: setSortOrderMock,
        setSortKey: setSortKeyMock,
        setLimit: setLimitMock,
        selectedPaginationLimitOption: 20,
      },
      global: {
        stubs: {
          AdvancedDropdown: true,
        },
      },
    });
  };

  it("applies isAsc from API response as 'asc' if not in state and calls setSortOrder(val, false)", async () => {
    wrapper = createWrapper();

    (apolloClient.query as any).mockResolvedValue({
      data: {
        EntityTypeSortOptions: {
          sortOptions: {
            isAsc: "asc",
            options: [{ value: "name", label: "Name" }],
          },
        },
      },
    });

    getStateForRouteMock.mockReturnValue({
      queryVariables: {
        searchValue: {
          order_by: "name",
        },
      },
    });

    const emitted = wrapper.emitted("sortOptionsPromise");
    expect(emitted).toBeTruthy();
    const sortPromiseFunc = emitted[0][0];

    await sortPromiseFunc("some_entity_type");
    expect(setSortOrderMock).toHaveBeenCalledWith(true, false);
  });

  it("applies isAsc from API response as 'desc' if not in state and calls setSortOrder(val, false)", async () => {
    wrapper = createWrapper();

    (apolloClient.query as any).mockResolvedValue({
      data: {
        EntityTypeSortOptions: {
          sortOptions: {
            isAsc: "desc",
            options: [{ value: "name", label: "Name" }],
          },
        },
      },
    });

    getStateForRouteMock.mockReturnValue({
      queryVariables: {
        searchValue: {
          order_by: "name",
        },
      },
    });

    const emitted = wrapper.emitted("sortOptionsPromise");
    expect(emitted).toBeTruthy();
    const sortPromiseFunc = emitted[0][0];

    await sortPromiseFunc("some_entity_type");
    expect(setSortOrderMock).toHaveBeenCalledWith(false, false);
  });

  it("applies isAsc as true from state and calls setSortOrder(val, false)", async () => {
    wrapper = createWrapper();

    (apolloClient.query as any).mockResolvedValue({
      data: {
        EntityTypeSortOptions: {
          sortOptions: {
            isAsc: "desc",
            options: [{ value: "name", label: "Name" }],
          },
        },
      },
    });

    getStateForRouteMock.mockReturnValue({
      queryVariables: {
        searchValue: {
          isAsc: true,
          order_by: "name",
        },
      },
    });

    const emitted = wrapper.emitted("sortOptionsPromise");
    expect(emitted).toBeTruthy();
    const sortPromiseFunc = emitted[0][0];

    await sortPromiseFunc("some_entity_type");
    expect(setSortOrderMock).toHaveBeenCalledWith(true, false);
  });

  it("applies isAsc as false from state and calls setSortOrder(val, false)", async () => {
    wrapper = createWrapper();

    (apolloClient.query as any).mockResolvedValue({
      data: {
        EntityTypeSortOptions: {
          sortOptions: {
            isAsc: "asc",
            options: [{ value: "name", label: "Name" }],
          },
        },
      },
    });

    getStateForRouteMock.mockReturnValue({
      queryVariables: {
        searchValue: {
          isAsc: false,
          order_by: "name",
        },
      },
    });

    const emitted = wrapper.emitted("sortOptionsPromise");
    expect(emitted).toBeTruthy();
    const sortPromiseFunc = emitted[0][0];

    await sortPromiseFunc("some_entity_type");
    expect(setSortOrderMock).toHaveBeenCalledWith(false, false);
  });

  it("triggers watcher and calls setSortOrder(val, true) when sort direction changes", async () => {
    wrapper = createWrapper();

    (apolloClient.query as any).mockResolvedValue({
      data: {
        EntityTypeSortOptions: { sortOptions: { isAsc: "desc", options: [] } },
      },
    });
    getStateForRouteMock.mockReturnValue({});

    const emitted = wrapper.emitted("sortOptionsPromise");
    const sortPromiseFunc = emitted[0][0];
    await sortPromiseFunc("entity");

    setSortOrderMock.mockClear();

    wrapper.vm.selectedSortDirection = "asc";
    await wrapper.vm.$nextTick();
    expect(setSortOrderMock).toHaveBeenCalledWith(true, true);

    wrapper.vm.selectedSortDirection = "desc";
    await wrapper.vm.$nextTick();
    expect(setSortOrderMock).toHaveBeenCalledWith(false, true);
  });
});

describe("LibraryBar.vue Simple Search", () => {
  const setSortOrderMock = vi.fn();
  const setSortKeyMock = vi.fn();
  const setLimitMock = vi.fn();
  const setSimpleSearchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useStateManagement as any).mockReturnValue({
      getStateForRoute: vi.fn(),
    });
    (apolloClient.query as any).mockResolvedValue({
      data: {
        PaginationLimitOptions: { options: [{ label: "20", value: 20 }] },
        EntityTypeSortOptions: { sortOptions: { isAsc: "asc", options: [] } },
      },
    });
  });

  const mountWithRouteMeta = async (
    meta: Record<string, any>,
    extraProps = {},
  ) => {
    (useRoute as any).mockReturnValueOnce({
      name: "TestRoute",
      fullPath: "/test/path",
      meta,
    });
    const wrapper = mount(LibraryBar, {
      props: {
        setSortOrder: setSortOrderMock,
        setSortKey: setSortKeyMock,
        setLimit: setLimitMock,
        selectedPaginationLimitOption: 20,
        simpleSearchValue: "",
        setSimpleSearch: setSimpleSearchMock,
        ...extraProps,
      },
      global: {
        stubs: {
          AdvancedDropdown: true,
        },
      },
    });

    // the whole template is gated behind both promises resolving, same as
    // the "Sort Logic" tests above
    await wrapper.emitted("paginationLimitOptionsPromise")[0][0]("entity");
    await wrapper.emitted("sortOptionsPromise")[0][0]("entity");
    await wrapper.vm.$nextTick();

    return wrapper;
  };

  it("does not render the search box when the route has no simpleSearch keys configured", async () => {
    const wrapper = await mountWithRouteMeta({
      queries: { getSortOptions: "MockQuery" },
    });

    expect(wrapper.find('[data-cy="simple-search"]').exists()).toBe(false);
  });

  it("renders the search box with a placeholder derived from the route's breadcrumb title when simpleSearch keys are configured", async () => {
    const wrapper = await mountWithRouteMeta({
      simpleSearch: { keys: ["podiumnet:1|properties.title.value"] },
      breadcrumbs: [{ title: "navigation.productions" }],
    });

    const input = wrapper.find('[data-cy="simple-search"] input');
    expect(input.exists()).toBe(true);
    expect(input.attributes("placeholder")).toBe(
      "library.simple-search-placeholder",
    );
  });

  it("calls setSimpleSearch with the typed value", async () => {
    const wrapper = await mountWithRouteMeta({
      simpleSearch: { keys: ["podiumnet:1|properties.title.value"] },
    });

    const input = wrapper.find('[data-cy="simple-search"] input');
    await input.setValue("production A");

    expect(setSimpleSearchMock).toHaveBeenCalledWith("production A");
  });

  it("syncs the input from simpleSearchValue when the parent clears it externally", async () => {
    const wrapper = await mountWithRouteMeta(
      { simpleSearch: { keys: ["podiumnet:1|properties.title.value"] } },
      { simpleSearchValue: "production A" },
    );

    const input = wrapper.find('[data-cy="simple-search"] input');
    expect((input.element as HTMLInputElement).value).toBe("production A");

    setSimpleSearchMock.mockClear();
    await wrapper.setProps({ simpleSearchValue: "" });

    expect((input.element as HTMLInputElement).value).toBe("");
    expect(setSimpleSearchMock).not.toHaveBeenCalled();
  });
});
