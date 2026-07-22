import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { shallowMount, flushPromises } from "@vue/test-utils";
import { ref, reactive } from "vue";
import { DefaultApolloClient } from "@vue/apollo-composable";

// --- Hoisted mutable state (changes between tests) ---------------------------
const mocks = vi.hoisted(() => ({
  entityUuid: "entity-123" as string | undefined,
  addRefetchFunction: undefined as unknown as ReturnType<typeof vi.fn>,
  addMutationCallback: undefined as unknown as ReturnType<typeof vi.fn>,
}));

// Module-level refs shared with the useBaseLibrary mock — cannot go in
// vi.hoisted() because ref() is not available before imports are resolved.
const libEntities = ref<any[]>([]);
const libTotalEntityCount = ref(0);
const libGetEntities = vi.fn().mockResolvedValue([]);
const libEntitiesLoading = ref(false);
const libDetermineViewModes = vi.fn();
const libGetUserPreferredViewModeConfiguration = vi.fn();

// Reactive route object — allows triggering the route watcher in BaseLibrary
const mockRoute = reactive({
  name: "TestRoute",
  path: "/test",
  fullPath: "/test",
  meta: { entityType: "BaseEntity" },
});

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

// --- Pagination store ---------------------------------------------------------
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
    determineViewModes: libDetermineViewModes,
    getUserPreferredViewModeConfiguration: libGetUserPreferredViewModeConfiguration,
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

// Note: @/generated-types/queries is intentionally NOT mocked. The SFC
// templates reference real enum members (e.g. DamsIcons, ActionsOnResultTypes)
// that must resolve at render time, so the real module is used directly.
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
import ViewModesList from "../view-modes/ViewModesList.vue";

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

describe("BaseLibrary.vue enableSelection", () => {
  let wrapper: ReturnType<typeof getWrapper> | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.path = "/test";
    mocks.entityUuid = "entity-123";
    mocks.addRefetchFunction = vi.fn();
    mocks.addMutationCallback = vi.fn();
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
  });

  const enableSelectionOf = (wrapper: ReturnType<typeof getWrapper>) =>
    wrapper.findComponent(ViewModesList).props("enableSelection");

  it("is enabled for pickers that opt out of the bulk toolbar but still want single-item selection (e.g. tagging)", () => {
    wrapper = getWrapper({ enableBulkOperations: false });
    expect(enableSelectionOf(wrapper)).toBe(true);
  });

  it("stays disabled for informational pickers that explicitly opt out of selection", () => {
    wrapper = getWrapper({ enableBulkOperations: false, selectionEnabled: false });
    expect(enableSelectionOf(wrapper)).toBe(false);
  });

  it("stays disabled for search libraries regardless of selectionEnabled", () => {
    wrapper = getWrapper({ enableBulkOperations: false, isSearchLibrary: true });
    expect(enableSelectionOf(wrapper)).toBe(false);
  });
});

describe("BaseLibrary.vue syncEditStateCallbacks", () => {
  let wrapper: ReturnType<typeof getWrapper> | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.path = "/test";
    mocks.entityUuid = "entity-123";
    mocks.addRefetchFunction = vi.fn();
    mocks.addMutationCallback = vi.fn();
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
  });

  it("does not register edit-state callbacks when predefinedEntities is provided", async () => {
    wrapper = getWrapper({ predefinedEntities: [predefinedEntityFixture()] });
    await flushPromises();

    expect(mocks.addRefetchFunction).not.toHaveBeenCalled();
    expect(mocks.addMutationCallback).not.toHaveBeenCalled();
  });

  it("registers the refetch callback when predefinedEntities is not provided", async () => {
    wrapper = getWrapper();
    await flushPromises();

    expect(mocks.addRefetchFunction).toHaveBeenCalled();
  });

  it("registers the mutation callback when an entity id is present and predefinedEntities is not provided", async () => {
    mocks.entityUuid = "entity-123";
    wrapper = getWrapper();
    await flushPromises();

    expect(mocks.addMutationCallback).toHaveBeenCalled();
  });

  it("does not register the mutation callback when there is no entity id", async () => {
    mocks.entityUuid = undefined;
    wrapper = getWrapper();
    await flushPromises();

    expect(mocks.addRefetchFunction).toHaveBeenCalled();
    expect(mocks.addMutationCallback).not.toHaveBeenCalled();
  });
});

describe("BaseLibrary.vue syncTotalCountWithOptimisticChange", () => {
  const makeEntity = (id: string) => ({ id, uuid: id, allowedViewModes: { viewModes: [] } });
  let wrapper: ReturnType<typeof getWrapper> | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.path = "/test";
    mocks.entityUuid = "entity-123";
    mocks.addRefetchFunction = vi.fn();
    mocks.addMutationCallback = vi.fn();
    libEntities.value = [];
    libTotalEntityCount.value = 0;
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
  });

  it("adjusts totalEntityCount when entities are removed optimistically", async () => {
    libEntities.value = [makeEntity("a"), makeEntity("b"), makeEntity("c")];
    libTotalEntityCount.value = 10;
    wrapper = getWrapper();
    await flushPromises();

    libEntities.value = [makeEntity("a"), makeEntity("b")];
    await flushPromises();

    expect(libTotalEntityCount.value).toBe(9);
  });

  it("adjusts totalEntityCount when entities are added optimistically", async () => {
    libEntities.value = [makeEntity("a")];
    libTotalEntityCount.value = 5;
    wrapper = getWrapper();
    await flushPromises();

    libEntities.value = [makeEntity("a"), makeEntity("b"), makeEntity("c")];
    await flushPromises();

    expect(libTotalEntityCount.value).toBe(7);
  });

  it("does not double-adjust when server updates both entities and totalEntityCount", async () => {
    libEntities.value = [makeEntity("a"), makeEntity("b")];
    libTotalEntityCount.value = 20;
    wrapper = getWrapper();
    await flushPromises();

    libEntities.value = [makeEntity("c"), makeEntity("d"), makeEntity("e")];
    libTotalEntityCount.value = 30;
    await flushPromises();

    expect(libTotalEntityCount.value).toBe(30);
  });

  it("never sets totalEntityCount below zero", async () => {
    libEntities.value = [makeEntity("a"), makeEntity("b")];
    libTotalEntityCount.value = 1;
    wrapper = getWrapper();
    await flushPromises();

    libEntities.value = [];
    await flushPromises();

    expect(libTotalEntityCount.value).toBe(0);
  });

  it("does not adjust totalEntityCount when entities change due to a page fetch", async () => {
    libEntities.value = [makeEntity("a"), makeEntity("b"), makeEntity("c")];
    libTotalEntityCount.value = 45;
    wrapper = getWrapper();
    await flushPromises();

    libEntitiesLoading.value = true;
    await flushPromises();
    libEntities.value = [makeEntity("d"), makeEntity("e")];
    libTotalEntityCount.value = 45;
    libEntitiesLoading.value = false;
    await flushPromises();

    expect(libTotalEntityCount.value).toBe(45);
  });
});

describe("BaseLibrary.vue route navigation triggers refetch", () => {
  let wrapper: ReturnType<typeof getWrapper> | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    libGetEntities.mockResolvedValue([]);
    mockRoute.path = "/test";
    mocks.entityUuid = "entity-123";
    mocks.addRefetchFunction = vi.fn();
    mocks.addMutationCallback = vi.fn();
    libEntities.value = [];
    libTotalEntityCount.value = 0;
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
  });

  it("calls getEntities again when the route path changes", async () => {
    wrapper = getWrapper();
    await flushPromises();
    const callsAfterMount = libGetEntities.mock.calls.length;

    mockRoute.path = "/other";
    await flushPromises();

    expect(libGetEntities.mock.calls.length).toBeGreaterThan(callsAfterMount);
  });

  it("does not re-fetch when predefinedEntities is provided", async () => {
    const predefined = [{ id: "e1", uuid: "e1", allowedViewModes: { viewModes: [] } }];
    wrapper = getWrapper({ predefinedEntities: predefined });
    await flushPromises();
    const callsAfterMount = libGetEntities.mock.calls.length;

    mockRoute.path = "/other";
    await flushPromises();

    expect(libGetEntities.mock.calls.length).toBe(callsAfterMount);
  });
});

describe("BaseLibrary.vue predefinedEntities initialization", () => {
  const makePredefined = (id: string) => ({
    id,
    uuid: id,
    allowedViewModes: { viewModes: [] },
  });
  let wrapper: ReturnType<typeof getWrapper> | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.path = "/test";
    mocks.entityUuid = "entity-123";
    mocks.addRefetchFunction = vi.fn();
    mocks.addMutationCallback = vi.fn();
    libEntities.value = [];
    libTotalEntityCount.value = 0;
    libEntitiesLoading.value = false;
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
  });

  it("sets isInitialLoading to false when predefinedEntities are provided", async () => {
    wrapper = getWrapper({ predefinedEntities: [makePredefined("e1")] });
    await flushPromises();

    expect((wrapper.vm as any).isInitialLoading).toBe(false);
  });

  it("keeps isInitialLoading false even while entities are loading when predefinedEntities are provided", async () => {
    libEntitiesLoading.value = true;
    wrapper = getWrapper({ predefinedEntities: [makePredefined("e1")] });
    await flushPromises();

    expect((wrapper.vm as any).isInitialLoading).toBe(false);
  });

  it("copies predefinedEntities into entities", async () => {
    const predefined = [makePredefined("e1"), makePredefined("e2")];
    wrapper = getWrapper({ predefinedEntities: predefined });
    await flushPromises();

    expect((wrapper.vm as any).entities).toHaveLength(2);
    expect((wrapper.vm as any).entities.map((e: any) => e.uuid)).toEqual([
      "e1",
      "e2",
    ]);
  });

  it("copies predefinedEntities into a new array rather than reusing the prop reference", async () => {
    const predefined = [makePredefined("e1")];
    wrapper = getWrapper({ predefinedEntities: predefined });
    await flushPromises();

    expect((wrapper.vm as any).entities).not.toBe(predefined);
    expect((wrapper.vm as any).entities).toEqual(predefined);
  });

  it("reflects predefinedEntities in entities when they are provided after mount", async () => {
    wrapper = getWrapper();
    await flushPromises();

    const predefined = [makePredefined("late-1")];
    await wrapper.setProps({ predefinedEntities: predefined });
    await flushPromises();

    expect((wrapper.vm as any).entities.map((e: any) => e.uuid)).toEqual([
      "late-1",
    ]);
    expect((wrapper.vm as any).isInitialLoading).toBe(false);
  });
});

describe("BaseLibrary.vue optimistic entity add does not re-initialize view modes", () => {
  const makePickerEntity = (id: string) => ({
    id,
    uuid: id,
    allowedViewModes: {
      viewModes: [{ viewMode: "ViewModesList" }, { viewMode: "ViewModesTable" }],
    },
  });
  let wrapper: ReturnType<typeof getWrapper> | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.path = "/test";
    mocks.entityUuid = "entity-123";
    mocks.addRefetchFunction = vi.fn();
    mocks.addMutationCallback = vi.fn();
    libEntities.value = [];
    libTotalEntityCount.value = 0;
    libEntitiesLoading.value = false;
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
  });

  it("does not re-initialize view modes when an optimistic entity is added to an empty library", async () => {
    wrapper = getWrapper();
    await flushPromises();
    libDetermineViewModes.mockClear();
    libGetUserPreferredViewModeConfiguration.mockClear();

    libEntities.value = [makePickerEntity("e1")];
    await flushPromises();

    expect(libDetermineViewModes).not.toHaveBeenCalled();
    expect(libGetUserPreferredViewModeConfiguration).not.toHaveBeenCalled();
  });

  it("initializes view modes from server data when entitiesLoading transitions to false", async () => {
    wrapper = getWrapper();
    await flushPromises();
    libDetermineViewModes.mockClear();
    libGetUserPreferredViewModeConfiguration.mockClear();

    libEntitiesLoading.value = true;
    await flushPromises();
    libEntities.value = [makePickerEntity("e1")];
    libEntitiesLoading.value = false;
    await flushPromises();

    expect(libDetermineViewModes).toHaveBeenCalled();
    expect(libGetUserPreferredViewModeConfiguration).toHaveBeenCalled();
  });

  it("does not re-restore view mode preferences on a second fetch of the same entity type (e.g. clicking Apply on filters)", async () => {
    wrapper = getWrapper();
    await flushPromises();

    libEntitiesLoading.value = true;
    await flushPromises();
    libEntities.value = [makePickerEntity("e1")];
    libEntitiesLoading.value = false;
    await flushPromises();

    libGetUserPreferredViewModeConfiguration.mockClear();

    libEntitiesLoading.value = true;
    await flushPromises();
    libEntities.value = [makePickerEntity("e2")];
    libEntitiesLoading.value = false;
    await flushPromises();

    expect(libGetUserPreferredViewModeConfiguration).not.toHaveBeenCalled();
  });
});
