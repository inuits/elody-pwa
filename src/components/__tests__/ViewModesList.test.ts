
import ViewModesList from "../library/view-modes/ViewModesList.vue";
import { describe, it, expect, vi, afterEach } from "vitest";
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

    it("Enables previewcomponent (media type) with preview enabled for only 1 list items with the given id", async () => {
      const wrapper = shallowMount(ViewModesList);
      await flushPromises();

      wrapper.vm.previewComponent = previewComponentMediaViewer;
      expect(wrapper.vm.previewComponent).toStrictEqual(
        previewComponentMediaViewer,
      );

      wrapper.vm.togglePreviewComponent("entity1");
      expect(wrapper.vm.previewComponentEnabled).toBe(true);
      expect(wrapper.vm.isPreviewComponentEnabledForListItem("entity1")).toBe(
        tru,
      );
      expect(wrapper.vm.isPreviewComponentEnabledForListItem("entity2")).toBe(
        fals,
      );
    });

    it("Enables previewcomponent (map type) with preview enabled for all list items", async () => {
      const wrapper = shallowMount(ViewModesList);
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

    //TODO: Try and achieve the same result with editing the prop 'entities' to let the watch hook do it's work
    it("Changes current previewForEntity when new entities are fetched and ListItemCoverageTypes is OneListItem", async () => {
      const wrapper = shallowMount(ViewModesList);
      await flushPromises();

      wrapper.vm.previewComponent = previewComponentMediaViewer;
      wrapper.vm.togglePreviewComponent("entity1");
      expect(wrapper.vm.previewComponentEnabled).toBe(true);
      expect(wrapper.vm.isPreviewComponentEnabledForListItem("entity1")).toBe(
        true,
      );

      wrapper.vm.configurePreviewComponentWithNewEntities([
        { id: "new_entity" },
        { id: "another_new_entity" ,
      ]);

      expect(wrapper.vm.previewComponentEnabled).toBe(true);
      expect(
        wrapper.vm.isPreviewComponentEnabledForListItem("new_entity")
      ).toBe(true);
      expect(wrapper.vm.isPreviewComponentEnabledForListItem("entity1")).toBe(
        false
      );
      expect(
        wrapper.vm.isPreviewComponentEnabledForListItem("another_new_entity")
      ).toBe(false);
    });
  });
});
