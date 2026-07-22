import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { shallowMount, flushPromises } from "@vue/test-utils";
import { ref, reactive } from "vue";
import { DefaultApolloClient } from "@vue/apollo-composable";

// This suite intentionally does NOT mock @/composables/useViewModes, unlike
// BaseLibrary.test.ts — it exercises the real wiring between BaseLibrary's
// props and useViewModes' localStorage persistence.

const libEntities = ref<any[]>([]);
const libTotalEntityCount = ref(0);
const libGetEntities = vi.fn().mockResolvedValue([]);
const libEntitiesLoading = ref(false);

const mockRoute = reactive({
  name: "TestRoute",
  path: "/test",
  fullPath: "/test",
  meta: { entityType: "BaseEntity" },
});

vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({
    addRefetchFunction: vi.fn(),
    addMutationCallback: vi.fn(),
    isEdit: ref(false),
  }),
}));

vi.mock("@/composables/useEntitySingle", () => ({
  default: () => ({
    getEntityUuid: () => "entity-123",
    setEntityUuid: vi.fn(),
    setEntityType: vi.fn(),
    getEntityType: vi.fn(),
    setRefetch: vi.fn(),
    getRefetch: vi.fn(),
  }),
}));

vi.mock("@/components/library/useBaseLibrary", () => ({
  useBaseLibrary: () => ({
    enqueuePromise: vi.fn(),
    entities: libEntities,
    placeholderEntities: ref([]),
    placeholderEntitiesAmount: ref(0),
    entitiesLoading: libEntitiesLoading,
    getCustomBulkOperations: vi.fn(),
    fetchAllPromises: vi.fn().mockResolvedValue(undefined),
    getEntities: libGetEntities,
    getEntityById: vi.fn().mockResolvedValue(undefined),
    manipulationQuery: ref(undefined),
    setAdvancedFilters: vi.fn(),
    setEntityType: vi.fn(),
    setIsSearchLibrary: vi.fn(),
    setLimit: vi.fn(),
    setManipulationOfQuery: vi.fn(),
    setParentEntityIdentifiers: vi.fn(),
    setsearchInputType: vi.fn(),
    setSkip: vi.fn(),
    setLocale: vi.fn(),
    setSortKey: vi.fn(),
    setSortOrder: vi.fn(),
    resetQueryVariablesForNewPath: vi.fn(),
    totalEntityCount: libTotalEntityCount,
  }),
}));

vi.mock("../usePaginationStore", () => ({
  PaginationStoreKey: Symbol("PaginationStoreKey"),
  createPaginationStore: () => ({
    setLimit: vi.fn(),
    setPage: vi.fn(),
    updateTotalAmount: vi.fn(),
    skip: ref(1),
    limit: ref(20),
  }),
}));

vi.mock("@/composables/useBreadcrumbs", () => ({
  useBreadcrumbs: () => ({ iterateOverBreadcrumbs: vi.fn() }),
  breadcrumbPathFinished: ref(false),
  breadcrumbRoutes: ref([]),
}));

vi.mock("@/composables/useMaps", () => ({
  useMaps: () => ({ getBasicMapProperties: vi.fn(() => ({ mapType: "" })) }),
}));

vi.mock("@/composables/useBulkOperations", () => ({
  useBulkOperations: () => ({
    enqueueItemForBulkProcessing: vi.fn(),
    triggerBulkSelectionEvent: vi.fn(),
  }),
  BulkOperationsContextEnum: {
    EntityElementListEntityPickerModal: "EntityElementListEntityPickerModal",
    EntityElementMediaEntityPickerModal: "EntityElementMediaEntityPickerModal",
  },
}));

vi.mock("@/composables/useBulkOperationsActionsBar", () => ({
  useBulkOperationsActionsBar: () => ({
    bulkOperations: ref([]),
    selectedBulkOperation: ref(undefined),
    subDropdownOptions: ref([]),
    clearSubDropdownOptions: vi.fn(),
    handleSelectedBulkOperation: vi.fn(),
  }),
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ closeModal: vi.fn() }),
}));

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({
    replaceRelationsFromSameType: vi.fn(),
    getForm: vi.fn(() => undefined),
  }),
}));

vi.mock("@/composables/upload/useUpload", () => ({
  default: () => ({ uploadStatus: ref("idle") }),
}));

vi.mock("@/composables/useEntityPickerModal", () => ({
  default: () => ({
    setAcceptedTypes: vi.fn(),
    setEntityUuid: vi.fn(),
    setEntityId: vi.fn(),
    setRelationType: vi.fn(),
    setCustomGetEntitiesQuery: vi.fn(),
    setCustomGetEntitiesFiltersQuery: vi.fn(),
    setParentEntityType: vi.fn(),
    setRefetchEntitiesFunction: vi.fn(),
    setCropMode: vi.fn(),
    setCropCoordinatesKey: vi.fn(),
    setActionsOnResult: vi.fn(),
  }),
}));

vi.mock("@/composables/useUpdateRelation", () => ({
  saveRelatedEntityData: vi.fn(),
}));

vi.mock("@/helpers", () => ({
  formatTeaserMetadata: vi.fn(() => ({})),
  getEntityTitle: vi.fn(() => "title"),
}));

vi.mock("@/main", () => ({
  auth: { isAuthenticated: ref(true) },
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, locale: ref("en") }),
}));

vi.mock("vue-router", () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({
    currentRoute: ref({ name: "TestRoute" }),
  }),
}));

import BaseLibrary from "../BaseLibrary.vue";
import FiltersBase from "@/components/filters/FiltersBase.vue";

const config = {
  features: {
    hasBulkSelect: false,
    multilanguage: { supportsMultilingualMetadataEditing: false },
  },
};

const getWrapper = (props: Record<string, unknown> = {}) =>
  shallowMount(BaseLibrary, {
    props: {
      id: "lib-1",
      listItemRouteName: "SingleEntity",
      bulkOperationsContext: undefined,
      entityType: "BaseEntity",
      ...props,
    },
    global: {
      provide: {
        config,
        [DefaultApolloClient as symbol]: { query: vi.fn(), mutate: vi.fn() },
        IsPreviewElement: false,
        showCurrentPreviewFlow: true,
        ParentEntityProvider: undefined,
      },
      stubs: {
        teleport: true,
      },
    },
  });

describe("BaseLibrary.vue expandFilters persistence (real useViewModes)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockRoute.name = "TestRoute";
    mockRoute.path = "/test";
    libEntities.value = [];
    libTotalEntityCount.value = 0;
    libEntitiesLoading.value = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("persists expandFilters:true to localStorage when the user toggles the filter panel (persistExpandFilters=true, matching AssetLibrary)", async () => {
    const wrapper = getWrapper({ persistExpandFilters: true });
    await flushPromises();

    const filtersBase = wrapper.findComponent(FiltersBase);
    expect(filtersBase.exists()).toBe(true);

    filtersBase.vm.$emit("expandFilters", false);
    await flushPromises();

    const stored = JSON.parse(
      window.localStorage.getItem("_displayPreferences") || "{}",
    );
    expect(stored.expandFilters).toBe(true);

    wrapper.unmount();
  });

  it("still persists grid/table view mode by default (saveViewPreferences omitted), without persisting expandFilters (persistExpandFilters omitted)", async () => {
    const wrapper = getWrapper();
    await flushPromises();

    const filtersBase = wrapper.findComponent(FiltersBase);
    filtersBase.vm.$emit("expandFilters", false);
    await flushPromises();

    const stored = JSON.parse(
      window.localStorage.getItem("_displayPreferences") || "{}",
    );
    expect(stored).toHaveProperty("grid");
    expect(stored).toHaveProperty("table");
    expect(stored.expandFilters).not.toBe(true);

    wrapper.unmount();
  });
});
