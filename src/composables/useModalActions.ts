import {
  ActionType,
  type BaseRelationValuesInput,
  Collection,
  EditStatus,
  RouteNames
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

const downloadMediafilesInformation = ref<DownloadMediafilesInformation | undefined>(undefined);
const savedSearchInformation = ref<any | undefined>(undefined);


export const useModalActions = () => {

  const submitActionFunction = (): boolean => {
    if (callbackFunction.value)
      callbackFunction.value();
    return callbackFunction.value;
  };

  const downloadActionFunction = (): any =>  {
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
    }
  }

  const startOcrActionFunction = (): any =>  {
    return {
      id: parentId.value,
      collection: collection.value,
    };
  }

  const callEndpointInGraphql = (): any =>  {
    return {
      parentId: parentId.value,
    }
  }

  const reorderEntitiesWithCsvUpload = (): any =>  {
    return parentId.value;
  }

  const submitWithExtraMetadata = (): any =>  {
    return savedSearchInformation.value;
  }


  const startExecuteActionFn = (actionType: ActionType): any => {
    const actionObject: {
      [key: ActionType]: {
        startExecuteActionFn: Function
      };
    } = {
      [ActionType.Submit]: {
        startExecuteActionFn: () => submitActionFunction(),
      },
      [ActionType.Download]: {
        startExecuteActionFn: () => downloadActionFunction(),
      },
      [ActionType.Ocr]: {
        startExecuteActionFn: () => startOcrActionFunction(),
      },
      [ActionType.Endpoint]: {
        startExecuteActionFn: () => callEndpointInGraphql(),
      },
      [ActionType.UploadCsvForReordening]: {
        startExecuteActionFn: () => reorderEntitiesWithCsvUpload(),
      },
      [ActionType.SubmitWithExtraMetadata]: {
        startExecuteActionFn: () => submitWithExtraMetadata(),
      }
    };
    return actionObject[actionType].startExecuteActionFn();
  };

  const initializeGeneralProperties = (
    parent: string,
    relation: string,
    col: Collection,
    callbackFn: Function,
  ): void => {
    parentId.value = parent;
    relationType.value = relation;
    collection.value = col;
    callbackFunction.value = callbackFn;
  };

  const initializePropertiesForDownload = (
    enqueuedItems,
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
    }
  };

  const initializePropertiesForSavedSearch = (savedSearchInfo: any): void => {
    savedSearchInformation.value = savedSearchInfo;
  };

  return {
    startExecuteActionFn,
    initializeGeneralProperties,
    initializePropertiesForDownload,
    initializePropertiesForSavedSearch
  }

}