import type { MediaFile, MetadataField, MetadataRelation, RelationField } from "@/queries";
import { ref } from "vue";

const metaDataPatchList = ref<any>({});
const lastAdjustedMediaFileMetaData = ref<any>();
const mediafiles = ref<MediaFile[]>([]);
export const selectedRelationFieldMetadata = ref<any[]>([]);
export const beingAdded = ref<string>("");
const relationsToBeDeleted = ref<{ entityId: string, relations: Array<any>}>({
  entityId: '',
  relations: []
});

const metadataToBePatched = ref<{ entityId: string, metadata: Array<any>}>({
  entityId: '',
  metadata: []
});

const useMetaDataHelper = () => {

  const resetRelationsToBeDeleted = () => {
    relationsToBeDeleted.value = {
      entityId: '',
      relations: []
    }
  }

  const resetMetadataToBePatched = () => {
    metadataToBePatched.value = {
      entityId: '',
      metadata: []
    }
  }

  const addTowardsMetadataToBePatched = (entityId: string, metadataEntityUuid: any) => {
    if (!metadataToBePatched.value.metadata.some((v: any) => v === metadataEntityUuid)) {
      metadataToBePatched.value.entityId = entityId;
      metadataToBePatched.value.metadata.push(metadataEntityUuid);
    }
  }

  const clearMediafiles = (): void => {
    mediafiles.value = [];
  };

  const clearMediaFilesToPatch = (): void => {
    metaDataPatchList.value = {};
    lastAdjustedMediaFileMetaData.value = {};
  };

  const addOrUpdateList = (mediafileId: string, mediaFileInput: any) => {
    if (mediafileId && mediaFileInput && mediaFileInput.length > 0) {
      const adjustedMediaFileInput = [...mediaFileInput].map((x: any) =>
        Object.assign({}, x, { __typename: "MediaFileMetadata" })
      );
      lastAdjustedMediaFileMetaData.value = {
        mediafileId: mediafileId,
        mediaFileInput: adjustedMediaFileInput,
      };
      metaDataPatchList.value[mediafileId] = {
        mediafileId: mediafileId,
        mediaFileInput: mediaFileInput,
      };
    }
  };

  const removeFromMetaDataPatchList = (mediafileId: string) => {
    delete metaDataPatchList.value[mediafileId];
  };

  const shouldAddMediafile = (id: string, alreadyAdded: MediaFile[]):boolean => {
    if (!(alreadyAdded && alreadyAdded[0])) {
      return true;
    }

    for (let i = 0; i < alreadyAdded.length; i++) {
      if (id === alreadyAdded[i]._id) {
        return false;
      }
    }
    return true;
  }

  const shouldAddMetaData = (id: string, alreadyAdded: MetadataRelation[]): boolean => {
    if (!(alreadyAdded && alreadyAdded[0])) {
      return true;
    }
    for (let i = 0; i < alreadyAdded.length; i++) {
      if (id === alreadyAdded[i].key) {
        return false;
      }
    }
    return true;
  }

  const determineIfNotAdded = (entity: any, mediafiles: MediaFile[], relations: MetadataRelation[]): boolean => {
    if (beingAdded.value === "") {
      return true;
    }

    if (beingAdded.value === "mediafile"){
      return shouldAddMediafile(entity.uuid, mediafiles);
    } else {
      return shouldAddMetaData(entity.uuid, relations);
    }
  };

  return {
    clearMediafiles,
    clearMediaFilesToPatch,
    metaDataPatchList,
    addOrUpdateList,
    removeFromMetaDataPatchList,
    lastAdjustedMediaFileMetaData,
    mediafiles,
    determineIfNotAdded,
    selectedRelationFieldMetadata,
    beingAdded,
    relationsToBeDeleted,
    resetRelationsToBeDeleted,
    metadataToBePatched,
    resetMetadataToBePatched,
    addTowardsMetadataToBePatched
  };
};

export default useMetaDataHelper;
