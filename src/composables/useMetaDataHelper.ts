import type { MediaFile, MetadataField } from "@/queries";
import { ref } from "vue";

const metaDataPatchList = ref<any>({});
const lastAdjustedMediaFileMetaData = ref<any>();
const mediafiles = ref<MediaFile[]>([]);
export const selectedRelationFieldMetadata = ref([]);
export const beingAdded = ref<string>("");
const relationsToBeDeleted = ref<{ entityId: string, relations: Array<any>}>({
  entityId: '',
  relations: []
});

const useMetaDataHelper = () => {
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

  const shouldAddMetaData = (id: string, alreadyAdded: MetadataField[]): boolean => {
    if (!(alreadyAdded && alreadyAdded[0])) {
      return true;
    }
    for (let i = 0; i < alreadyAdded.length; i++) {
      if (id === alreadyAdded[i].value.key) {
        return false;
      }
    }
    return true;
  }

  const determineIfNotAdded = (entity: any, mediafiles: MediaFile[], metadata: MetadataField[]): boolean => {
    let alreadyAdded: MediaFile[] | MetadataField[];

    if (beingAdded.value === "") {
      return true;
    }

    if (beingAdded.value === "mediafile"){
      alreadyAdded = mediafiles;
      return shouldAddMediafile(entity.uuid, alreadyAdded);
    } else {
      alreadyAdded = Object.values(metadata)[3];
      return shouldAddMetaData(entity.uuid, alreadyAdded);
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
    relationsToBeDeleted
  };
};

export default useMetaDataHelper;
