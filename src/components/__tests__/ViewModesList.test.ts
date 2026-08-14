import ViewModesList from "../library/view-modes/ViewModesList.vue";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { shallowMount, flushPromises } from "@vue/test-utils";
import {
  ListItemCoverageTypes,
  type PreviewComponent,
  PreviewTypes,
} from "@/generated-types/queries";

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

describe("ViewModesList", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe("PreviewComponent", () => {
    const previewComponentMediaViewer = {
      type: PreviewTypes.MediaViewer,
      title: "panel-labels.preview-mediafiles",
      listItemsCoverage: ListItemCoverageTypes.OneListItem,
    } as PreviewComponent;

    const previewComponentMap = {
      type: PreviewTypes.Map,
      title: "panel-labels.preview-map",
      listItemsCoverage: ListItemCoverageTypes.AllListItems,
    } as PreviewComponent;

    it("enables previewcomponent (media type) with preview enabled for only 1 list items with the given id", async () => {
      const wrapper = shallowMount(ViewModesList, {
        props: {
          entities: [{ id: "entity1" }, { id: "entity2" }],
        },
      });
      await flushPromises();

      wrapper.vm.previewComponent = previewComponentMediaViewer;
      expect(wrapper.vm.previewComponent).toStrictEqual(
        previewComponentMediaViewer,
      );

      wrapper.vm.togglePreviewComponent("entity1");
      expect(wrapper.vm.previewComponentEnabled).toBe(true);
      expect(wrapper.vm.isPreviewComponentEnabledForListItem("entity1")).toBe(
        true,
      );
      expect(wrapper.vm.isPreviewComponentEnabledForListItem("entity2")).toBe(
        false,
      );
    });

    it("enables previewcomponent (map type) with preview enabled for all list items", async () => {
      const wrapper = shallowMount(ViewModesList, {
        props: {
          entities: [{ id: "entity1" }, { id: "entity2" }],
        },
      });
      await flushPromises();

      wrapper.vm.previewComponent = previewComponentMap;
      expect(wrapper.vm.previewComponent).toStrictEqual(previewComponentMap);

      wrapper.vm.togglePreviewComponent("entity1");
      expect(wrapper.vm.previewComponentEnabled).toBe(true);
      expect(wrapper.vm.isPreviewComponentEnabledForListItem("entity1")).toBe(
        true,
      );
      expect(wrapper.vm.isPreviewComponentEnabledForListItem("entity2")).toBe(
        true,
      );
    });

    it("changes current previewForEntity when new entities are fetched and ListItemCoverageTypes is OneListItem", async () => {
      const wrapper = shallowMount(ViewModesList, {
        props: {
          entities: [{ id: "test" }],
        },
      });
      await flushPromises();

      wrapper.vm.previewComponent = previewComponentMediaViewer;
      expect(wrapper.vm.previewComponent).toStrictEqual(
        previewComponentMediaViewer,
      );

      wrapper.vm.togglePreviewComponent("entity1");
      expect(wrapper.vm.previewComponentEnabled).toBe(true);
      expect(wrapper.vm.isPreviewComponentEnabledForListItem("entity1")).toBe(
        true,
      );

      const entities = [{ id: "new_entity" }, { id: "another_new_entity" }];
      await wrapper.setProps({
        entities: entities,
      });
      await flushPromises();

      expect(wrapper.vm.previewComponentEnabled).toBe(true);
      expect(wrapper.vm.isPreviewComponentEnabledForListItem("entity1")).toBe(
        false,
      );
      expect(
        wrapper.vm.isPreviewComponentEnabledForListItem("new_entity"),
      ).toBe(true);
      expect(
        wrapper.vm.isPreviewComponentEnabledForListItem("another_new_entity"),
      ).toBe(false);
    });
  });

  describe("multiLine config", () => {
    it("passes multiLine=true to ListItem when config contains multiLine key with value true", async () => {
      const wrapper = shallowMount(ViewModesList, {
        props: {
          entities: [{ id: "entity1" }],
          config: [{ key: "multiLine", value: true }],
        },
      });
      await flushPromises();

      expect(wrapper.vm.multiLine).toBe(true);
    });

    it("passes multiLine=false to ListItem when config is empty", async () => {
      const wrapper = shallowMount(ViewModesList, {
        props: {
          entities: [{ id: "entity1" }],
          config: [],
        },
      });
      await flushPromises();

      expect(wrapper.vm.multiLine).toBe(false);
    });

    it("passes multiLine=false when config does not contain multiLine key", async () => {
      const wrapper = shallowMount(ViewModesList, {
        props: {
          entities: [{ id: "entity1" }],
          config: [{ key: "someOtherKey", value: true }],
        },
      });
      await flushPromises();

      expect(wrapper.vm.multiLine).toBe(false);
    });

    it("returns multiLineColumns from config when provided as number", async () => {
      const wrapper = shallowMount(ViewModesList, {
        props: {
          entities: [{ id: "entity1" }],
          config: [
            { key: "multiLine", value: true },
            { key: "multiLineColumns", value: 3 },
          ],
        },
      });
      await flushPromises();

      expect(wrapper.vm.multiLineColumns).toBe(3);
    });

    it("defaults multiLineColumns to 5 when not in config", async () => {
      const wrapper = shallowMount(ViewModesList, {
        props: {
          entities: [{ id: "entity1" }],
          config: [{ key: "multiLine", value: true }],
        },
      });
      await flushPromises();

      expect(wrapper.vm.multiLineColumns).toBe(5);
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
      const wrapper = shallowMount(ViewModesList, {
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
