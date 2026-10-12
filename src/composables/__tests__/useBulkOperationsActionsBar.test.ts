import { describe, it, expect, beforeEach, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { useBulkOperationsActionsBar } from "../useBulkOperationsActionsBar";
import type {
  BulkOperationsActionsBarProps,
  BulkOperationsActionsBarEmits,
} from "../useBulkOperationsActionsBar";
import {
  ActionContextEntitiesSelectionType,
  BulkOperationTypes,
  ModalStyle,
  RouteNames,
  Entitytyping,
  BulkNavigationPages,
  TypeModals,
} from "@/generated-types/queries";

vi.mock("@/main", () => ({
  apolloClient: {
    query: vi.fn(() => Promise.resolve({})),
  },
  typeUrlMapping: { mapping: {}, reverseMapping: {} },
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string>) =>
      params?.title ? `${key}(${params.title})` : key,
  }),
}));

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({
    getForm: () => ({ values: { intialValues: { title: "Hamlet" } } }),
  }),
}));

const mockRouter = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("@vue/apollo-composable", () => ({
  useQuery: vi.fn(() => ({
    refetch: vi.fn(),
    onResult: vi.fn(),
  })),
}));

const mockBulkOperations = vi.hoisted(() => ({
  getEnqueuedItemCount: vi.fn((context: string) =>
    context === "test-context" ? 3 : 0,
  ),
  getEnqueuedItems: vi.fn(() => [{ id: "1" }, { id: "2" }, { id: "3" }]),
  dequeueAllItemsForBulkProcessing: vi.fn(),
}));

vi.mock("@/composables/useBulkOperations", () => ({
  useBulkOperations: () => mockBulkOperations,
}));

const mockModalActions = {
  initializeGeneralProperties: vi.fn(),
  initializePropertiesForDownload: vi.fn(),
  initializePropertiesForBulkUpdateMetadata: vi.fn(),
  initializePropertiesForCreateEntity: vi.fn(),
  initializePropertiesForBulkDeleteRelations: vi.fn(),
  initializePropertiesForBulkDeleteEntities: vi.fn(),
  setCallbackFunctions: vi.fn(),
  setLibraryEntities: vi.fn(),
  resetAllProperties: vi.fn(),
  extractActionArguments: vi.fn(() => ({
    relations: [{ key: "1", type: "ref_mediafiles", editStatus: "new" }],
    entities: [],
    mediafiles: ["1"],
    includeAssetCsv: true,
  })),
};

vi.mock("@/composables/useModalActions", () => ({
  useModalActions: () => mockModalActions,
}));

const mockSeenItems = vi.hoisted(() => ({
  markManyAsSeen: vi.fn(),
  unmarkManyAsSeen: vi.fn(),
  isItemSeen: vi.fn(() => false),
}));

vi.mock("@/composables/useSeenItems", () => ({
  useSeenItems: () => mockSeenItems,
}));

const mockExportXlsx = vi.hoisted(() => ({
  exportEntitiesToXlsx: vi.fn(),
}));

vi.mock("@/composables/useExportXlsx", () => ({
  useExportXlsx: () => mockExportXlsx,
}));

const mockEntityPageConfig = vi.hoisted(() => ({
  trackSeen: { value: true },
}));

vi.mock("@/composables/useEntityPageConfig", () => ({
  useEntityPageConfig: () => mockEntityPageConfig,
}));

const mockConfirmModal = vi.hoisted(() => ({
  confirm: vi.fn(() => Promise.resolve("confirm")),
}));

vi.mock("@/composables/useConfirmModal", () => ({
  useConfirmModal: () => mockConfirmModal,
}));

const mockNotification = vi.hoisted(() => ({
  displaySuccessNotification: vi.fn(),
  displayWarningNotification: vi.fn(),
  displayErrorNotification: vi.fn(),
}));

vi.mock("@/composables/useBaseNotification", () => ({
  useBaseNotification: () => mockNotification,
}));

const mockBaseModal = vi.hoisted(() => ({
  openModal: vi.fn(),
  getModalInfo: vi.fn(() => ({ open: false })),
  closeAllModals: vi.fn(),
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => mockBaseModal,
}));

vi.mock("@/composables/useImport", () => ({
  useImport: () => ({
    loadDocument: vi.fn((name: string) => Promise.resolve(`document:${name}`)),
  }),
}));

vi.mock("@/composables/useStateManagement", () => ({
  useStateManagement: () => ({
    getStateForRoute: vi.fn(() => ({
      queryVariables: { skip: 10 },
    })),
  }),
}));

vi.mock("@/composables/useEntitySingle", () => ({
  default: () => ({
    getEntityUuid: vi.fn(() => "entity-123"),
  }),
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({
    meta: { type: "test-type", entityType: Entitytyping.Asset },
    params: { id: "route-entity-456" },
    query: {},
  }),
  useRouter: () => mockRouter,
}));

describe("useBulkOperationsActionsBar", () => {
  const createMockProps = (
    overrides?: Partial<BulkOperationsActionsBarProps>,
  ): BulkOperationsActionsBarProps => ({
    context: "test-context" as any,
    useExtendedBulkOperations: true,
    showButton: true,
    confirmSelectionButton: false,
    entityType: Entitytyping.Asset,
    customBulkOperations: undefined,
    refetchEntities: vi.fn(),
    enableSelection: true,
    parentEntityId: undefined,
    relationType: "test-relation",
    skipItemsWithRelationDuringBulkDelete: [],
    excludePagination: false,
    showPagination: true,
    isLoading: false,
    ...overrides,
  });

  const createMockEmit = (): BulkOperationsActionsBarEmits => vi.fn() as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with correct default values", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const {
        bulkOperations,
        selectedBulkOperation,
        bulkOperationsPromiseIsResolved,
        itemsSelected,
      } = useBulkOperationsActionsBar(props, emit);

      expect(bulkOperations.value).toEqual([]);
      expect(selectedBulkOperation.value).toBeUndefined();
      expect(bulkOperationsPromiseIsResolved.value).toBe(true);
      expect(itemsSelected.value).toBe(true);
    });

    it("should set bulkOperationsPromiseIsResolved to false when customBulkOperations is provided", () => {
      const props = createMockProps({
        customBulkOperations: "custom-operations",
      });
      const emit = createMockEmit();

      const { bulkOperationsPromiseIsResolved } = useBulkOperationsActionsBar(
        props,
        emit,
      );

      expect(bulkOperationsPromiseIsResolved.value).toBe(false);
    });
  });

  describe("Computed Properties", () => {
    it("should calculate itemsSelected correctly", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { itemsSelected } = useBulkOperationsActionsBar(props, emit);

      expect(itemsSelected.value).toBe(true);
    });

    it("should calculate itemsSelected as false for different context", () => {
      const props = createMockProps({ context: "different-context" as any });
      const emit = createMockEmit();

      const { itemsSelected } = useBulkOperationsActionsBar(props, emit);

      expect(itemsSelected.value).toBe(false);
    });
  });

  describe("hasBulkOperationsWithItemsSelection", () => {
    it("should be false when no bulk operations are available", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { hasBulkOperationsWithItemsSelection, bulkOperations } =
        useBulkOperationsActionsBar(props, emit);

      bulkOperations.value = [];

      expect(hasBulkOperationsWithItemsSelection.value).toBe(false);
    });

    it("should be false when the only available operation is a create entity operation", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { hasBulkOperationsWithItemsSelection, bulkOperations } =
        useBulkOperationsActionsBar(props, emit);

      bulkOperations.value = [
        { value: BulkOperationTypes.CreateEntity } as any,
      ];

      expect(hasBulkOperationsWithItemsSelection.value).toBe(false);
    });

    it("should be true when a non-create operation with a some-selected context is available", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { hasBulkOperationsWithItemsSelection, bulkOperations } =
        useBulkOperationsActionsBar(props, emit);

      bulkOperations.value = [
        {
          value: BulkOperationTypes.DownloadMediafiles,
          actionContext: {
            entitiesSelectionType:
              ActionContextEntitiesSelectionType.SomeSelected,
          },
        } as any,
      ];

      expect(hasBulkOperationsWithItemsSelection.value).toBe(true);
    });

    it("should be true when a create operation is combined with a selectable operation", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { hasBulkOperationsWithItemsSelection, bulkOperations } =
        useBulkOperationsActionsBar(props, emit);

      bulkOperations.value = [
        { value: BulkOperationTypes.CreateEntity } as any,
        {
          value: BulkOperationTypes.DownloadMediafiles,
          actionContext: {
            entitiesSelectionType:
              ActionContextEntitiesSelectionType.SomeSelected,
          },
        } as any,
      ];

      expect(hasBulkOperationsWithItemsSelection.value).toBe(true);
    });
  });

  describe("Helper Functions", () => {
    it("should get current entity ID from useEntitySingle", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { getCurrentEntityId } = useBulkOperationsActionsBar(props, emit);

      expect(getCurrentEntityId()).toBe("entity-123");
    });

    it("should determine modal style correctly", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { determineModalStyle } = useBulkOperationsActionsBar(props, emit);

      expect(determineModalStyle(BulkOperationTypes.DeleteEntities)).toBe(
        ModalStyle.Center,
      );
      expect(determineModalStyle(BulkOperationTypes.DownloadMediafiles)).toBe(
        ModalStyle.CenterWide,
      );
    });

    it("should get modal context for operation correctly", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { getModalContextForOperation } = useBulkOperationsActionsBar(
        props,
        emit,
      );

      expect(
        getModalContextForOperation(
          BulkOperationTypes.ExportCsvOfMediafilesFromAsset,
        ),
      ).toBe(RouteNames.Mediafiles || "Mediafiles");
      expect(
        getModalContextForOperation(BulkOperationTypes.DownloadMediafiles),
      ).toBe(props.context);
    });

    it("should get refetch callbacks correctly", () => {
      const mockRefetchEntities = vi.fn();
      const props = createMockProps({ refetchEntities: mockRefetchEntities });
      const emit = createMockEmit();

      const { getRefetchCallbacks } = useBulkOperationsActionsBar(props, emit);

      const callbacks = getRefetchCallbacks();
      expect(callbacks).toContain(mockRefetchEntities);
      expect(callbacks.length).toBeGreaterThan(0);
    });
  });

  describe("Operation Initialization", () => {
    it("should execute download operation initialization", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { executeOperationSpecificInitialization } =
        useBulkOperationsActionsBar(props, emit);

      const mockConfig = { typeModal: "test" as any };
      executeOperationSpecificInitialization(
        BulkOperationTypes.DownloadMediafiles,
        mockConfig,
      );

      expect(
        mockModalActions.initializePropertiesForDownload,
      ).toHaveBeenCalled();
    });

    it("should execute bulk update metadata operation initialization with the enqueued ids", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { executeOperationSpecificInitialization } =
        useBulkOperationsActionsBar(props, emit);

      const mockConfig = { typeModal: "DynamicForm" as any };
      executeOperationSpecificInitialization(
        BulkOperationTypes.BulkUpdateMetadata,
        mockConfig,
      );

      expect(
        mockModalActions.initializePropertiesForBulkUpdateMetadata,
      ).toHaveBeenCalledWith([{ id: "1" }, { id: "2" }, { id: "3" }]);
      expect(mockModalActions.setCallbackFunctions).toHaveBeenCalled();
    });

    it("should execute add relation operation initialization", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { executeOperationSpecificInitialization } =
        useBulkOperationsActionsBar(props, emit);

      const mockConfig = {
        typeModal: "test" as any,
        enableImageCrop: true,
        keyToSaveCropCoordinates: "test-key",
      };

      executeOperationSpecificInitialization(
        BulkOperationTypes.AddRelation,
        mockConfig,
      );

      expect(emit).toHaveBeenCalledWith(
        "initializeEntityPickerComponent",
        true,
        "test-key",
        undefined,
        undefined,
      );
    });

    it("should pass custom picker query overrides for add relation operation", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { executeOperationSpecificInitialization } =
        useBulkOperationsActionsBar(props, emit);

      const mockConfig = {
        typeModal: "test" as any,
        enableImageCrop: false,
        keyToSaveCropCoordinates: "",
        customQueryEntityPickerList: "GetGroeirubriekZizosInWork",
        customQueryEntityPickerListFilters: "GetGroeirubriekZizoFilters",
      };

      executeOperationSpecificInitialization(
        BulkOperationTypes.AddRelation,
        mockConfig,
      );

      expect(emit).toHaveBeenCalledWith(
        "initializeEntityPickerComponent",
        false,
        "",
        "GetGroeirubriekZizosInWork",
        "GetGroeirubriekZizoFilters",
      );
    });

    it("should set callbacks to undefined when pageToNavigateToAfterCreation (detail page) is true for AddRelation", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { executeOperationSpecificInitialization } =
        useBulkOperationsActionsBar(props, emit);

      const mockConfig = {
        typeModal: "DynamicForm" as any,
        pageToNavigateToAfterCreation: BulkNavigationPages.DetailPage,
      };

      executeOperationSpecificInitialization(
        BulkOperationTypes.AddRelation,
        mockConfig,
      );

      expect(mockModalActions.setCallbackFunctions).toHaveBeenCalledWith(
        undefined,
      );
    });

    it("should not set callbacks when pageToNavigateToAfterCreation is null for AddRelation", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { executeOperationSpecificInitialization } =
        useBulkOperationsActionsBar(props, emit);

      const mockConfig = {
        typeModal: "DynamicForm" as any,
        pageToNavigateToAfterCreation: null,
      };

      executeOperationSpecificInitialization(
        BulkOperationTypes.AddRelation,
        mockConfig,
      );

      expect(mockModalActions.setCallbackFunctions).not.toHaveBeenCalled();
    });

    it("should execute create entity operation initialization", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { executeOperationSpecificInitialization } =
        useBulkOperationsActionsBar(props, emit);

      const mockConfig = { typeModal: "test" as any };
      executeOperationSpecificInitialization(
        BulkOperationTypes.CreateEntity,
        mockConfig,
      );

      expect(
        mockModalActions.initializePropertiesForCreateEntity,
      ).toHaveBeenCalled();
    });

    it("should set callbacks to undefined when pageToNavigateToAfterCreation (detail page) for CreateEntity", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { executeOperationSpecificInitialization } =
        useBulkOperationsActionsBar(props, emit);

      const mockConfig = {
        typeModal: "DynamicForm" as any,
        formQueries: ["GetWorkCreateForm"],
        formRelationType: "isWorkFor",
        askForCloseConfirmation: true,
        pageToNavigateToAfterCreation: BulkNavigationPages.DetailPage,
      };

      executeOperationSpecificInitialization(
        BulkOperationTypes.CreateEntity,
        mockConfig,
      );

      expect(
        mockModalActions.initializePropertiesForCreateEntity,
      ).toHaveBeenCalled();
      expect(mockModalActions.setCallbackFunctions).toHaveBeenCalledWith(
        undefined,
      );
    });

    it("should not set callbacks when pageToNavigateToAfterCreation is null for CreateEntity", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { executeOperationSpecificInitialization } =
        useBulkOperationsActionsBar(props, emit);

      const mockConfig = {
        typeModal: "DynamicForm" as any,
        formQueries: ["GetWorkCreateForm"],
        formRelationType: "isWorkFor",
        askForCloseConfirmation: true,
        pageToNavigateToAfterCreation: null,
      };

      executeOperationSpecificInitialization(
        BulkOperationTypes.CreateEntity,
        mockConfig,
      );

      expect(
        mockModalActions.initializePropertiesForCreateEntity,
      ).toHaveBeenCalled();
      expect(mockModalActions.setCallbackFunctions).not.toHaveBeenCalled();
    });

    it("should execute reorder entities operation initialization", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { executeOperationSpecificInitialization } =
        useBulkOperationsActionsBar(props, emit);

      const mockConfig = { typeModal: "test" as any };
      executeOperationSpecificInitialization(
        BulkOperationTypes.ReorderEntities,
        mockConfig,
      );

      expect(mockModalActions.setCallbackFunctions).toHaveBeenCalled();
    });

    it("should execute delete entities operation initialization", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { executeOperationSpecificInitialization } =
        useBulkOperationsActionsBar(props, emit);

      const mockConfig = {
        typeModal: "test" as any,
        skipItemsWithRelationDuringBulkDelete: ["item1", "item2"],
      };

      executeOperationSpecificInitialization(
        BulkOperationTypes.DeleteEntities,
        mockConfig,
      );

      expect(
        mockModalActions.initializePropertiesForBulkDeleteEntities,
      ).toHaveBeenCalledWith(["item1", "item2"]);
      expect(mockModalActions.setCallbackFunctions).toHaveBeenCalled();
    });

    it("should execute delete relations operation initialization", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { executeOperationSpecificInitialization } =
        useBulkOperationsActionsBar(props, emit);

      const mockConfig = { typeModal: "test" as any };
      executeOperationSpecificInitialization(
        BulkOperationTypes.DeleteRelations,
        mockConfig,
      );

      expect(
        mockModalActions.initializePropertiesForBulkDeleteRelations,
      ).toHaveBeenCalledWith("test-relation");
    });

    it("should handle unknown operation types gracefully", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { executeOperationSpecificInitialization } =
        useBulkOperationsActionsBar(props, emit);

      const mockConfig = { typeModal: "test" as any };

      expect(() => {
        executeOperationSpecificInitialization("UnknownOperation", mockConfig);
      }).not.toThrow();
    });
  });

  describe("Main Bulk Operation Handler", () => {
    it("should return early when no bulk operation is selected", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { handleSelectedBulkOperation, selectedBulkOperation } =
        useBulkOperationsActionsBar(props, emit);

      selectedBulkOperation.value = undefined;
      handleSelectedBulkOperation();

      expect(
        mockModalActions.initializeGeneralProperties,
      ).not.toHaveBeenCalled();
    });

    it("should return early when bulk operation modal config is missing", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { handleSelectedBulkOperation, selectedBulkOperation } =
        useBulkOperationsActionsBar(props, emit);

      selectedBulkOperation.value = {
        value: BulkOperationTypes.DownloadMediafiles,
        bulkOperationModal: undefined,
      } as any;

      handleSelectedBulkOperation();

      expect(
        mockModalActions.initializeGeneralProperties,
      ).not.toHaveBeenCalled();
    });

    it("creates the download without a modal for downloadMediafilesDirectly", async () => {
      const { apolloClient } = await import("@/main");
      vi.mocked(apolloClient.query).mockResolvedValueOnce({
        data: {
          DownloadItemsInZip: {
            __typename: "Download",
            id: "DL-1",
            uuid: "DL-1",
            type: "download",
          },
        },
      } as any);
      const props = createMockProps({ parentEntityId: "production-1" });
      const { handleSelectedBulkOperation, selectedBulkOperation } =
        useBulkOperationsActionsBar(props, createMockEmit());

      selectedBulkOperation.value = {
        value: BulkOperationTypes.DownloadMediafilesDirectly,
        bulkOperationModal: {
          typeModal: "DynamicForm",
          formRelationType: "ref_mediafiles",
        },
      } as any;

      handleSelectedBulkOperation();
      await flushPromises();

      expect(mockBaseModal.openModal).not.toHaveBeenCalled();
      expect(
        mockModalActions.initializePropertiesForDownload,
      ).toHaveBeenCalled();
      expect(apolloClient.query).toHaveBeenCalledWith({
        query: "document:GetDownloadItemsInZip",
        variables: {
          entities: [],
          mediafiles: ["1"],
          includeAssetCsv: true,
          basicCsv: false,
          downloadEntity: {
            type: "download",
            metadata: [
              {
                key: "title",
                value: "bulk-operations.download-title(Hamlet)",
              },
              { key: "status", value: "Queued" },
            ],
            relations: [{ key: "1", type: "ref_mediafiles", editStatus: "new" }],
          },
        },
      });
      expect(
        mockBulkOperations.dequeueAllItemsForBulkProcessing,
      ).toHaveBeenCalledWith(props.context);
      expect(mockNotification.displaySuccessNotification).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith({
        name: RouteNames.SingleEntity,
        params: { id: "DL-1", type: "download" },
      });
      expect(selectedBulkOperation.value).toBeUndefined();
    });

    it("should execute complete bulk operation flow", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { handleSelectedBulkOperation, selectedBulkOperation } =
        useBulkOperationsActionsBar(props, emit);

      const mockConfig = {
        typeModal: "TestModal" as any,
        formRelationType: "test-relation-type",
        formQueries: ["test-query"],
        askForCloseConfirmation: true,
      };

      selectedBulkOperation.value = {
        value: BulkOperationTypes.DownloadMediafiles,
        bulkOperationModal: mockConfig,
      } as any;

      handleSelectedBulkOperation();

      expect(mockModalActions.initializeGeneralProperties).toHaveBeenCalledWith(
        "entity-123",
        "test-relation-type",
        "test-type",
        expect.any(Array),
        BulkOperationTypes.DownloadMediafiles,
      );

      expect(mockBaseModal.openModal).toHaveBeenCalledWith(
        "TestModal",
        ModalStyle.CenterWide,
        "test-query",
        undefined,
        true,
        props.context,
        { parentEntity: undefined, formQueries: ["test-query"] },
      );
    });
  });

  describe("Bulk mutation fallback", () => {
    const selectUnmappedOperation = (typeModal: TypeModals) => {
      const { handleSelectedBulkOperation, selectedBulkOperation } =
        useBulkOperationsActionsBar(createMockProps(), createMockEmit());
      selectedBulkOperation.value = {
        value: "startOcr",
        bulkOperationModal: { typeModal, formQueries: ["SomeQuery"] },
      } as any;
      handleSelectedBulkOperation();
    };

    it("does not ask for confirmation when the operation opens a form", () => {
      selectUnmappedOperation(TypeModals.DynamicForm);

      expect(mockConfirmModal.confirm).not.toHaveBeenCalled();
    });

    it("asks for confirmation when the operation is a Confirm modal", () => {
      mockConfirmModal.confirm.mockImplementationOnce(() =>
        Promise.resolve("cancel"),
      );
      selectUnmappedOperation(TypeModals.Confirm);

      expect(mockConfirmModal.confirm).toHaveBeenCalled();
    });
  });

  describe("Mark as seen operations", () => {
    beforeEach(() => {
      mockEntityPageConfig.trackSeen.value = true;
      mockConfirmModal.confirm.mockImplementation(() =>
        Promise.resolve("confirm"),
      );
    });

    const selectOperation = (
      operationType: BulkOperationTypes,
      props = createMockProps(),
    ) => {
      const emit = createMockEmit();
      const composable = useBulkOperationsActionsBar(props, emit);
      composable.selectedBulkOperation.value = {
        value: operationType,
      } as any;
      composable.handleSelectedBulkOperation();
      return composable;
    };

    it("marks all enqueued items as seen once the action is confirmed", async () => {
      selectOperation(BulkOperationTypes.MarkAsSeen);
      await flushPromises();

      expect(mockConfirmModal.confirm).toHaveBeenCalled();
      expect(mockSeenItems.markManyAsSeen).toHaveBeenCalledWith([
        "1",
        "2",
        "3",
      ]);
      expect(mockSeenItems.unmarkManyAsSeen).not.toHaveBeenCalled();
    });

    it("unmarks all enqueued items when the unseen operation is confirmed", async () => {
      selectOperation(BulkOperationTypes.MarkAsUnseen);
      await flushPromises();

      expect(mockSeenItems.unmarkManyAsSeen).toHaveBeenCalledWith([
        "1",
        "2",
        "3",
      ]);
      expect(mockSeenItems.markManyAsSeen).not.toHaveBeenCalled();
    });

    it("clears the selection and notifies after marking", async () => {
      const props = createMockProps();
      selectOperation(BulkOperationTypes.MarkAsSeen, props);
      await flushPromises();

      expect(
        mockBulkOperations.dequeueAllItemsForBulkProcessing,
      ).toHaveBeenCalledWith(props.context);
      expect(mockNotification.displaySuccessNotification).toHaveBeenCalled();
    });

    it("does not mark anything when the confirmation is cancelled", async () => {
      mockConfirmModal.confirm.mockImplementation(() =>
        Promise.resolve("cancel"),
      );

      selectOperation(BulkOperationTypes.MarkAsSeen);
      await flushPromises();

      expect(mockSeenItems.markManyAsSeen).not.toHaveBeenCalled();
      expect(
        mockBulkOperations.dequeueAllItemsForBulkProcessing,
      ).not.toHaveBeenCalled();
      expect(
        mockNotification.displaySuccessNotification,
      ).not.toHaveBeenCalled();
    });

    it("opens no modal for a seen operation", async () => {
      selectOperation(BulkOperationTypes.MarkAsSeen);
      await flushPromises();

      expect(mockBaseModal.openModal).not.toHaveBeenCalled();
      expect(
        mockModalActions.initializeGeneralProperties,
      ).not.toHaveBeenCalled();
    });

    it("does nothing when no items are enqueued", async () => {
      mockBulkOperations.getEnqueuedItems.mockReturnValueOnce([]);

      selectOperation(BulkOperationTypes.MarkAsSeen);
      await flushPromises();

      expect(mockConfirmModal.confirm).not.toHaveBeenCalled();
      expect(mockSeenItems.markManyAsSeen).not.toHaveBeenCalled();
    });

    it("clears the selected operation so it can be picked again", async () => {
      const composable = selectOperation(BulkOperationTypes.MarkAsSeen);
      await flushPromises();

      expect(composable.selectedBulkOperation.value).toBeUndefined();
    });

    it("keeps the seen operations available when trackSeen is enabled", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { bulkOperations } = useBulkOperationsActionsBar(props, emit);
      bulkOperations.value = [
        { value: BulkOperationTypes.MarkAsSeen } as any,
        { value: BulkOperationTypes.MarkAsUnseen } as any,
        { value: BulkOperationTypes.DownloadMediafiles } as any,
      ];

      expect(bulkOperations.value.map((operation) => operation.value)).toEqual([
        BulkOperationTypes.MarkAsSeen,
        BulkOperationTypes.MarkAsUnseen,
        BulkOperationTypes.DownloadMediafiles,
      ]);
    });

    it("filters the seen operations out when trackSeen is disabled", () => {
      mockEntityPageConfig.trackSeen.value = false;
      const props = createMockProps();
      const emit = createMockEmit();

      const { bulkOperations } = useBulkOperationsActionsBar(props, emit);
      bulkOperations.value = [
        { value: BulkOperationTypes.MarkAsSeen } as any,
        { value: BulkOperationTypes.MarkAsUnseen } as any,
        { value: BulkOperationTypes.DownloadMediafiles } as any,
      ];

      expect(bulkOperations.value.map((operation) => operation.value)).toEqual([
        BulkOperationTypes.DownloadMediafiles,
      ]);
    });
  });

  describe("Export xlsx operation", () => {
    const selectOperation = (props = createMockProps()) => {
      const emit = createMockEmit();
      const composable = useBulkOperationsActionsBar(props, emit);
      composable.selectedBulkOperation.value = {
        value: BulkOperationTypes.ExportXlsx,
      } as any;
      composable.handleSelectedBulkOperation();
      return composable;
    };

    it("delegates to useExportXlsx with the current entity type", () => {
      selectOperation();

      expect(mockExportXlsx.exportEntitiesToXlsx).toHaveBeenCalledWith(
        Entitytyping.Asset,
      );
    });

    it("opens no modal for an export xlsx operation", () => {
      selectOperation();

      expect(mockBaseModal.openModal).not.toHaveBeenCalled();
      expect(
        mockModalActions.initializeGeneralProperties,
      ).not.toHaveBeenCalled();
    });
  });

  describe("Exposed Functions", () => {
    it("should expose all necessary functions from useBulkOperations", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const {
        getEnqueuedItemCount,
        getEnqueuedItems,
        dequeueAllItemsForBulkProcessing,
      } = useBulkOperationsActionsBar(props, emit);

      expect(getEnqueuedItemCount(props.context)).toBe(3);
      expect(getEnqueuedItems(props.context)).toEqual([
        { id: "1" },
        { id: "2" },
        { id: "3" },
      ]);
      expect(dequeueAllItemsForBulkProcessing).toBeDefined();
    });

    it("should expose all helper functions for testing", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const {
        executeOperationSpecificInitialization,
        determineModalStyle,
        getModalContextForOperation,
        getCurrentEntityId,
        getRefetchCallbacks,
      } = useBulkOperationsActionsBar(props, emit);

      expect(executeOperationSpecificInitialization).toBeDefined();
      expect(determineModalStyle).toBeDefined();
      expect(getModalContextForOperation).toBeDefined();
      expect(getCurrentEntityId).toBeDefined();
      expect(getRefetchCallbacks).toBeDefined();
    });
  });

  describe("Type Safety", () => {
    it("should handle null/undefined values in skipItemsWithRelationDuringBulkDelete", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { executeOperationSpecificInitialization } =
        useBulkOperationsActionsBar(props, emit);

      const mockConfig = {
        typeModal: "test" as any,
        skipItemsWithRelationDuringBulkDelete: [null, "item1", null, "item2"],
      } as any;

      executeOperationSpecificInitialization(
        BulkOperationTypes.DeleteEntities,
        mockConfig,
      );

      expect(
        mockModalActions.initializePropertiesForBulkDeleteEntities,
      ).toHaveBeenCalledWith(["item1", "item2"]);
    });
  });
});
