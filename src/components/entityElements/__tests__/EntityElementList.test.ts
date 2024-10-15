import { mount } from "@vue/test-utils";
import { ref } from "vue";
import EntityElementList from "../EntityElementList.vue";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  BaseLibraryModes,
  EntityListViewMode,
  RelationActions,
} from "@/generated-types/queries";
import { flushPromises } from "@vue/test-utils";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/composables/useImport", () => ({
  useImport: () => ({
    loadDocument: vi.fn(),
  }),
}));

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({
    addRelations: vi.fn(),
  }),
}));

vi.mock("@/composables/useEntityPickerModal", () => ({
  default: () => ({
    setAcceptedTypes: vi.fn(),
    setEntityUuid: vi.fn(),
    setParentEntityType: vi.fn(),
    setRelationType: vi.fn(),
    setCustomGetEntitiesQuery: vi.fn(),
    setCustomGetEntitiesFiltersQuery: vi.fn(),
  }),
}));

vi.mock("@/composables/useEntityElementCollapseHelper", () => ({
  useEntityElementCollapseHelper: () => ({
    toggleElementCollapse: vi.fn(),
  }),
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({
    openModal: vi.fn(),
  }),
}));

vi.mock("@/composables/useEdit", () => ({
  default: () => ({
    isEdit: true,
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

vi.mock("vue-router", () => ({
  useRouter: () => ({
    meta: {
      entityType: "some-entity-type",
    },
  }),
  useRoute: () => ({
    meta: {
      entityType: "some-entity-type",
    },
  }),
}));

vi.mock("@/types", () => ({
  Unicons: {
    PlusCircle: { name: "plus-circle" },
    AngleDown: { name: "plus-circle" },
    AngleUp: { name: "plus-circle" },
  },
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

const mocks = vi.hoisted(() => {
  return {
    fetchAdvancedPermissions: vi.fn(),
    advancedPermissions: {
      canReadElementList: false,
      canAddRelations: false,
    },
  };
});

vi.mock("@/composables/usePermissions", () => ({
  usePermissions: () => ({
    can: vi.fn(),
    fetchAdvancedPermission: mocks.fetchAdvancedPermissions,
  }),
  ignorePermissions: { value: false },
  advancedPermissions: mocks.advancedPermissions,
}));

const getBasicProps = () => ({
  label: "panel-labels",
  isCollapsed: false,
  entityList: [],
  identifiers: ["2142414-24124124124", "2142414-24124124124"],
  relationType: "zonesServed",
  entityUuid: "2142414-24124124124",
  types: ["Area", "BakeryArea"],
  customBulkOperations: "GetDevicesZonesServedBulkOperations",
  viewMode: EntityListViewMode.Library,
  baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
  entityListElements: [],
  allowedActionsOnRelations: [RelationActions.AddRelation],
});

describe("EntityElementList", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it("renders the entity element list and the 'Add' button when advanced permissions are not provided", async () => {
    const wrapper = mount(EntityElementList, {
      props: getBasicProps(),
      global: {
        stubs: {
          BaseLibrary: true,
        },
      },
    });

    await flushPromises();

    const entityElementList = await wrapper.find(
      '[data-test="entity-element-wrapper"]'
    );
    expect(wrapper.vm.showElementList).toBe(true);
    expect(entityElementList.exists()).toBe(true);

    const entityElementListAddBtn = await wrapper.find(
      '[data-cy="entity-element-list-add-button"]'
    );
    expect(wrapper.vm.showAddRelationBtn).toBe(true);
    expect(entityElementListAddBtn.exists()).toBe(true);
  });

  it("does not render the 'Add' button when the user lacks the required permissions", async () => {
    mocks.advancedPermissions["canAddRelations"] = false;
    mocks.fetchAdvancedPermissions.mockReturnValue(false);

    const wrapper = mount(EntityElementList, {
      props: {
        ...getBasicProps(),
        canAddRelations: ["canAddRelations"],
      },
      global: {
        stubs: {
          BaseLibrary: true,
        },
      },
    });

    await flushPromises();

    const entityElementList = await wrapper.find(
      '[data-test="entity-element-wrapper"]'
    );
    expect(wrapper.vm.showElementList).toBe(true);
    expect(entityElementList.exists()).toBe(true);

    const entityElementListAddBtn = await wrapper.find(
      '[data-cy="entity-element-list-add-button"]'
    );
    expect(wrapper.vm.showAddRelationBtn).toBe(false);
    expect(entityElementListAddBtn.exists()).toBe(false);
  });

  it("does not render the component when the user lacks advanced permissions", async () => {
    mocks.advancedPermissions["canReadElementList"] = false;
    mocks.fetchAdvancedPermissions.mockReturnValue(false);

    const wrapper = mount(EntityElementList, {
      props: {
        ...getBasicProps(),
        can: ["canReadElementList"],
      },
      global: {
        stubs: {
          BaseLibrary: true,
        },
      },
    });

    await flushPromises();

    const entityElementList = await wrapper.find(
      '[data-test="entity-element-wrapper"]'
    );
    expect(wrapper.vm.showElementList).toBe(false);
    expect(entityElementList.exists()).toBe(false);

    const entityElementListAddBtn = await wrapper.find(
      '[data-cy="entity-element-list-add-button"]'
    );
    expect(entityElementListAddBtn.exists()).toBe(false);
  });

  it("renders the component and the 'Add' button when valid permissions are granted", async () => {
    mocks.advancedPermissions["canReadElementList"] = true;
    mocks.advancedPermissions["canAddRelations"] = true;
    mocks.fetchAdvancedPermissions.mockReturnValue(true);

    const wrapper = mount(EntityElementList, {
      props: {
        ...getBasicProps(),
        can: ["canReadElementList"],
        canAddRelations: ["canAddRelations"],
      },
      global: {
        stubs: {
          BaseLibrary: true,
        },
      },
    });

    await flushPromises();

    const entityElementList = await wrapper.find(
      '[data-test="entity-element-wrapper"]'
    );
    expect(wrapper.vm.showElementList).toBe(true);
    expect(entityElementList.exists()).toBe(true);

    const entityElementListAddBtn = await wrapper.find(
      '[data-cy="entity-element-list-add-button"]'
    );
    expect(wrapper.vm.showAddRelationBtn).toBe(true);
    expect(await entityElementListAddBtn.exists()).toBe(true);
  });
});
