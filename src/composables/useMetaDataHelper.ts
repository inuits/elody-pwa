import { MediaFile } from '@/queries';
import { ref } from 'vue';

const metaDataPatchList = ref<any>({});
const lastAdjustedMediaFileMetaData = ref<any>();
const mediafiles = ref<MediaFile[]>([]);


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
      const adjustedMediaFileInput = [...mediaFileInput].map((x:any) => Object.assign({}, x, { __typename: "MediaFileMetadata" }));
      lastAdjustedMediaFileMetaData.value  = {mediafileId:mediafileId, mediaFileInput:adjustedMediaFileInput};
      metaDataPatchList.value[mediafileId] = {mediafileId:mediafileId, mediaFileInput:mediaFileInput};
    }
  };

  const removeFromMetaDataPatchList = (mediafileId: string) => {
    delete metaDataPatchList.value[mediafileId];
  };

  return {
    clearMediafiles,
    clearMediaFilesToPatch,
    metaDataPatchList,
    addOrUpdateList,
    removeFromMetaDataPatchList,
    lastAdjustedMediaFileMetaData,
    mediafiles
  };
};

export default useMetaDataHelper;
