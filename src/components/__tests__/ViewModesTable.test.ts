import ViewModesTable from "../library/view-modes/ViewModesTable.vue";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { shallowMount, flushPromises } from "@vue/test-utils";

vi.mock("@/helpers", async () => {
  const actualModule = await vi.importActual("@/helpers");
  return {
    ...actualModule,
    setCssVariable: () => {},
    getEntityPageRoute: () => {},
    getMappedSlug: () => {},
    formatTeaserMetadata: () => {},
    updateEntityMediafileOnlyForMediafiles: () => {},
  };
});

const mockEntityPageConfig = vi.hoisted(() => ({
  actions: [],
  hasEditMetadataButton: undefined,
  deleteButton: undefined,
  trackSeen: { value: false },
}));

vi.mock("@/composables/useEntityPageConfig", () => ({
  useEntityPageConfig: () => mockEntityPageConfig,
}));

const mockSeenItems = vi.hoisted(() => ({
  isItemSeen: vi.fn(() => false),
  markAsSeen: vi.fn(),
  markManyAsSeen: vi.fn(),
  unmarkManyAsSeen: vi.fn(),
}));

vi.mock("@/composables/useSeenItems", () => ({
  useSeenItems: () => mockSeenItems,
}));

vi.mock("@/main", () => ({
  apolloClient: {
    query: vi.fn().mockResolvedValue({
      data: {},
    }),
  },
}));

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

  describe("seen items", () => {
    beforeEach(() => {
      mockEntityPageConfig.trackSeen.value = true;
      mockSeenItems.isItemSeen.mockImplementation(
        (id: string) => id === "entity1",
      );
    });

    const mountWithEntities = async () => {
      const wrapper = shallowMount(ViewModesTable, {
        props: {
          entities: [{ id: "entity1" }, { id: "entity2" }],
          idsOfNonSelectableEntities: ["entity2"],
        },
      });
      await flushPromises();
      return wrapper;
    };

    it("does not disable a seen entity, so it stays selectable", async () => {
      const wrapper = await mountWithEntities();

      const seenEntity = wrapper.vm.processedEntities[0];
      expect(seenEntity.id).toBe("entity1");
      expect(seenEntity.isDisabled).toBe(false);
    });

    it("keeps disabling entities that are not selectable", async () => {
      const wrapper = await mountWithEntities();

      const nonSelectableEntity = wrapper.vm.processedEntities[1];
      expect(nonSelectableEntity.id).toBe("entity2");
      expect(nonSelectableEntity.isDisabled).toBe(true);
    });

    it("includes the seen state in the memo key so the item re-renders when it changes", async () => {
      const wrapper = await mountWithEntities();

      expect(wrapper.vm.processedEntities[0].memoKey).toContain(true);
      expect(wrapper.vm.processedEntities[1].memoKey).toContain(false);
    });
  });
});
