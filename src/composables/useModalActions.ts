import type { BulkOperationTypes, Collection } from "@/generated-types/queries";
import {
  ActionType,
  type BaseRelationValuesInput,
  EditStatus,
  RouteNames,
} from "@/generated-types/queries";
import { ref } from "vue";
import {
  BulkOperationsContextEnum,
  type InBulkProcessableItem,
} from "@/composables/useBulkOperations";

export type DownloadMediafilesInformation = {
  mediafiles: [];
  entities: [];
  includeAssetCsv: boolean;
};

const parentId = ref<string | undefined>(undefined);
const relationType = ref<string | undefined>(undefined);
const collection = ref<Collection | undefined>(undefined);
const callbackFunction = ref<Function | undefined>(undefined);
const bulkOperationType = ref<BulkOperationTypes | undefined>(undefined);

const downloadMediafilesInformation = ref<
  DownloadMediafilesInformation | undefined
>(undefined);
const savedSearchInformation = ref<any | undefined>(undefined);
const deletionInformation = ref<{ title: string } | undefined>(undefined);
const skipItemsWithRelationDuringBulkDelete = ref<string[] | undefined>(undefined);

export const useModalActions = () => {
  const getArgumentsForSubmit = (): BaseRelationValuesInput[] | Function => {
    const relations: BaseRelationValuesInput[] = [];
    if (parentId.value !== undefined) {
      relations.push({
        key: parentId.value,
        type: relationType.value,
        editStatus: EditStatus.New,
      });
      parentId.value = undefined;
      return relations;
    }

    return callbackFunction.value;
  };

  const getArgumentsForDownload = (): {
    relations: BaseRelationValuesInput[];
    entities: [];
    mediafiles: [];
    includeAssetCsv: boolean;
  } => {
    const relations: BaseRelationValuesInput[] = [];
    downloadMediafilesInformation.value.mediafiles.forEach((mediafile) => {
      relations.push({
        key: mediafile,
        type: relationType.value,
        editStatus: EditStatus.New,
      });
    });
    downloadMediafilesInformation.value.entities.forEach((entity) => {
      relations.push({
        key: entity,
        type: relationType.value,
        editStatus: EditStatus.New,
      });
    });
    return {
      relations: relations,
      entities: downloadMediafilesInformation.value.entities,
      mediafiles: downloadMediafilesInformation.value.mediafiles,
      includeAssetCsv: downloadMediafilesInformation.value.includeAssetCsv,
    };
  };

  const getArgumentsForStartOcr = (): {
    id: string;
    collection: Collection;
  } => {
    return {
      id: parentId.value,
      collection: collection.value,
    };
  };

  const getArgumentsForEndpointInGraphql = (): {
    parentId: string | undefined;
  } => {
    return {
      parentId: parentId.value,
    };
  };

  const getArgumentsForReorderEntities = (): { parentId: string } => {
    return parentId.value;
  };

  const getArgumentsForSubmitExtraMetadata = (): {
    savedSearchInformation: string;
  } => {
    return savedSearchInformation.value;
  };

  const getInformationForDelete = (): { title: string } | undefined => {
    return deletionInformation.value;
  };

  const getInformationForBulkDeleteEntities = (): string[] | undefined => {
    return skipItemsWithRelationDuringBulkDelete.value;
  };

  const extractActionArguments = (actionType: ActionType): any => {
    const actionObject: {
      [key: ActionType]: {
        extractActionArguments: Function;
      };
    } = {
      [ActionType.Submit]: {
        extractActionArguments: () => getArgumentsForSubmit(),
      },
      [ActionType.SubmitWithUpload]: {
        extractActionArguments: () => getArgumentsForSubmit(),
      },
      [ActionType.Download]: {
        extractActionArguments: () => getArgumentsForDownload(),
      },
      [ActionType.Ocr]: {
        extractActionArguments: () => getArgumentsForStartOcr(),
      },
      [ActionType.Endpoint]: {
        extractActionArguments: () => getArgumentsForEndpointInGraphql(),
      },
      [ActionType.UploadCsvForReordening]: {
        extractActionArguments: () => getArgumentsForReorderEntities(),
      },
      [ActionType.SubmitWithExtraMetadata]: {
        extractActionArguments: () => getArgumentsForSubmitExtraMetadata(),
      },
    };
    return actionObject[actionType].extractActionArguments();
  };

  const initializeGeneralProperties = (
    parent: string,
    relation: string,
    col: Collection,
    callbackFn: Function,
    bulkoperationType: BulkOperationTypes,
  ): void => {
    parentId.value = parent;
    relationType.value = relation;
    collection.value = col;
    callbackFunction.value = callbackFn;
    bulkOperationType.value = bulkoperationType;
  };

  const initializePropertiesForDownload = (
    enqueuedItems: InBulkProcessableItem[],
    context: any,
  ): void => {
    const isMediafileArray =
      context === RouteNames.Mediafile ||
      context === RouteNames.Mediafiles ||
      context === BulkOperationsContextEnum.EntityElementMedia;
    downloadMediafilesInformation.value = {
      mediafiles: isMediafileArray ? enqueuedItems.map((item) => item.id) : [],
      entities: !isMediafileArray ? enqueuedItems.map((item) => item.id) : [],
      includeAssetCsv: context !== RouteNames.Mediafile,
    };
  };

  const initializePropertiesForCreateEntity = (): void => {
    if (!parentId.value) callbackFunction.value = undefined;
  };

  const initializePropertiesForSavedSearch = (savedSearchInfo: any): void => {
    savedSearchInformation.value = savedSearchInfo;
  };

  const initializePropertiesForDeletion = (title: string): void => {
    deletionInformation.value = { title: title };
  };

  const initializePropertiesForBulkDeleteRelations = (
    newRelationType: string,
  ): void => {
    relationType.value = newRelationType;
  };

  const initializePropertiesForBulkDeleteEntities = (
    newSkipItemsWithRelationDuringBulkDelete: string[],
  ): void => {
    skipItemsWithRelationDuringBulkDelete.value = newSkipItemsWithRelationDuringBulkDelete;
  };

  const getParentId = () => {
    return parentId.value;
  };

  const getBulkOperationType = () => {
    return bulkOperationType.value;
  };

  const getCallbackFunction = () => {
    return callbackFunction.value;
  };

  const getRelationType = () => relationType.value;

  const getCollection = () => collection.value;

  const setCallbackFunction = (callback: Function) => {
    callbackFunction.value = callback;
  };

  const resetAllProperties = () => {
    parentId.value = undefined;
    relationType.value = undefined;
    collection.value = undefined;
    callbackFunction.value = undefined;
    bulkOperationType.value = undefined;
    downloadMediafilesInformation.value = undefined;
    savedSearchInformation.value = undefined;
    skipItemsWithRelationDuringBulkDelete.value = undefined;
  };

  return {
    extractActionArguments,
    initializeGeneralProperties,
    initializePropertiesForDownload,
    initializePropertiesForCreateEntity,
    initializePropertiesForSavedSearch,
    initializePropertiesForDeletion,
    initializePropertiesForBulkDeleteRelations,
    initializePropertiesForBulkDeleteEntities,
    getParentId,
    getBulkOperationType,
    getCallbackFunction,
    getInformationForDelete,
    getInformationForBulkDeleteEntities,
    setCallbackFunction,
    getRelationType,
    getCollection,
    resetAllProperties,
  };
};
