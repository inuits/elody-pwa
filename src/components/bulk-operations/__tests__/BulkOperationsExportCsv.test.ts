import { shallowMount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import BulkOperationsExportCsv from "../BulkOperationsExportCsv.vue";

const mocks = vi.hoisted(() => ({
  closeModal: vi.fn(),
  getParentId: vi.fn(() => "set-123"),
  getBulkOperationType: vi.fn(() => null),
  getEnqueuedItems: vi.fn(() => []),
  getEnqueuedItemCount: vi.fn(() => 0),
  enqueueItem: vi.fn(),
  dequeueAll: vi.fn(),
  triggerBulkSelection: vi.fn(),
  onResult: vi.fn(),
  refetch: vi.fn(),
  mediafilesResult: vi.fn(),
  refetchMediafiles: vi.fn(),
}));

// modal state and relationType are set per-test before mountComponent
let mockModalInfo: any = { open: false };
let mockRelationType = "";

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({
    getModalInfo: () => mockModalInfo,
    closeModal: mocks.closeModal,
    changeCloseConfirmation: vi.fn(),
    closeAllModals: vi.fn(),
    openModal: vi.fn(),
    updateModal: vi.fn(),
  }),
}));

vi.mock("@/composables/useModalActions", () => ({
  useModalActions: () => ({
    getBulkOperationType: mocks.getBulkOperationType,
    getParentId: mocks.getParentId,
    getRelationType: () => mockRelationType,
  }),
}));

vi.mock("@/composables/useBulkOperations", () => ({
  BulkOperationsContextEnum: {
    BulkOperationsCsvExport: "BulkOperationsCsvExport",
    EntityElementMedia: "EntityElementMedia",
    EntityElementListhasAsset: "EntityElementListhasAsset",
  },
  useBulkOperations: () => ({
    getEnqueuedItems: mocks.getEnqueuedItems,
    getEnqueuedItemCount: mocks.getEnqueuedItemCount,
    enqueueItemForBulkProcessing: mocks.enqueueItem,
    dequeueAllItemsForBulkProcessing: mocks.dequeueAll,
    triggerBulkSelectionEvent: mocks.triggerBulkSelection,
  }),
}));

vi.mock("@vue/apollo-composable", () => ({
  useQuery: vi.fn(),
  useQueryLoading: () => ref(false),
}));

vi.mock("@/composables/useBaseNotification", () => ({
  useBaseNotification: () => ({ displayErrorNotification: vi.fn() }),
}));

vi.mock("@/composables/useThumbnailHelper", () => ({
  default: () => ({ getThumbnail: vi.fn() }),
}));

vi.mock("@/composables/useStateManagement", () => ({
  useStateManagement: () => ({ getStateForRoute: vi.fn(() => null) }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({}),
  useRouter: () => ({ push: vi.fn(), currentRoute: { value: {} } }),
}));

vi.mock("@/helpers", () => ({
  downloadCsv: vi.fn(),
  formatTeaserMetadata: vi.fn(),
  getChildrenOfHomeRoutes: vi.fn(() => []),
  getHomeRoute: vi.fn(() => ({ name: "Home", meta: {} })),
}));

vi.mock("@/queryLoader", () => ({
  BulkOperationTypes: {
    ExportCsv: "ExportCsv",
    ExportCsvOfMediafilesFromAsset: "ExportCsvOfMediafilesFromAsset",
  },
  DamsIcons: { DocumentInfo: "DocumentInfo" },
  Entitytyping: { Mediafile: "mediafile", Asset: "asset" },
  TypeModals: { BulkOperations: "BulkOperations" },
  RouteNames: { Mediafiles: "Mediafiles", Assets: "Assets", Home: "Home" },
  GetBulkOperationCsvExportKeysDocument: {},
  FetchMediafilesOfEntityDocument: {},
}));

const mountComponent = () =>
  shallowMount(BulkOperationsExportCsv, {
    global: {
      provide: { config: { bulkSelectAllSizeLimit: 100 } },
      mocks: { $t: (key: string) => key },
    },
  });

const setupUseQueryMock = () => {
  vi.mocked(useQuery)
    .mockReturnValueOnce({ refetch: mocks.refetch, onResult: mocks.onResult } as any)
    .mockReturnValue({ refetch: mocks.refetchMediafiles, onResult: mocks.mediafilesResult } as any);
};

describe("BulkOperationsExportCsv - isRelatedExport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupUseQueryMock();
  });

  it("hides item list panel when isRelatedExport is true", async () => {
    mockModalInfo = { open: false, relatedExportEntityType: "asset" };
    mockRelationType = "hasAsset";

    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find(".basis-\\[56\\%\\]").exists()).toBe(false);
  });

  it("shows item list panel when isRelatedExport is false", async () => {
    mockModalInfo = { open: false };
    mockRelationType = "";

    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find(".basis-\\[56\\%\\]").exists()).toBe(true);
  });

  it("isRelatedExport is false when relatedExportEntityType set but relationType is empty", async () => {
    mockModalInfo = { open: false, relatedExportEntityType: "asset" };
    mockRelationType = "";

    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find(".basis-\\[56\\%\\]").exists()).toBe(true);
  });

  it("submit button is enabled when isRelatedExport even with zero enqueued items", async () => {
    mockModalInfo = { open: false, relatedExportEntityType: "asset" };
    mockRelationType = "hasAsset";
    mocks.getEnqueuedItemCount.mockReturnValue(0);

    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.findComponent({ name: "BulkOperationsSubmitBar" }).props("disabled")).toBe(false);
  });

  it("submit button is disabled when not isRelatedExport and no enqueued items", async () => {
    mockModalInfo = { open: false };
    mockRelationType = "";
    mocks.getEnqueuedItemCount.mockReturnValue(0);

    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.findComponent({ name: "BulkOperationsSubmitBar" }).props("disabled")).toBe(true);
  });

  it("submit button is enabled when not isRelatedExport and items are enqueued", async () => {
    mockModalInfo = { open: false };
    mockRelationType = "";
    mocks.getEnqueuedItemCount.mockReturnValue(3);

    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.findComponent({ name: "BulkOperationsSubmitBar" }).props("disabled")).toBe(false);
  });
});

describe("BulkOperationsExportCsv - exportCsv payload", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    setupUseQueryMock();
    fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("col1,col2\nval1,val2"),
    });
    vi.stubGlobal("fetch", fetchSpy);
  });

  it("sends parentId, relation and empty ids for related export", async () => {
    mockModalInfo = { open: false, relatedExportEntityType: "asset" };
    mockRelationType = "hasAsset";
    mocks.getParentId.mockReturnValue("set-abc");

    const wrapper = mountComponent();
    await flushPromises();

    await wrapper.findComponent({ name: "BulkOperationsSubmitBar" }).vm.$emit("submit");
    await flushPromises();

    expect(fetchSpy).toHaveBeenCalledOnce();
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.parentId).toBe("set-abc");
    expect(body.relation).toBe("hasAsset");
    expect(body.ids).toEqual([]);
  });

  it("sends ids from enqueued items and omits parentId for normal export", async () => {
    mockModalInfo = { open: false };
    mockRelationType = "";
    mocks.getEnqueuedItems.mockReturnValue([{ id: "id-1" }, { id: "id-2" }]);

    const wrapper = mountComponent();
    await flushPromises();

    await wrapper.findComponent({ name: "BulkOperationsSubmitBar" }).vm.$emit("submit");
    await flushPromises();

    expect(fetchSpy).toHaveBeenCalledOnce();
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.ids).toEqual(["id-1", "id-2"]);
    expect(body.parentId).toBeUndefined();
    expect(body.relation).toBeUndefined();
  });
});
