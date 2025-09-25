import { describe, it, expect, beforeEach, vi } from "vitest";

import { useBulkOperationsActionsBar } from "../useBulkOperationsActionsBar";
import type {
  BulkOperationsActionsBarProps,
  BulkOperationsActionsBarEmits,
} from "../useBulkOperationsActionsBar";
import {
  BulkOperationTypes,
  ModalStyle,
  RouteNames,
  Entitytyping,
  BulkNavigationPages,
} from "@/generated-types/queries";

vi.mock("@/main", () => ({
  apolloClient: {
    query: vi.fn(),
  },
}));

vi.mock("@vue/apollo-composable", () => ({
  useQuery: vi.fn(() => ({
    refetch: vi.fn(),
    onResult: vi.fn(),
  })),
}));

vi.mock("@/composables/useBulkOperations", () => ({
  useBulkOperations: () => ({
    getEnqueuedItemCount: vi.fn((context) =>
      context === "test-context" ? 3 : 0,
    ),
    getEnqueuedItems: vi.fn(() => [{ id: "1" }, { id: "2" }, { id: "3" }]),
    dequeueAllItemsForBulkProcessing: vi.fn(),
  }),
}));

const mockModalActions = {
  initializeGeneralProperties: vi.fn(),
  initializePropertiesForDownload: vi.fn(),
  initializePropertiesForCreateEntity: vi.fn(),
  initializePropertiesForBulkDeleteRelations: vi.fn(),
  initializePropertiesForBulkDeleteEntities: vi.fn(),
  setCallbackFunctions: vi.fn(),
  resetAllProperties: vi.fn(),
};

vi.mock("@/composables/useModalActions", () => ({
  useModalActions: () => mockModalActions,
}));

const mockBaseModal = {
  openModal: vi.fn(),
  getModalInfo: vi.fn(() => ({ open: false })),
};

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => mockBaseModal,
}));

vi.mock("@/composables/useImport", () => ({
  useImport: () => ({
    loadDocument: vi.fn(),
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
}));

describe("useBulkOperationsActionsBar", () => {
  const createMockProps = (
    overrides?: Partial<BulkOperationsActionsBarProps>,
  ): BulkOperationsActionsBarProps => ({
    context: "test-context" as any,
    totalItemsCount: 100,
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
    selectedPaginationLimitOption: 20,
    excludePagination: false,
    setSkip: vi.fn(),
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
        selectedSkip,
        itemsSelected,
      } = useBulkOperationsActionsBar(props, emit);

      expect(bulkOperations.value).toEqual([]);
      expect(selectedBulkOperation.value).toBeUndefined();
      expect(bulkOperationsPromiseIsResolved.value).toBe(true);
      expect(selectedSkip.value).toBe(1);
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
        formQuery: "GetWorkCreateForm",
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
        formQuery: "GetWorkCreateForm",
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

    it("should execute complete bulk operation flow", () => {
      const props = createMockProps();
      const emit = createMockEmit();

      const { handleSelectedBulkOperation, selectedBulkOperation } =
        useBulkOperationsActionsBar(props, emit);

      const mockConfig = {
        typeModal: "TestModal" as any,
        formRelationType: "test-relation-type",
        formQuery: "test-query",
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
      );
    });
  });

  describe("Pagination Handling", () => {
    it("should set skip correctly", async () => {
      const mockSetSkip = vi.fn();
      const props = createMockProps({ setSkip: mockSetSkip });
      const emit = createMockEmit();

      const { setSkip } = useBulkOperationsActionsBar(props, emit);

      await setSkip(25);

      expect(mockSetSkip).toHaveBeenCalledWith(25, true);
    });

    it("should handle missing setSkip function gracefully", async () => {
      const props = createMockProps({ setSkip: undefined });
      const emit = createMockEmit();

      const { setSkip } = useBulkOperationsActionsBar(props, emit);

      await expect(setSkip(25)).resolves.toBeUndefined();
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
