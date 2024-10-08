import { BulkOperationTypes, Collection } from "@/generated-types/queries";
import { ref } from "vue";
import { InBulkProcessableItem } from "@/composables/useBulkOperations";


//Flow executin
const actionFlow = ref<BulkOperationTypes | undefined>(undefined);
const executeActionFn = ref<Function | undefined>(undefined);

//General information for actions
const parentId = ref<string | undefined>(undefined);
const relationType = ref<string | undefined>(undefined);
const collection = ref<Collection | undefined>(undefined);
const callbackFunction = ref<Function | undefined>(undefined);

//Specific for DownloadAction
export type DownloadMediafilesInformation = {
  mediafiles: [];
  entities: [];
  includeAssetCsv: boolean;
};
const downloadMediafilesInformation = ref<DownloadMediafilesInformation | undefined>(undefined);


export const useActionBarActions = () => {

  const initializeAction = (newActionFlow: BulkOperationTypes): void => {
    actionFlow.value = newActionFlow;

    const actionObject: {
      [key: BulkOperationTypes]: {
        startExecuteActionFn: Function
      };
    } = {
      [BulkOperationTypes.AddRelation]: {
        startExecuteActionFn: () => addRelation(),
      },
      [BulkOperationTypes.CreateEntity]: {
        startExecuteActionFn: () => createEntity(),
      },
      [BulkOperationTypes.DownloadMediafiles]: {
        startExecuteActionFn: () => downloadMediafiles(),
      },
      [BulkOperationTypes.Edit]: {
        startExecuteActionFn: () => edit(),
      },
      [BulkOperationTypes.ExportCsv]: {
        startExecuteActionFn: () => exportCsv(),
      },
      [BulkOperationTypes.ExportCsvOfMediafilesFromAsset]: {
        startExecuteActionFn: () => exportCsvOfMediafilesFromAsset(),
      },
      [BulkOperationTypes.ReorderEntities]: {
        startExecuteActionFn: () => reorderEntities(),
      },
      [BulkOperationTypes.StartOcr]: {
        startExecuteActionFn: () => startOcr(),
      },
    };
    executeActionFn.value = actionObject[actionFlow.value].startExecuteActionFn;
  };

  const initializeGeneralProperties = (
    parentId: string,
    relationType: string,
    collection: Collection,
    callbackFunction: Function,
  ): void => {
    self.parentId.value = parentId;
    self.relationType.value = relationType;
    self.collection.value = collection;
    self.callbackFunction.value = callbackFunction;
  };

  const initializePropertiesForDownload = (
    mediafiles: [],
    entities: [],
    inludeAssetCsv: boolean,
  ): void => {
    downloadMediafilesInformation.value = {
      mediafiles: mediafiles,
      entities: entities,
      inludeAssetCsv: inludeAssetCsv,
    }
  };


}