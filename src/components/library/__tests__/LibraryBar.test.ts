import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LibraryBar from "../LibraryBar.vue";
import { apolloClient } from "@/main";
import { useStateManagement } from "@/composables/useStateManagement";

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
