import { computed, inject, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import type { Entitytyping } from "@/generated-types/queries";
import {
  ActionContextEntitiesSelectionType,
  type BaseEntity,
  BulkOperationTypes,
  type DropdownOption,
  ModalStyle,
  RouteNames,
  TypeModals,
  BulkNavigationPages,
  type BulkOperationModal,
  ActionContextViewModeTypes,
  PanelType,
} from "@/generated-types/queries";
import {
  type Context,
  type InBulkProcessableItem,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { useModalActions } from "@/composables/useModalActions";
import { useBaseModal } from "@/composables/useBaseModal";
import { useImport } from "@/composables/useImport";
import { useStateManagement } from "@/composables/useStateManagement";
import useEntitySingle from "@/composables/useEntitySingle";
import { apolloClient } from "@/main";
import { getValueForPanelMetadata } from "@/helpers";
import { useEditMode } from "@/composables/useEdit";

export interface BulkOperationsActionsBarProps {
  context: Context;
  totalItemsCount: number;
  useExtendedBulkOperations: boolean;
  showButton?: boolean;
  confirmSelectionButton?: boolean;
  entityType: Entitytyping;
  customBulkOperations?: string | undefined;
  refetchEntities: () => any;
  enableSelection?: boolean;
  parentEntityId?: string | undefined;
  relationType: string;
  skipItemsWithRelationDuringBulkDelete?: string[];
  selectedPaginationLimitOption: number;
  excludePagination: boolean;
  setSkip?: (skip: number, forceFetch?: boolean) => void;
  showPagination?: boolean;
  isLoading?: boolean;
}

export interface BulkOperationsActionsBarEmits {
  (event: "selectPage"): void;
  (event: "selectAll"): void;
  (event: "confirmSelection", selectedItems: InBulkProcessableItem[]): void;
  (
    event: "setBulkOperationsAvailable",
    isBulkOperationsAvailable: boolean,
  ): void;
  (event: "refetch"): void;
  (
    event: "customBulkOperationsPromise",
    bulkOperationsPromise: () => Promise<void>,
  ): void;
  (event: "applyCustomBulkOperations"): void;
  (
    event: "initializeEntityPickerComponent",
    enableCropMode: boolean,
    keyToSaveCropCoordinates: string,
  ): void;
}

export const useBulkOperationsActionsBar = (
  props: BulkOperationsActionsBarProps,
  emit: BulkOperationsActionsBarEmits,
  parentEntity: BaseEntity,
) => {
  const refetchParentEntity: any = inject("RefetchParentEntity");
  const route = useRoute();
  const { getStateForRoute } = useStateManagement();
  const { loadDocument } = useImport();

  const {
    getEnqueuedItemCount,
    getEnqueuedItems,
    dequeueAllItemsForBulkProcessing,
  } = useBulkOperations();

  const {
    initializeGeneralProperties,
    initializePropertiesForDownload,
    initializePropertiesForCreateEntity,
    initializePropertiesForBulkDeleteRelations,
    initializePropertiesForBulkDeleteEntities,
    setCallbackFunctions,
    setParentIntialValuesMap,
    resetAllProperties,
  } = useModalActions();

  const { openModal, getModalInfo, closeAllModals } = useBaseModal();

  const subDropdownOptions = ref<DropdownOption[]>([]);
  const refetchEnabled = ref<boolean>(false);
  const bulkOperations = ref<DropdownOption[]>([]);
  const selectedBulkOperation = ref<DropdownOption>();
  const bulkOperationsPromiseIsResolved = ref<boolean>(
    !props.customBulkOperations,
  );
  const selectedSkip = ref<number>(1);

  const entityType = computed(() => props.entityType || route.meta.entityType);

  const hasBulkOperationsWithItemsSelection = computed<boolean>(() => {
    const operationsWithContext = bulkOperations.value?.filter(
      (item: DropdownOption) => {
        if (!item.actionContext) return true;
        return (
          item.actionContext?.entitiesSelectionType ===
          ActionContextEntitiesSelectionType.SomeSelected
        );
      },
    );
    return (bulkOperations.value && operationsWithContext?.length > 0) || false;
  });

  const itemsSelected = computed<boolean>(
    () => getEnqueuedItemCount(props.context) > 0,
  );

  const fetchBulkOperations = async (): Promise<void> => {
    try {
      const variables = {
        entityType: entityType.value,
      };
      const result = await apolloClient.query({
        query: await determineBulkOperationsQuery(),
        variables,
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      });

      if (!result.data || !("BulkOperations" in result.data)) return;
      bulkOperations.value =
        result.data?.BulkOperations?.bulkOperationOptions?.options || [];
    } catch {
      emit("setBulkOperationsAvailable", false);
    }
  };

  const getRefetchCallbacks = () => {
    return [refetchParentEntity, props.refetchEntities].filter(Boolean);
  };

  const getCurrentEntityId = (): string => {
    const entityId = useEntitySingle().getEntityUuid() || route.params.id;
    return Array.isArray(entityId) ? entityId[0] : entityId;
  };

  const getModalContextForOperation = (operationType: string) => {
    return operationType === BulkOperationTypes.ExportCsvOfMediafilesFromAsset
      ? RouteNames?.Mediafiles
      : props.context;
  };

  const determineModalStyle = (operationType: string) => {
    return operationType === BulkOperationTypes.DeleteEntities
      ? ModalStyle.Center
      : ModalStyle.CenterWide;
  };

  const initializeDownloadOperation = () => {
    initializePropertiesForDownload(
      getEnqueuedItems(props.context),
      props.context,
    );
  };

  const initializeAddRelationOperation = (
    bulkOperationModalConfig: BulkOperationModal,
  ) => {
    emit(
      "initializeEntityPickerComponent",
      bulkOperationModalConfig.enableImageCrop || false,
      bulkOperationModalConfig.keyToSaveCropCoordinates || "",
    );
    if (
      bulkOperationModalConfig.pageToNavigateToAfterCreation ===
      BulkNavigationPages.DetailPage
    ) {
      setCallbackFunctions(undefined);
    }

    if (bulkOperationModalConfig.copyIntialValues) {
      const intialValuesMap = new Map<string, string>();
      for (const intialValue of bulkOperationModalConfig.copyIntialValues) {
        if (parentEntity?.value && parentEntity.value.intialValues[intialValue])
          intialValuesMap.set(
            intialValue,
            parentEntity.value.intialValues[intialValue],
          );
      }
      setParentIntialValuesMap(intialValuesMap);
    }
  };

  const initializeCreateEntityOperation = (
    bulkOperationModalConfig: BulkOperationModal,
  ) => {
    initializePropertiesForCreateEntity();
    if (
      bulkOperationModalConfig.pageToNavigateToAfterCreation ===
      BulkNavigationPages.DetailPage
    ) {
      setCallbackFunctions(undefined);
    }

    if (bulkOperationModalConfig.copyIntialValues) {

    }

  };

  const initializeReorderEntitiesOperation = () => {
    setCallbackFunctions(getRefetchCallbacks());
  };

  const initializeDeleteEntitiesOperation = (
    bulkOperationModalConfig: BulkOperationModal,
  ) => {
    const skipItems =
      bulkOperationModalConfig?.skipItemsWithRelationDuringBulkDelete?.filter(
        (item): item is string => item != null,
      ) || [];
    initializePropertiesForBulkDeleteEntities(skipItems);
    setCallbackFunctions(getRefetchCallbacks());
  };

  const initializeDeleteRelationsOperation = () => {
    initializePropertiesForBulkDeleteRelations(props.relationType);
  };

  const executeOperationSpecificInitialization = (
    operationType: string,
    bulkOperationModalConfig: BulkOperationModal,
  ) => {
    const operationInitializers: Record<string, () => void> = {
      [BulkOperationTypes.DownloadMediafiles]: initializeDownloadOperation,
      [BulkOperationTypes.AddRelation]: () =>
        initializeAddRelationOperation(bulkOperationModalConfig),
      [BulkOperationTypes.CreateEntity]: () =>
        initializeCreateEntityOperation(bulkOperationModalConfig),
      [BulkOperationTypes.ReorderEntities]: initializeReorderEntitiesOperation,
      [BulkOperationTypes.DeleteEntities]: () =>
        initializeDeleteEntitiesOperation(bulkOperationModalConfig),
      [BulkOperationTypes.DeleteRelations]: initializeDeleteRelationsOperation,
    };

    const initializerFunction = operationInitializers[operationType];
    if (initializerFunction) {
      initializerFunction();
    }
  };

  const customBulkOperationsPromise = async () => {
    if (!props.customBulkOperations) {
      throw new Error("Custom bulk operations document is not provided");
    }

    const query = await loadDocument(props.customBulkOperations);
    return apolloClient
      .query({
        query: query,
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      })
      .then((result) => {
        const bulkOperationsResult =
          result.data?.CustomBulkOperations.bulkOperationOptions;
        bulkOperations.value = bulkOperationsResult?.options || [];
        bulkOperationsPromiseIsResolved.value = true;
      });
  };

  const setSelectedSkipFromState = ({
    updateSkipGlobally = true,
  }: { updateSkipGlobally?: boolean } = {}) => {
    const state = getStateForRoute(route, true);
    const skip = state?.queryVariables?.skip || 1;
    selectedSkip.value = skip;
    if (updateSkipGlobally && props.setSkip) {
      props.setSkip(skip);
    }
  };

  const setSkip = async (newSkip: number) => {
    if (props.setSkip) {
      await props.setSkip(newSkip, true);
    }
  };

  const clearSubDropdownOptions = () => {
    subDropdownOptions.value = [];
  };

  const handleSelectedBulkOperation = () => {
    if (!selectedBulkOperation.value) {
      return;
    }

    const bulkOperationModalConfig =
      selectedBulkOperation.value.bulkOperationModal;
    const operationType = selectedBulkOperation.value.value;

    if (operationType === BulkOperationTypes.OpenDropdown) {
      subDropdownOptions.value = selectedBulkOperation.value?.subOptions.map(
        (dropdownOption) => {
          dropdownOption.active = determineActiveState(
            dropdownOption,
            props.parentEntityId,
            itemsSelected.value,
          );
          return dropdownOption;
        },
      );
    }

    if (!bulkOperationModalConfig || !operationType) {
      return;
    }

    closeAllModals();

    initializeGeneralProperties(
      getCurrentEntityId(),
      bulkOperationModalConfig.formRelationType || "",
      route.meta.type as any,
      getRefetchCallbacks(),
      operationType,
    );

    executeOperationSpecificInitialization(
      operationType,
      bulkOperationModalConfig,
    );

    openModal(
      bulkOperationModalConfig.typeModal,
      determineModalStyle(operationType),
      bulkOperationModalConfig.formQuery || undefined,
      undefined,
      bulkOperationModalConfig.askForCloseConfirmation || undefined,
      getModalContextForOperation(operationType),
    );
  };

  const determineBulkOperationsQuery = async (): Promise<string> => {
    try {
      const query = route!.meta!.queries!.getBulkOperations;
      return await loadDocument(query);
    } catch (error) {
      return await loadDocument("GetBulkOperations");
    }
  };

  watch(
    () =>
      getModalInfo(TypeModals.DynamicForm).open ||
      getModalInfo(TypeModals.BulkOperations).open,
    (isBulkOperationModalOpen: boolean | undefined) => {
      if (!isBulkOperationModalOpen) {
        selectedBulkOperation.value = undefined;
      }
    },
  );

  watch(
    () => entityType.value,
    async () => {
      await fetchBulkOperations();
    },
  );

  watch(
    () =>
      [
        getModalInfo(TypeModals.DynamicForm).open,
        getModalInfo(TypeModals.BulkOperations).open,
        getModalInfo(TypeModals.BulkOperationsDeleteEntities).open,
      ].some((isOpen) => isOpen),
    (isAnyModalOpen) => {
      if (!isAnyModalOpen) {
        resetAllProperties();
      }
    },
  );

  watch(
    () => props.customBulkOperations,
    () => {
      if (
        !props.customBulkOperations ||
        bulkOperationsPromiseIsResolved.value
      ) {
        return;
      }
      emit("customBulkOperationsPromise", customBulkOperationsPromise);
      emit("applyCustomBulkOperations");
    },
    { immediate: true },
  );

  watch(
    () => hasBulkOperationsWithItemsSelection.value,
    (hasBulkOperations: boolean) => {
      if (props.confirmSelectionButton) return;
      emit("setBulkOperationsAvailable", hasBulkOperations);
    },
    { immediate: true },
  );

  watch(
    () => props.isLoading,
    (currentState: boolean | undefined) => {
      if (currentState) return;
      setSelectedSkipFromState({ updateSkipGlobally: false });
    },
  );

  onMounted(async () => {
    if (!props.excludePagination && props.showPagination) {
      setSelectedSkipFromState();
    }
    if (entityType.value && !props.customBulkOperations) {
      refetchEnabled.value = true;
    }

    if (refetchEnabled.value) await fetchBulkOperations();
  });

  return {
    bulkOperations,
    selectedBulkOperation,
    bulkOperationsPromiseIsResolved,
    selectedSkip,
    entityType,
    hasBulkOperationsWithItemsSelection,
    itemsSelected,
    subDropdownOptions,
    clearSubDropdownOptions,
    handleSelectedBulkOperation,
    setSkip,
    getEnqueuedItemCount,
    getEnqueuedItems,
    dequeueAllItemsForBulkProcessing,
    executeOperationSpecificInitialization,
    determineModalStyle,
    getModalContextForOperation,
    getCurrentEntityId,
    getRefetchCallbacks,
  };
};

export type UseBulkOperationsActionsBar = ReturnType<
  typeof useBulkOperationsActionsBar
>;

export const determineActiveState = (item: DropdownOption, parentEntityId: string | undefined, itemsSelected: boolean) => {
  const useEditHelper = useEditMode(parentEntityId);

  if (!item.actionContext) return true;

  let metadataConditionAccepts = true;
  if (item.actionContext.matchMetadataValue) {
    item.actionContext.matchMetadataValue.forEach((condition) => {
      const result = getValueForPanelMetadata(
        PanelType.Metadata,
        condition.matchKey,
        parentEntityId,
        undefined,
      );
      if (result !== undefined && result.toString() != condition.matchValue)
        metadataConditionAccepts = false;
    });
  }

  let viewMode = true, numberOfEntities = true;

  const activeViewMode = item.actionContext.activeViewMode;
  if (activeViewMode)
    viewMode = useEditHelper.isEdit
      ? activeViewMode.includes(ActionContextViewModeTypes.EditMode)
      : activeViewMode.includes(ActionContextViewModeTypes.ReadMode);

  const entitiesSelectionType = item.actionContext.entitiesSelectionType;
  if (entitiesSelectionType)
    numberOfEntities = itemsSelected
      ? entitiesSelectionType === ActionContextEntitiesSelectionType.SomeSelected
      : entitiesSelectionType === ActionContextEntitiesSelectionType.NoneSelected;

  const isActive = viewMode && numberOfEntities;
  return isActive && metadataConditionAccepts;
};