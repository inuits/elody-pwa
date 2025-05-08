
import ViewModesList from "../library/view-modes/ViewModesList.vue";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { shallowMount, flushPromises } from "@vue/test-utils";
import {
  ListItemCoverageTypes,
  type PreviewComponent,
  PreviewTypes
} from "@/generated-types/queries";


vi.mock("vue3-openlayers", () => ({
}));

vi.mock("@/helpers", () => {
  const actualModule = vi.importActual("@/helpers");
  return {
    ...actualModule,
    setCssVariable: () => {},
    getEntityPageRoute: () => {},
    getMappedSlug: () => {},
    formatTeaserMetadata: () => {},
    updateEntityMediafileOnlyForMediafiles: () => {},
  }
});

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

describe("ViewModesList", () => {
  beforeEach(() => {
    // Create a mock DOM element
    const gridContainer = document.createElement('div');
    gridContainer.setAttribute('id', 'gridContainer');
    gridContainer.style.width = '1000px'; // Set a width for testing

    // Append the element to the body
    document.body.appendChild(gridContainer);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    // Clean up the mock DOM element
    const gridContainer = document.getElementById('gridContainer');
    if (gridContainer) {
      document.body.removeChild(gridContainer);
    }
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

    it("Should enable previewcomponent (media type) with preview enabled for only 1 list items with the given id", async () => {
      const wrapper = shallowMount(ViewModesList);
      await flushPromises();

      wrapper.vm.previewComponent = previewComponentMediaViewer;
      expect(wrapper.vm.previewComponent).toStrictEqual(previewComponentMediaViewer);

      wrapper.vm.togglePreviewComponent("entity1");
      expect(wrapper.vm.previewComponentEnabled).toBe(true);
      expect(wrapper.vm.isPreviewComponentEnabledForListItem("entity1")).toBe(true);
      expect(wrapper.vm.isPreviewComponentEnabledForListItem("entity2")).toBe(false);
    });

    it("Should enable previewcomponent (map type) with preview enabled for all list items", async () => {
      const wrapper = shallowMount(ViewModesList);
      await flushPromises();

      wrapper.vm.previewComponent = previewComponentMap;
      expect(wrapper.vm.previewComponent).toStrictEqual(previewComponentMap);

      wrapper.vm.togglePreviewComponent("entity1");
      expect(wrapper.vm.previewComponentEnabled).toBe(true);
      expect(wrapper.vm.isPreviewComponentEnabledForListItem("entity1")).toBe(true);
      expect(wrapper.vm.isPreviewComponentEnabledForListItem("entity2")).toBe(true);
    });

    it("Should change current previewForEntity when new entities are fetched and ListItemCoverageTypes is OneListItem", async () => {
      const wrapper = shallowMount(ViewModesList);
      await flushPromises();

      wrapper.vm.previewComponent = previewComponentMediaViewer;
      wrapper.vm.togglePreviewComponent("entity1");
      expect(wrapper.vm.previewComponentEnabled).toBe(true);
      expect(wrapper.vm.isPreviewComponentEnabledForListItem("entity1")).toBe(true);

      wrapper.vm.configurePreviewComponentWithNewEntities([{ id: "new_entity" }, { id: "another_new_entity" }]);

      expect(wrapper.vm.previewComponentEnabled).toBe(true);
      expect(wrapper.vm.isPreviewComponentEnabledForListItem("new_entity")).toBe(true);
      expect(wrapper.vm.isPreviewComponentEnabledForListItem("entity1")).toBe(false);
      expect(wrapper.vm.isPreviewComponentEnabledForListItem("another_new_entity")).toBe(false);
    });
  });

});
