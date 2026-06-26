import ViewModesTable from "../library/view-modes/ViewModesTable.vue";
import { describe, it, expect, vi, afterEach } from "vitest";
import { shallowMount, flushPromises } from "@vue/test-utils";

vi.mock("@/helpers", () => {
  const actualModule = vi.importActual("@/helpers");
  return {
    ...actualModule,
    setCssVariable: () => {},
    getEntityPageRoute: () => {},
    getMappedSlug: () => {},
    formatTeaserMetadata: () => {},
    updateEntityMediafileOnlyForMediafiles: () => {},
  };
});

vi.mock("@/composables/useEntityPageConfig", () => ({
  useEntityPageConfig: () => ({
    actions: [],
    hasEditMetadataButton: undefined,
    deleteButton: undefined,
    trackSeen: false,
  }),
}));

vi.mock("@/main", () => {
  const actualModule = vi.importActual("@/main");

  return {
    ...actualModule,
    apolloClient: {
      ...actualModule.apolloClient,
      query: vi.fn().mockResolvedValue({
        data: {},
      }),
    },
  };
});

const tableContainer = (wrapper: ReturnType<typeof shallowMount>) =>
  wrapper.find('[data-cy="view-modes-table"]');

describe("ViewModesTable", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe("refetch loading state", () => {
    it("shows the loading indicator while refetching with existing entities", async () => {
      const wrapper = shallowMount(ViewModesTable, {
        props: {
          entities: [{ id: "entity1" }, { id: "entity2" }],
          entitiesLoading: true,
        } as any,
      });
      await flushPromises();

      expect(tableContainer(wrapper).classes()).toContain("animate-pulse");
    });

    it("does not show the loading indicator when not loading", async () => {
      const wrapper = shallowMount(ViewModesTable, {
        props: {
          entities: [{ id: "entity1" }, { id: "entity2" }],
          entitiesLoading: false,
        } as any,
      });
      await flushPromises();

      expect(tableContainer(wrapper).classes()).not.toContain("animate-pulse");
    });

    it("does not show the loading indicator on initial load with no entities", async () => {
      const wrapper = shallowMount(ViewModesTable, {
        props: {
          entities: [],
          entitiesLoading: true,
        } as any,
      });
      await flushPromises();

      expect(tableContainer(wrapper).classes()).not.toContain("animate-pulse");
    });
  });
});
