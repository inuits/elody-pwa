import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";
import { DefaultApolloClient } from "@vue/apollo-composable";

// --- Hoisted mutable state (changes between tests) ---------------------------
const mocks = vi.hoisted(() => ({
  entityUuid: "entity-123" as string | undefined,
  addRefetchFunction: undefined as unknown as ReturnType<typeof vi.fn>,
  addMutationCallback: undefined as unknown as ReturnType<typeof vi.fn>,
}));

// --- Edit composable (the behavioral seam under test) ------------------------
vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({
    addRefetchFunction: mocks.addRefetchFunction,
    addMutationCallback: mocks.addMutationCallback,
    isEdit: ref(false),
  }),
}));

// --- Entity single: controls getEntityUuid -----------------------------------
vi.mock("@/composables/useEntitySingle", () => ({
  default: () => ({
    getEntityUuid: () => mocks.entityUuid,
    setEntityUuid: vi.fn(),
    setEntityType: vi.fn(),
    getEntityType: vi.fn(),
    setRefetch: vi.fn(),
    getRefetch: vi.fn(),
  }),
}));

// --- useBaseLibrary: returns the data/query helpers --------------------------
vi.mock("@/components/library/useBaseLibrary", () => ({
  useBaseLibrary: () => ({
    enqueuePromise: vi.fn(),
    entities: ref([]),
    placeholderEntities: ref([]),
    placeholderEntitiesAmount: ref(0),
    entitiesLoading: ref(false),
    getCustomBulkOperations: vi.fn(),
    fetchAllPromises: vi.fn().mockResolvedValue(undefined),
    getEntities: vi.fn().mockResolvedValue([]),
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
    totalEntityCount: ref(0),
  }),
}));

// --- Pagination store ---------------------------------------------------------
vi.mock("../usePaginationStore", () => ({
  PaginationStoreKey: Symbol("PaginationStoreKey"),
  createPaginationStore: () => ({
    setLimit: vi.fn(),
    updateTotalAmount: vi.fn(),
    skip: ref(1),
    limit: ref(20),
  }),
}));

// --- Other composables used at setup / onMounted -----------------------------
vi.mock("@/composables/useStateManagement", () => ({
  useStateManagement: () => ({ getStateForRoute: vi.fn(() => ({})) }),
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

vi.mock("@/composables/useViewModes", () => ({
  useViewModes: () => ({
    displayList: ref(true),
    displayGrid: ref(false),
    displayTable: ref(false),
    displayPreview: ref(false),
    displayMap: ref(false),
    expandFilters: ref(false),
    toggles: ref([]),
    configPerViewMode: ref({}),
    viewModesIncludeViewModesMedia: ref(false),
    showViewModesList: ref(false),
    determineViewModes: vi.fn(),
    getUserPreferredViewModeConfiguration: vi.fn(),
    resetToListView: vi.fn(),
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

// Keep the real generated enums/types; the SFC template references several
// enum members (e.g. ActionsOnResultTypes) that must resolve at render time.
vi.mock("@/generated-types/queries", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/generated-types/queries")>();
  return { ...actual };
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, locale: ref("en") }),
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({
    name: "TestRoute",
    path: "/test",
    fullPath: "/test",
    meta: { entityType: "BaseEntity" },
  }),
  useRouter: () => ({
    currentRoute: ref({ name: "TestRoute" }),
  }),
}));

import BaseLibrary from "../BaseLibrary.vue";

// --- Props / wrapper factories ------------------------------------------------
const getDefaultProps = () => ({
  id: "lib-1",
  listItemRouteName: "SingleEntity",
  bulkOperationsContext: undefined,
  entityType: "BaseEntity",
});

const predefinedEntityFixture = () => ({
  id: "e1",
  uuid: "e1",
  allowedViewModes: { viewModes: [] },
});

const config = {
  features: {
    hasBulkSelect: false,
    multilanguage: { supportsMultilingualMetadataEditing: false },
  },
};

const getWrapper = (props: Record<string, unknown> = {}) =>
  shallowMount(BaseLibrary, {
    props: { ...getDefaultProps(), ...props },
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

describe("BaseLibrary.vue syncEditStateCallbacks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.entityUuid = "entity-123";
    mocks.addRefetchFunction = vi.fn();
    mocks.addMutationCallback = vi.fn();
  });

  it("does not register edit-state callbacks when predefinedEntities is provided", async () => {
    getWrapper({ predefinedEntities: [predefinedEntityFixture()] });
    await flushPromises();

    expect(mocks.addRefetchFunction).not.toHaveBeenCalled();
    expect(mocks.addMutationCallback).not.toHaveBeenCalled();
  });

  it("registers the refetch callback when predefinedEntities is not provided", async () => {
    getWrapper();
    await flushPromises();

    expect(mocks.addRefetchFunction).toHaveBeenCalled();
  });

  it("registers the mutation callback when an entity id is present and predefinedEntities is not provided", async () => {
    mocks.entityUuid = "entity-123";
    getWrapper();
    await flushPromises();

    expect(mocks.addMutationCallback).toHaveBeenCalled();
  });

  it("does not register the mutation callback when there is no entity id", async () => {
    mocks.entityUuid = undefined;
    getWrapper();
    await flushPromises();

    expect(mocks.addRefetchFunction).toHaveBeenCalled();
    expect(mocks.addMutationCallback).not.toHaveBeenCalled();
  });
});
