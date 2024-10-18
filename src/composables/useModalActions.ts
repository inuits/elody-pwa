import {
  ActionType,
  type BaseRelationValuesInput,
  BulkOperationTypes,
  Collection,
  EditStatus,
  RouteNames,
} from "@/generated-types/queries";
import { ref } from "vue";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";

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

  const getArgumentsForEndpointInGraphql = (): { parentId: string } => {
    return {
      parentId: parentId.value,
    };
  };

  const getArgumentsForReorderEntities = (): { parentId: string } => {
    return parentId.value;
  };

  const getArgumentsForSubmitExtraMetadata = (): { parentId: string } => {
    return savedSearchInformation.value;
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
    bulkoperationType: BulkOperationTypes
  ): void => {
    parentId.value = parent;
    relationType.value = relation;
    collection.value = col;
    callbackFunction.value = callbackFn;
    bulkOperationType.value = bulkoperationType;
  };
  const initializePropertiesForDownload = (
    enqueuedItems,
    context: any
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

  const getParentId = () => {
    return parentId.value;
  };
  const getBulkOperationType = () => {
    return bulkOperationType.value;
  };
  const getCallbackFunction = () => {
    return callbackFunction.value;
  };

  return {
    extractActionArguments,
    initializeGeneralProperties,
    initializePropertiesForDownload,
    initializePropertiesForCreateEntity,
    initializePropertiesForSavedSearch,
    getParentId,
    getBulkOperationType,
    getCallbackFunction,
  };
};
