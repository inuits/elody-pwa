import ListItem from "../ListItem.vue";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import type { SeenTracking } from "@/types/contextMenuRouteConfig";

const mockSeenItems = vi.hoisted(() => ({
  markAsSeen: vi.fn(),
  markManyAsSeen: vi.fn(),
  unmarkManyAsSeen: vi.fn(),
}));

const mockSeenState = vi.hoisted(() => ({
  tracking: undefined as unknown,
  isSeen: vi.fn<(id: string) => boolean>(() => false),
  isNew: vi.fn<(id: string, values?: Record<string, unknown>) => boolean>(
    () => false,
  ),
}));

vi.mock("@/composables/useSeenItems", () => ({
  useSeenItems: () => mockSeenItems,
  useSeenState: (tracking: unknown) => {
    mockSeenState.tracking = tracking;
    return mockSeenState;
  },
}));

const mockEntityPageConfig = vi.hoisted(() => ({
  actions: { value: [] },
  hasEditMetadataButton: { value: undefined },
  deleteButton: { value: undefined },
  seenTracking: { value: undefined as SeenTracking | undefined },
}));

vi.mock("@/composables/useEntityPageConfig", () => ({
  useEntityPageConfig: () => mockEntityPageConfig,
}));

vi.mock("@/helpers", async () => {
  const actualModule = await vi.importActual("@/helpers");
  return {
    ...actualModule,
    setCssVariable: () => {},
    getEntityPageRoute: () => {},
    getMappedSlug: () => {},
    formatTeaserMetadata: () => {},
    updateEntityMediafileOnlyForMediafiles: () => {},
    stringIsUrl: () => false,
    asString: (v: any) => v?.toString() ?? "",
  };
});

vi.mock("@/main", () => ({
  auth: { isAuthenticated: { value: true } },
  router: {
    currentRoute: { value: { params: { id: "test" } } },
  },
}));

vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({ isEdit: false, showErrors: false }),
}));

vi.mock("@/composables/useEntitySingle", () => ({
  default: () => ({ getEntityUuid: () => "test-uuid" }),
}));

vi.mock("@/composables/useListItemHelper", () => ({
  hoveredListItem: { value: "" },
  useListItemHelper: () => ({ getMediaFilenameFromEntity: () => "" }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

describe("ListItem", () => {
  beforeEach(() => {
    mockEntityPageConfig.seenTracking.value = undefined;
    mockSeenState.isSeen.mockImplementation(() => false);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  const defaultProps = {
    bulkOperationsContext: undefined,
    relation: "no-relation-found" as const,
    hasSelection: false,
    previewComponentEnabled: false,
    previewComponentCurrentActive: false,
    previewComponentFeatureEnabled: false,
    viewMode: "list" as const,
    teaserMetadata: [],
  };

  describe("seen items", () => {
    const seenItemProps = {
      ...defaultProps,
      itemId: "seen-item",
      hasSelection: true,
    };

    const markItemAsSeen = () => {
      mockEntityPageConfig.seenTracking.value = { display: "dimSeen" };
      mockSeenState.isSeen.mockImplementation(
        (id: string) => id === "seen-item",
      );
    };

    it("greys out an item that has been seen", () => {
      markItemAsSeen();

      const wrapper = shallowMount(ListItem, { props: seenItemProps });

      expect(wrapper.find("[data-cy='list-item']").classes()).toContain(
        "grayscale",
      );
    });

    it("keeps the selection checkbox visible for a seen item", () => {
      markItemAsSeen();

      const wrapper = shallowMount(ListItem, { props: seenItemProps });

      const checkbox = wrapper.findComponent(BaseInputCheckbox);
      expect(checkbox.exists()).toBe(true);
      expect(checkbox.classes()).not.toContain("invisible");
    });

    it("does not grey out an item that has not been seen", () => {
      mockEntityPageConfig.seenTracking.value = { display: "dimSeen" };

      const wrapper = shallowMount(ListItem, { props: seenItemProps });

      expect(wrapper.find("[data-cy='list-item']").classes()).not.toContain(
        "grayscale",
      );
    });

    it("uses the seen tracking of the current route", () => {
      shallowMount(ListItem, { props: seenItemProps });

      expect(mockSeenState.tracking).toBe(mockEntityPageConfig.seenTracking);
    });

    it("still hides the selection checkbox for a disabled item", () => {
      const wrapper = shallowMount(ListItem, {
        props: { ...seenItemProps, isDisabled: true },
      });

      const checkbox = wrapper.findComponent(BaseInputCheckbox);
      expect(checkbox.exists()).toBe(true);
      expect(checkbox.classes()).toContain("invisible");
      expect(wrapper.find("[data-cy='list-item']").classes()).toContain(
        "grayscale",
      );
    });
  });

  describe("new items", () => {
    const newItemProps = {
      ...defaultProps,
      itemId: "new-item",
      intialValues: { last_activity_at: "2026-10-09T10:00:00Z" },
    };

    beforeEach(() => {
      mockEntityPageConfig.seenTracking.value = {
        display: "highlightNew",
        activityKey: "last_activity_at",
        ttlDays: 30,
      };
    });

    it("highlights an item with activity that was not seen yet", () => {
      mockSeenState.isNew.mockImplementation((id: string) => id === "new-item");

      const wrapper = shallowMount(ListItem, { props: newItemProps });

      expect(wrapper.find("[data-cy='list-item']").classes()).toContain(
        "font-semibold",
      );
      expect(wrapper.find("[data-cy='new-indicator']").exists()).toBe(true);
      expect(mockSeenState.isNew).toHaveBeenCalledWith("new-item", {
        last_activity_at: "2026-10-09T10:00:00Z",
      });
    });

    it("does not highlight an item without new activity", () => {
      mockSeenState.isNew.mockImplementation(() => false);

      const wrapper = shallowMount(ListItem, { props: newItemProps });

      expect(wrapper.find("[data-cy='list-item']").classes()).not.toContain(
        "font-semibold",
      );
      expect(wrapper.find("[data-cy='new-indicator']").exists()).toBe(false);
    });
  });

  describe("multiLine prop", () => {
    it("defaults multiLine to false", () => {
      const wrapper = shallowMount(ListItem, {
        props: defaultProps,
      });
      expect(wrapper.props("multiLine")).toBe(false);
    });

    it("renders metadata container with flex items-center but without grid when multiLine is false", () => {
      const wrapper = shallowMount(ListItem, {
        props: {
          ...defaultProps,
          multiLine: false,
        },
      });
      const metadataContainer = wrapper.find("[class*='w-full']");
      expect(metadataContainer.exists()).toBe(true);
      expect(metadataContainer.classes()).toContain("flex");
      expect(metadataContainer.classes()).toContain("items-center");
      expect(metadataContainer.classes()).not.toContain("grid");
    });

    it("renders metadata container with grid classes when multiLine is true", () => {
      const wrapper = shallowMount(ListItem, {
        props: {
          ...defaultProps,
          multiLine: true,
        },
      });
      const metadataContainer = wrapper.find("[class*='w-full']");
      expect(metadataContainer.exists()).toBe(true);
      expect(metadataContainer.classes()).toContain("grid");
      expect(metadataContainer.classes()).toContain("gap-x-4");
      expect(metadataContainer.classes()).toContain("gap-y-3");
      expect(metadataContainer.classes()).toContain("items-start");
      expect(metadataContainer.classes()).not.toContain("flex");
    });

    it("applies grid-column span style when metadata item has colSpan in multiLine mode", () => {
      const wrapper = shallowMount(ListItem, {
        props: {
          ...defaultProps,
          multiLine: true,
          teaserMetadata: [
            { key: "field1", colSpan: "2", value: { value: "test" } },
          ],
        },
      });
      const metadataItems = wrapper.findAll("[class*='w-full'] > div");
      expect(metadataItems.length).toBeGreaterThan(0);
      expect(metadataItems[0].attributes("style")).toContain(
        "grid-column: span 2",
      );
    });

    it("does not apply grid-column span style when multiLine is false", () => {
      const wrapper = shallowMount(ListItem, {
        props: {
          ...defaultProps,
          multiLine: false,
          teaserMetadata: [
            { key: "field1", colSpan: "2", value: { value: "test" } },
          ],
        },
      });
      const metadataItems = wrapper.findAll("[class*='w-full'] > div");
      expect(metadataItems.length).toBeGreaterThan(0);
      expect(metadataItems[0].attributes("style")).toBeFalsy();
    });
  });

  describe("loading state", () => {
    it("stops pulsing once the parent finished loading, even when a context menu action toggled loading around the fetch", async () => {
      const wrapper = shallowMount(ListItem, {
        props: { ...defaultProps, loading: false },
      });

      // action starts -> toggle on, parent refetch -> loading, fetch resolves,
      // action's finally -> toggle off
      wrapper.vm.toggleLoading();
      await wrapper.setProps({ loading: true });
      await wrapper.setProps({ loading: false });
      wrapper.vm.toggleLoading();
      await wrapper.vm.$nextTick();

      expect(
        wrapper.find("[data-cy='list-item']").classes(),
      ).not.toContain("animate-pulse");
    });

    it("pulses while the parent is loading", async () => {
      const wrapper = shallowMount(ListItem, {
        props: { ...defaultProps, loading: true },
      });
      expect(wrapper.find("[data-cy='list-item']").classes()).toContain(
        "animate-pulse",
      );
    });
  });
});
