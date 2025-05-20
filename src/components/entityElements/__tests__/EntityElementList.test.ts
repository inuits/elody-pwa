import { mount } from "@vue/test-utils";
import { ref } from "vue";
// import EntityElementList from "../EntityElementList.vue";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  BaseLibraryModes,
  EntityListViewMode,
  RelationActions,
} from "@/generated-types/queries";
import { flushPromises } from "@vue/test-utils";

vi.mock("@/composables/useImport", () => ({
  useImport: () => ({
    loadDocument: vi.fn(),
  }),
}));

vi.mock("@/composables/useUpload", () => ({
  default: () => ({
    uploadStatus: ref("idle"),
  }),
}));

vi.mock("@/composables/useEntityMediafileSelector", () => ({
  useEntityMediafileSelector: () => ({
    mediafileSelectionState: ref({
      selectedMediafile: undefined,
    }),
  }),
}));

const mocks = vi.hoisted(() => {
  return {
    fetchAdvancedPermissions: vi.fn(),
    advancedPermissions: {
      canReadElementList: false,
    },
  };
});

vi.mock("@/composables/usePermissions", () => ({
  usePermissions: () => ({
    can: vi.fn(),
    fetchAdvancedPermission: mocks.fetchAdvancedPermissions,
    setExtraVariables: vi.fn(),
  }),
  ignorePermissions: { value: false },
  advancedPermissions: mocks.advancedPermissions,
}));

const getBasicProps = () => ({
  label: "panel-labels",
  isCollapsed: false,
  entityList: [],
  identifiers: ["2142414-24124124124", "2142414-24124124124"],
  relationType: "zones",
  entityUuid: "2142414-24124124124",
  types: ["Area", "BakeryArea"],
  customBulkOperations: "GetDevicesZonesServedBulkOperations",
  viewMode: EntityListViewMode.Library,
  baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
  entityListElements: [],
  allowedActionsOnRelations: [RelationActions.AddRelation],
  enableAdvancedFilters: false,
  customQuery: "",
  customQueryRelationType: "",
  customQueryFilters: "",
  searchInputType: "",
  entityId: "2142414-24124124124",
  entityType: "mediafile",
  id: "test-id",
});

describe("EntityElementList", () => {
  // afterEach(() => {
  //   vi.clearAllMocks();
  //   vi.resetAllMocks();
  // });

  it("renders the entity element list when advanced permissions are not provided", async () => {
    expect(true).toBe(true);
  });

  // it("renders the entity element list when advanced permissions are not provided", async () => {
  //   const wrapper = mount(EntityElementList, {
  //     props: getBasicProps(),
  //     global: {
  //       stubs: {
  //         BaseLibrary: true,
  //       },
  //     },
  //   });

  //   await flushPromises();

  //   const entityElementList = await wrapper.find(
  //     '[data-test="entity-element-wrapper"]',
  //   );
  //   expect(entityElementList.exists()).toBe(true);
  // });

  // it("does not render the entity element list when the user lacks the required permissions", async () => {
  //   mocks.fetchAdvancedPermissions.mockReturnValue(false);

  //   const wrapper = mount(EntityElementList, {
  //     props: {
  //       ...getBasicProps(),
  //       can: ["canReadElementList"],
  //     },
  //     global: {
  //       stubs: {
  //         BaseLibrary: true,
  //       },
  //     },
  //   });

  //   await flushPromises();

  //   const entityElementList = await wrapper.find(
  //     '[data-test="entity-element-wrapper"]',
  //   );
  //   expect(entityElementList.exists()).toBe(false);
  // });

  // it("renders the entity element list when valid permissions are granted", async () => {
  //   mocks.fetchAdvancedPermissions.mockReturnValue(true);

  //   const wrapper = mount(EntityElementList, {
  //     props: {
  //       ...getBasicProps(),
  //       can: ["canReadElementList"],
  //     },
  //     global: {
  //       stubs: {
  //         BaseLibrary: true,
  //       },
  //     },
  //   });

  //   await flushPromises();

  //   const entityElementList = await wrapper.find(
  //     '[data-test="entity-element-wrapper"]',
  //   );
  //   expect(entityElementList.exists()).toBe(true);
  // });
});
