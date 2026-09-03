import { mount } from "@vue/test-utils";
import { ref } from "vue";
import EntityElementList from "../EntityElementList.vue";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
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

// The component imports from "@/composables/upload/useUpload"; expose a
// controllable uploadStatus ref so tests can drive the upload state machine.
const uploadMocks = vi.hoisted(() => ({ uploadStatus: { ref: null as any } }));

vi.mock("@/composables/upload/useUpload", async () => {
  const { ref: vueRef } = await import("vue");
  uploadMocks.uploadStatus.ref = vueRef("no-upload");
  return {
    default: () => ({ uploadStatus: uploadMocks.uploadStatus.ref }),
  };
});

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

vi.mock("@/components/library/BaseLibrary.vue", () => ({
  default: {
    template: '<div data-test="base-library-stub"></div>',
  },
}));

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
  beforeEach(() => {
    if (uploadMocks.uploadStatus.ref) uploadMocks.uploadStatus.ref.value = "no-upload";
  });
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it("renders the entity element list when advanced permissions are not provided", async () => {
    const wrapper = mount(EntityElementList, {
      props: getBasicProps(),
    });

    await flushPromises();

    const entityElementList = await wrapper.find(
      '[data-test="entity-element-wrapper"]',
    );
    expect(entityElementList.exists()).toBe(true);
  });

  it("does not render the entity element list when the user lacks the required permissions", async () => {
    mocks.fetchAdvancedPermissions.mockReturnValue(false);

    const wrapper = mount(EntityElementList, {
      props: {
        ...getBasicProps(),
        can: ["canReadElementList"],
      },
    });

    await flushPromises();

    const entityElementList = await wrapper.find(
      '[data-test="entity-element-wrapper"]',
    );
    expect(entityElementList.exists()).toBe(false);
  });

  it("renders the entity element list when valid permissions are granted", async () => {
    mocks.fetchAdvancedPermissions.mockReturnValue(true);

    const wrapper = mount(EntityElementList, {
      props: {
        ...getBasicProps(),
        can: ["canReadElementList"],
      },
    });

    await flushPromises();

    const entityElementList = await wrapper.find(
      '[data-test="entity-element-wrapper"]',
    );
    expect(entityElementList.exists()).toBe(true);
  });

  it("refetches the parent entity when an upload finishes so $entity-based filters resolve against fresh relations", async () => {
    mocks.fetchAdvancedPermissions.mockReturnValue(true);
    const refetchParentEntity = vi.fn();

    mount(EntityElementList, {
      props: {
        ...getBasicProps(),
        customQuery: "GetEntities",
        customQueryFilters: "GetWebInscriptionRefMediafilesFilter",
      },
      global: {
        provide: { RefetchParentEntity: refetchParentEntity },
      },
    });

    await flushPromises();
    expect(refetchParentEntity).not.toHaveBeenCalled();

    uploadMocks.uploadStatus.ref.value = "upload-finished";
    await flushPromises();

    expect(refetchParentEntity).toHaveBeenCalledTimes(1);
  });

  // The completeness-overview panels all list mediafiles over the same
  // relation, so the relation type alone gave every panel one shared bulk
  // selection queue: ticking a poster showed up as a selection in the
  // scene-images panel and got zipped along with it.
  it("gives each panel its own bulk selection context", async () => {
    mocks.fetchAdvancedPermissions.mockReturnValue(true);
    const contextOf = (wrapper: any) =>
      wrapper
        .find('[data-test="base-library-stub"]')
        .attributes("bulk-operations-context");

    const posters = mount(EntityElementList, {
      props: {
        ...getBasicProps(),
        relationType: "refMediafiles",
        customQueryFilters: "GetRelatedMediafilesWithTypePosterFilters",
      },
    });
    const sceneImages = mount(EntityElementList, {
      props: {
        ...getBasicProps(),
        relationType: "refMediafiles",
        customQueryFilters: "GetRelatedMediafilesWithTypeSceneImagesFilters",
      },
    });

    await flushPromises();

    expect(contextOf(posters)).toBeTruthy();
    expect(contextOf(posters)).not.toBe(contextOf(sceneImages));
  });

  it("falls back to the element label when no custom query filters are configured", async () => {
    mocks.fetchAdvancedPermissions.mockReturnValue(true);
    const contextOf = (wrapper: any) =>
      wrapper
        .find('[data-test="base-library-stub"]')
        .attributes("bulk-operations-context");

    const first = mount(EntityElementList, {
      props: { ...getBasicProps(), label: "element-labels.zones" },
    });
    const second = mount(EntityElementList, {
      props: { ...getBasicProps(), label: "element-labels.areas" },
    });

    await flushPromises();

    expect(contextOf(first)).toContain("element-labels.zones");
    expect(contextOf(first)).not.toBe(contextOf(second));
  });

  it("does not refetch the parent entity while an upload is only in progress", async () => {
    mocks.fetchAdvancedPermissions.mockReturnValue(true);
    const refetchParentEntity = vi.fn();

    mount(EntityElementList, {
      props: {
        ...getBasicProps(),
        customQuery: "GetEntities",
        customQueryFilters: "GetWebInscriptionRefMediafilesFilter",
      },
      global: {
        provide: { RefetchParentEntity: refetchParentEntity },
      },
    });

    await flushPromises();

    uploadMocks.uploadStatus.ref.value = "uploading";
    await flushPromises();

    expect(refetchParentEntity).not.toHaveBeenCalled();
  });
});
